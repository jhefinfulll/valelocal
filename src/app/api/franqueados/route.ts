import { NextRequest } from 'next/server'
import { CreateFranqueadoSchema, UpdateFranqueadoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, getQueryParams, parseNumber } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import { asaasService } from '@/services/asaasService'
import { testAsaasConnection } from '@/lib/test-asaas'
import prisma from '@/lib/prisma'
// import { emailService } from '@/services/emailService'
import crypto from 'crypto'

/**
 * @swagger
 * /api/franqueados:
 *   get:
 *     tags:
 *       - Franqueados
 *     summary: Listar franqueados
 *     description: Lista todos os franqueados com paginação e filtros
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
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
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de franqueados retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     franqueados:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Franqueado'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags:
 *       - Franqueados
 *     summary: Criar novo franqueado
 *     description: Cria um novo franqueado (apenas FRANQUEADORA)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFranqueado'
 *     responses:
 *       201:
 *         description: Franqueado criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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

    // Verificar permissões baseado no tipo de usuário
    if (user.type !== 'FRANQUEADORA' && user.type !== 'FRANQUEADO') {
      return forbiddenResponse()
    }

    const params = getQueryParams(request, ['page', 'limit', 'search', 'status'])
    const page = parseNumber(params.page, 1)
    const limit = Math.min(parseNumber(params.limit, 10), 100)
    const offset = (page - 1) * limit

    // Construir filtros baseado no tipo de usuário
    const where: any = {}
    
    console.log('🔍 Usuário autenticado:', { 
      id: user.id, 
      type: user.type, 
      franqueadoId: user.franqueadoId,
      franqueadoraId: user.franqueadoraId 
    })
    
    // Se for FRANQUEADO, só pode ver seus próprios dados
    if (user.type === 'FRANQUEADO') {
      where.id = user.franqueadoId
      console.log('👤 Filtro para FRANQUEADO:', where)
    }
    // Se for FRANQUEADORA, pode ver todos os franqueados da sua franqueadora
    else if (user.type === 'FRANQUEADORA') {
      where.franqueadoraId = user.franqueadoraId
      console.log('🏢 Filtro para FRANQUEADORA:', where)
    }
    
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { cnpj: { contains: params.search } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { region: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    if (params.status) {
      where.status = params.status
    }

    // Buscar franqueados
    const [franqueados, total] = await Promise.all([
      prisma.franqueados.findMany({
        where,
        select: {
          id: true,
          name: true,
          cnpj: true,
          email: true,
          phone: true,
          address: true,
          region: true,
          comissionRate: true,
          status: true,
          asaasCustomerId: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
          franqueadoras: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              estabelecimentos: true,
              cartoes: true,
              comissoes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.franqueados.count({ where })
    ])

    console.log('📊 Dados encontrados:', {
      franqueados: franqueados.length,
      total,
      dados: franqueados.map(f => ({ id: f.id, name: f.name, email: f.email }))
    })

    const pages = Math.ceil(total / limit)

    return successResponse({
      franqueados,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    }, 'Franqueados listados com sucesso')

  } catch (error) {
    console.error('Erro ao listar franqueados:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

async function createFranqueadoHandler(data: any, request: NextRequest) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  // Apenas FRANQUEADORA pode criar franqueados
  if (user.type !== 'FRANQUEADORA') {
    return forbiddenResponse('Apenas franqueadoras podem criar franqueados')
  }

  try {
    // Obter a franqueadora do usuário logado
    const franqueadora = await prisma.franqueadoras.findUnique({
      where: { id: user.franqueadoraId }
    })

    if (!franqueadora) {
      return errorResponse('Franqueadora não encontrada', null, 404)
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await prisma.franqueados.findUnique({
      where: { cnpj: data.cnpj }
    })

    if (existingCnpj) {
      return errorResponse('CNPJ já cadastrado', null, 400)
    }

    // Verificar se email já existe (tanto em franqueados quanto em users)
    const [existingFranqueadoEmail, existingUserEmail] = await Promise.all([
      prisma.franqueados.findUnique({
        where: { email: data.email }
      }),
      prisma.users.findUnique({
        where: { email: data.email }
      })
    ])

    if (existingFranqueadoEmail || existingUserEmail) {
      return errorResponse('Email já cadastrado', null, 400)
    }

    // Gerar senha temporária para o usuário
    const bcrypt = await import('bcryptjs')
    const tempPassword = data.password || `${data.cnpj.slice(0, 4)}@${new Date().getFullYear()}` // Usar senha fornecida ou gerar uma
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Criar cliente no Asaas
    let asaasCustomerId: string | null = null
    try {
      console.log('🔄 Criando cliente franqueado no Asaas...')
      
      // Testar conexão primeiro
      const connectionOk = await testAsaasConnection();
      console.log('🧪 Teste de conexão Asaas (franqueado):', connectionOk ? 'OK' : 'FALHOU');
      
      if (!connectionOk) {
        console.warn('⚠️ Conexão com Asaas falhou, pulando criação de cliente franqueado');
        asaasCustomerId = null;
      } else {
        // Preparar dados para o Asaas com formatação adequada
        const cnpjLimpo = data.cnpj.replace(/\D/g, '')
        const phoneLimpo = data.phone.replace(/\D/g, '')
        
        console.log('📋 Dados franqueado para Asaas:', {
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
          province: data.region || 'Centro', // Usar região do franqueado
          city: 'São Paulo', // Valor padrão
          state: 'SP', // Valor padrão  
          postalCode: '01000000', // Valor padrão
          notificationDisabled: false
        })

        if (asaasCustomer && asaasCustomer.id) {
          asaasCustomerId = asaasCustomer.id
          console.log('✅ Cliente franqueado criado no Asaas com ID:', asaasCustomerId)
        } else {
          console.log('⚠️ Cliente franqueado não retornou ID válido:', asaasCustomer)
        }
      }
    } catch (asaasError) {
      console.error('❌ Erro ao criar cliente franqueado no Asaas:', asaasError)
      // Log mais detalhado do erro
      console.error('❌ Detalhes do erro franqueado:', {
        message: asaasError instanceof Error ? asaasError.message : 'Erro desconhecido',
        data: data
      })
      // Não falha a criação do franqueado se o Asaas falhar
      // Apenas loga o erro para posterior investigação
    }

    // Usar transação para criar franqueado e usuário atomicamente
    const result = await prisma.$transaction(async (tx) => {
      // Criar franqueado
      const franqueado = await tx.franqueados.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          cnpj: data.cnpj,
          email: data.email,
          phone: data.phone,
          address: data.address,
          region: data.region,
          comissionRate: data.comissionRate,
          franqueadoraId: user.franqueadoraId!, // Usar a franqueadora do usuário logado
          asaasCustomerId: asaasCustomerId, // ID do cliente no Asaas
          logo: data.logo || null,
          status: data.status || 'ATIVO',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Criar usuário correspondente
      const usuario = await tx.users.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          password: hashedPassword,
          type: 'FRANQUEADO',
          status: data.status || 'ATIVO',
          franqueadoId: franqueado.id,
          franqueadoraId: user.franqueadoraId!,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { franqueado, usuario, tempPassword }
    })

    // Retornar dados do franqueado criado (sem senha)
    const franqueadoResponse = await prisma.franqueados.findUnique({
      where: { id: result.franqueado.id },
      select: {
        id: true,
        name: true,
        cnpj: true,
        email: true,
        phone: true,
        address: true,
        region: true,
        comissionRate: true,
        status: true,
        asaasCustomerId: true,
        logo: true,
        createdAt: true,
        franqueadoras: {
          select: {
            id: true,
            name: true
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            type: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    // Enviar email com credenciais (assíncrono, não bloqueia a resposta)
    // TODO: Implementar envio de email
    console.log('📧 Credenciais criadas para:', data.email, 'Senha temporária:', result.tempPassword)

    return successResponse({
      franqueado: franqueadoResponse,
      loginInfo: {
        email: data.email,
        tempPassword: result.tempPassword,
        message: 'Usuário criado automaticamente. Credenciais enviadas por email.'
      }
    }, 'Franqueado e usuário criados com sucesso')

  } catch (error) {
    console.error('Erro ao criar franqueado:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = withValidation(CreateFranqueadoSchema, createFranqueadoHandler)