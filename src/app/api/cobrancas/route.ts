import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import { asaasService } from '@/services/asaasService'
import { testAsaasConnection } from '@/lib/test-asaas'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Construir filtros baseado no tipo de usuário
    const where: any = {}
    
    if (user.type === 'FRANQUEADO') {
      where.franqueadoId = user.franqueadoId
    } else if (user.type === 'FRANQUEADORA') {
      // Franqueadora pode ver cobranças de todos os seus franqueados
      where.franqueado = {
        franqueadoraId: user.franqueadoraId
      }
    } else if (user.type === 'ESTABELECIMENTO') {
      where.estabelecimentoId = user.estabelecimentoId
    }

    const cobrancas = await prisma.cobrancas.findMany({
      where,
      select: {
        id: true,
        valor: true,
        status: true,
        tipo: true,
        vencimento: true,
        urlPagamento: true,
        pixQrCode: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true,
        asaasChargeId: true,
        estabelecimento: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        franqueado: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Resposta de cobrancas:', {
      cobrancas: cobrancas.length,
      userType: user.type,
      structure: {
        success: true,
        data: {
          cobrancas: cobrancas.map(c => ({ id: c.id, tipo: c.tipo, status: c.status }))
        }
      }
    })

    return successResponse({
      cobrancas
    }, 'Cobranças listadas com sucesso')

  } catch (error) {
    console.error('Erro ao listar cobranças:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Apenas FRANQUEADO pode gerar cobrança de estabelecimento
    if (user.type !== 'FRANQUEADO') {
      return forbiddenResponse('Apenas franqueados podem gerar cobranças de estabelecimento')
    }

    const body = await request.json()
    const { estabelecimentoId } = body

    if (!estabelecimentoId) {
      return errorResponse('ID do estabelecimento é obrigatório', null, 400)
    }

    // Verificar se o estabelecimento pertence ao franqueado
    const estabelecimento = await prisma.estabelecimentos.findFirst({
      where: {
        id: estabelecimentoId,
        franqueadoId: user.franqueadoId
      },
      include: {
        franqueados: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            asaasCustomerId: true
          }
        }
      }
    })

    if (!estabelecimento) {
      return errorResponse('Estabelecimento não encontrado ou não pertence ao franqueado', null, 404)
    }

    // Verificar se já existe uma cobrança para este estabelecimento
    const cobrancaExistente = await prisma.cobrancas.findFirst({
      where: {
        estabelecimentoId,
        tipo: 'TAXA_ESTABELECIMENTO',
        status: {
          in: ['PENDING', 'PAID']
        }
      }
    })

    if (cobrancaExistente) {
      return errorResponse('Já existe uma cobrança para este estabelecimento', null, 400)
    }

    const franqueado = estabelecimento.franqueados

    // Valor fixo de R$ 500,00 para taxa de estabelecimento
    const valor = 500.00
    const vencimento = new Date()
    vencimento.setDate(vencimento.getDate() + 30) // Vencimento em 30 dias

    let asaasChargeId: string | null = null
    let urlPagamento: string | null = null
    let pixQrCode: string | null = null
    let asaasCustomerId = franqueado.asaasCustomerId

    try {
      // Testar conexão com Asaas
      const connectionOk = await testAsaasConnection()
      console.log('🧪 Testando conexão Asaas...')
      console.log('Teste de conexão Asaas (cobrança):', connectionOk ? 'OK' : 'FALHOU')
      
      if (connectionOk) {
        // Se o franqueado não tem asaasCustomerId, criar/buscar no Asaas
        if (!asaasCustomerId) {
          console.log('🔄 Franqueado sem asaasCustomerId, criando/buscando no Asaas...')
          
          try {
            // Primeiro, tentar buscar o customer existente pelo CNPJ
            const existingCustomer = await asaasService.getCustomerByCpfCnpj(franqueado.cnpj)
            
            if (existingCustomer) {
              console.log('✅ Customer existente encontrado no Asaas:', existingCustomer.id)
              asaasCustomerId = existingCustomer.id
            } else {
              console.log('➕ Criando novo customer no Asaas...')
              // Criar novo customer no Asaas
              const newCustomer = await asaasService.createCustomer({
                name: franqueado.name,
                cpfCnpj: franqueado.cnpj,
                email: franqueado.email,
                phone: franqueado.phone,
                mobilePhone: franqueado.phone
              })
              
              console.log('✅ Novo customer criado no Asaas:', newCustomer.id)
              asaasCustomerId = newCustomer.id
            }
            
            // Atualizar o franqueado com o asaasCustomerId
            if (asaasCustomerId) {
              await prisma.franqueados.update({
                where: { id: franqueado.id },
                data: { asaasCustomerId }
              })
              console.log('✅ Franqueado atualizado com asaasCustomerId:', asaasCustomerId)
            }
            
          } catch (customerError) {
            console.error('❌ Erro ao criar/buscar customer no Asaas:', customerError)
            asaasCustomerId = null
          }
        }
        
        // Se temos um asaasCustomerId, criar a cobrança
        if (asaasCustomerId) {
          console.log('💳 Criando cobrança no Asaas para customer:', asaasCustomerId)
        
        // Criar cobrança no Asaas (boleto)
        const asaasCharge = await asaasService.createCharge({
          customer: asaasCustomerId,
          billingType: 'BOLETO', // Boleto bancário
          value: valor,
          dueDate: vencimento.toISOString().split('T')[0], // Format: YYYY-MM-DD
          description: `Taxa de Ativação - Estabelecimento: ${estabelecimento.name}`,
          externalReference: estabelecimento.id,
          fine: {
            value: 2.0 // Multa de 2% após vencimento
          },
          interest: {
            value: 1.0 // Juros de 1% ao mês
          }
        })

        console.log('🎯 Resposta completa do Asaas:', JSON.stringify(asaasCharge, null, 2))

        if (asaasCharge && asaasCharge.id) {
          asaasChargeId = asaasCharge.id
          urlPagamento = asaasCharge.bankSlipUrl || asaasCharge.invoiceUrl || null
          
          // Para PIX, tentar obter o QR Code
          if (asaasCharge.pixTransaction?.qrCode?.payload) {
            pixQrCode = asaasCharge.pixTransaction.qrCode.payload
          }
          
          console.log('✅ Cobrança criada no Asaas:', {
            id: asaasChargeId,
            bankSlipUrl: asaasCharge.bankSlipUrl,
            invoiceUrl: asaasCharge.invoiceUrl,
            urlPagamento,
            pixQrCode,
            status: asaasCharge.status
          })
        } else {
          console.warn('⚠️ Resposta do Asaas sem ID:', asaasCharge)
        }
        } else {
          console.warn('⚠️ Não foi possível obter/criar asaasCustomerId')
        }
      } else {
        console.log('⚠️ Conexão com Asaas falhou - cobrança será criada apenas localmente')
      }
    } catch (asaasError) {
      console.error('❌ Erro ao processar cobrança no Asaas:', asaasError)
      // Não falha a criação da cobrança se o Asaas falhar
    }

    // Criar cobrança no banco de dados
    const cobranca = await prisma.cobrancas.create({
      data: {
        id: crypto.randomUUID(),
        estabelecimentoId,
        franqueadoId: user.franqueadoId!,
        asaasChargeId,
        valor,
        status: 'PENDING',
        tipo: 'TAXA_ESTABELECIMENTO',
        vencimento,
        urlPagamento,
        pixQrCode,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        estabelecimento: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        franqueado: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        }
      }
    })

    console.log('💾 Cobrança salva no banco:', {
      id: cobranca.id,
      asaasChargeId,
      urlPagamento,
      pixQrCode,
      asaasCustomerId
    })

    return successResponse({
      cobranca,
      asaasInfo: {
        asaasChargeId,
        urlPagamento,
        pixQrCode,
        hasAsaasIntegration: !!asaasChargeId,
        asaasCustomerId
      },
      message: asaasChargeId 
        ? 'Cobrança gerada com sucesso no Asaas e registrada no sistema'
        : 'Cobrança registrada no sistema (Asaas indisponível)'
    }, 'Cobrança de estabelecimento gerada com sucesso')

  } catch (error) {
    console.error('Erro ao gerar cobrança:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
