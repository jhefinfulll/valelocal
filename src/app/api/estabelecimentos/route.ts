import { NextRequest } from 'next/server'
import { CreateEstabelecimentoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, getQueryParams, parseNumber } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import { asaasService } from '@/services/asaasService'
import { testAsaasConnection } from '@/lib/test-asaas'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

/**
 * @swagger
 * /api/estabelecimentos:
 *   get:
 *     tags:
 *       - Estabelecimentos
 *     summary: Listar estabelecimentos
 *     description: Lista estabelecimentos com paginação e filtros baseado nas permissões do usuário
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome, CNPJ ou email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, INATIVO]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: franqueadoId
 *         schema:
 *           type: string
 *         description: Filtrar por franqueado (apenas para FRANQUEADORA)
 *     responses:
 *       200:
 *         description: Lista de estabelecimentos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Estabelecimentos
 *     summary: Criar estabelecimento
 *     description: Cria um novo estabelecimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEstabelecimento'
 *     responses:
 *       201:
 *         description: Estabelecimento criado com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const params = getQueryParams(request, ['page', 'limit', 'search', 'status', 'category', 'franqueadoId'])
    const page = parseNumber(params.page, 1)
    const limit = Math.min(parseNumber(params.limit, 10), 100)
    const offset = (page - 1) * limit

    // Construir filtros baseado no tipo de usuário
    const where: any = {}

    // Filtros por permissão
    if (user.type === 'FRANQUEADO') {
      where.franqueadoId = user.franqueadoId
    } else if (user.type === 'ESTABELECIMENTO') {
      where.id = user.estabelecimentoId
    } else if (user.type === 'FRANQUEADORA') {
      // FRANQUEADORA pode ver todos, mas pode filtrar por franqueado
      if (params.franqueadoId) {
        where.franqueadoId = params.franqueadoId
      }
    }

    // Filtros gerais
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { cnpj: { contains: params.search } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.category) {
      where.category = { contains: params.category, mode: 'insensitive' }
    }

    // Buscar estabelecimentos
    const [estabelecimentos, total] = await Promise.all([
      prisma.estabelecimentos.findMany({
        where,
        select: {
          id: true,
          name: true,
          cnpj: true,
          email: true,
          phone: true,
          address: true,
          category: true,
          status: true,
          logo: true,
          franqueadoId: true,
          asaasId: true,
          createdAt: true,
          updatedAt: true,
          franqueados: {
            select: {
              id: true,
              name: true,
              region: true
            }
          },
          estabelecimento_coords: {
            select: {
              lat: true,
              lng: true
            }
          },
          _count: {
            select: {
              cartoes: true,
              transacoes: true,
              displays: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.estabelecimentos.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return successResponse({
      estabelecimentos,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    }, 'Estabelecimentos listados com sucesso')

  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

async function createEstabelecimentoHandler(data: any, request: NextRequest) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  // Verificar permissões
  if (user.type === 'ESTABELECIMENTO') {
    return forbiddenResponse('Estabelecimentos não podem criar outros estabelecimentos')
  }

  if (user.type === 'FRANQUEADO' && data.franqueadoId !== user.franqueadoId) {
    return forbiddenResponse('Você só pode criar estabelecimentos para sua própria franquia')
  }

  try {
    // Verificar se CNPJ já existe
    const existingCnpj = await prisma.estabelecimentos.findUnique({
      where: { cnpj: data.cnpj }
    })

    if (existingCnpj) {
      return errorResponse('CNPJ já cadastrado', null, 400)
    }

    // Verificar se email já existe
    const existingEmail = await prisma.estabelecimentos.findUnique({
      where: { email: data.email }
    })

    if (existingEmail) {
      return errorResponse('Email já cadastrado', null, 400)
    }

    // Verificar se o franqueado existe
    const franqueado = await prisma.franqueados.findUnique({
      where: { id: data.franqueadoId }
    })

    if (!franqueado) {
      return errorResponse('Franqueado não encontrado', null, 404)
    }

    // Criar cliente no Asaas
    let asaasId: string | null = null
    try {
      console.log('🔄 Criando cliente no Asaas...')
      
      // Testar conexão primeiro
      const connectionOk = await testAsaasConnection();
      console.log('🧪 Teste de conexão Asaas:', connectionOk ? 'OK' : 'FALHOU');
      
      if (!connectionOk) {
        console.warn('⚠️ Conexão com Asaas falhou, pulando criação de cliente');
        asaasId = null;
      } else {
        // Preparar dados para o Asaas com formatação adequada
        const cnpjLimpo = data.cnpj.replace(/\D/g, '')
        const phoneLimpo = data.phone.replace(/\D/g, '')
        
        console.log('📋 Dados para Asaas:', {
          name: data.name,
          cpfCnpj: cnpjLimpo,
          email: data.email,
          phone: phoneLimpo,
          address: data.address
        })
        
        const asaasCustomer = await asaasService.createCustomer({
          name: data.name,
          cpfCnpj: cnpjLimpo,
          email: data.email,
          phone: phoneLimpo,
          mobilePhone: phoneLimpo,
          address: data.address,
          addressNumber: 'S/N',
          complement: '',
          province: 'Centro', // Valor padrão
          city: 'São Paulo', // Valor padrão
          state: 'SP', // Valor padrão  
          postalCode: '01000000', // Valor padrão
          notificationDisabled: false
        })

        if (asaasCustomer && asaasCustomer.id) {
          asaasId = asaasCustomer.id
          console.log('✅ Cliente criado no Asaas com ID:', asaasId)
        } else {
          console.log('⚠️ Cliente não retornou ID válido:', asaasCustomer)
        }
      }
    } catch (asaasError) {
      console.error('❌ Erro ao criar cliente no Asaas:', asaasError)
      // Log mais detalhado do erro
      console.error('❌ Detalhes do erro:', {
        message: asaasError instanceof Error ? asaasError.message : 'Erro desconhecido',
        data: data
      })
      // Não falha a criação do estabelecimento se o Asaas falhar
      // Apenas loga o erro para posterior investigação
    }

    // Criar estabelecimento com status PENDENTE_PAGAMENTO se for franqueado, ATIVO se for franqueadora
    const statusInicial = user.type === 'FRANQUEADO' ? 'PENDENTE_PAGAMENTO' : 'ATIVO';
    
    const estabelecimento = await prisma.estabelecimentos.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone,
        address: data.address,
        category: data.category,
        franqueadoId: data.franqueadoId,
        logo: data.logo || null,
        status: statusInicial,
        asaasId: asaasId, // ID do cliente no Asaas
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Criar coordenadas se fornecidas
    if (data.coordinates) {
      await prisma.estabelecimento_coords.create({
        data: {
          id: crypto.randomUUID(),
          estabelecimentoId: estabelecimento.id,
          lat: data.coordinates.lat,
          lng: data.coordinates.lng
        }
      })
    }

    // Se foi um franqueado que criou o estabelecimento, gerar cobrança automática
    if (user.type === 'FRANQUEADO') {
      try {
        console.log('🎯 Gerando cobrança automática para franqueado:', user.franqueadoId)
        
        // Buscar dados do franqueado para a cobrança
        const franqueadoData = await prisma.franqueados.findUnique({
          where: { id: user.franqueadoId },
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            asaasCustomerId: true
          }
        })

        if (franqueadoData) {
          const valor = 500.00 // Taxa fixa de R$ 500,00
          const vencimento = new Date()
          vencimento.setDate(vencimento.getDate() + 30) // Vencimento em 30 dias

          let asaasChargeId: string | null = null
          let urlPagamento: string | null = null

          // Tentar criar cobrança no Asaas
          if (franqueadoData.asaasCustomerId) {
            try {
              console.log('🔄 Criando cobrança no Asaas para taxa de estabelecimento...')
              
              const asaasCharge = await asaasService.createCharge({
                customer: franqueadoData.asaasCustomerId,
                billingType: 'BOLETO',
                value: valor,
                dueDate: vencimento.toISOString().split('T')[0],
                description: `Taxa de Ativação - Estabelecimento: ${estabelecimento.name}`,
                externalReference: estabelecimento.id,
                fine: { value: 2.0 },
                interest: { value: 1.0 }
              })

              if (asaasCharge && asaasCharge.id) {
                asaasChargeId = asaasCharge.id
                urlPagamento = asaasCharge.bankSlipUrl || asaasCharge.invoiceUrl
                console.log('✅ Cobrança criada no Asaas:', asaasChargeId)
              }
            } catch (asaasError) {
              console.error('❌ Erro ao criar cobrança no Asaas:', asaasError)
            }
          }

          // Criar cobrança no banco de dados
          await prisma.cobrancas.create({
            data: {
              id: crypto.randomUUID(),
              estabelecimentoId: estabelecimento.id,
              franqueadoId: user.franqueadoId!,
              asaasChargeId,
              valor,
              status: 'PENDING',
              tipo: 'TAXA_ESTABELECIMENTO',
              vencimento,
              urlPagamento,
              pixQrCode: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          console.log('✅ Cobrança de estabelecimento criada automaticamente')
        }
      } catch (cobrancaError) {
        console.error('❌ Erro ao gerar cobrança automática:', cobrancaError)
        // Não falha a criação do estabelecimento se a cobrança falhar
      }
    }

    // Buscar estabelecimento completo para retornar
    const estabelecimentoCompleto = await prisma.estabelecimentos.findUnique({
      where: { id: estabelecimento.id },
      select: {
        id: true,
        name: true,
        cnpj: true,
        email: true,
        phone: true,
        address: true,
        category: true,
        status: true,
        logo: true,
        franqueadoId: true,
        asaasId: true,
        createdAt: true,
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        },
        estabelecimento_coords: {
          select: {
            lat: true,
            lng: true
          }
        }
      }
    })

    const mensagem = user.type === 'FRANQUEADO' 
      ? 'Estabelecimento criado com sucesso! Acesse "Gerenciar Pagamento" para ativar.'
      : 'Estabelecimento criado com sucesso!'

    return successResponse({
      estabelecimento: estabelecimentoCompleto
    }, mensagem)

  } catch (error) {
    console.error('Erro ao criar estabelecimento:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = withValidation(CreateEstabelecimentoSchema, createEstabelecimentoHandler)
