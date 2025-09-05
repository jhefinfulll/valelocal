import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { asaasService } from '@/services/asaasService'

/**
 * @swagger
 * /api/estabelecimentos/{id}/pagamento:
 *   get:
 *     tags:
 *       - Estabelecimentos
 *     summary: Consultar status de pagamento de ativação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do pagamento
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id: estabelecimentoId } = await params

    // Verificar se o estabelecimento existe e se o usuário tem permissão
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id: estabelecimentoId },
      include: {
        franqueados: true,
        cobrancas: {
          where: {
            tipo: 'ATIVACAO_ESTABELECIMENTO',
            status: { in: ['PENDING', 'PAID'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!estabelecimento) {
      return errorResponse('Estabelecimento não encontrado', null, 404)
    }

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && estabelecimento.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Você não tem permissão para acessar este estabelecimento')
    }

    if (user.type === 'ESTABELECIMENTO' && estabelecimento.id !== user.estabelecimentoId) {
      return forbiddenResponse('Você não tem permissão para acessar este estabelecimento')
    }

    // Se não há cobrança pendente, retornar status ativo
    if (!estabelecimento.cobrancas.length || estabelecimento.status === 'ATIVO') {
      return successResponse({
        status: 'ATIVO',
        estabelecimento: {
          id: estabelecimento.id,
          name: estabelecimento.name,
          status: estabelecimento.status,
        },
        pagamento: null
      }, 'Estabelecimento já está ativo')
    }

    const cobranca = estabelecimento.cobrancas[0]

    // Consultar status atualizado no ASAAS
    if (cobranca.asaasChargeId) {
      try {
        const asaasCharge = await asaasService.getCharge(cobranca.asaasChargeId)
        
        // Atualizar status da cobrança se mudou
        if (asaasCharge.status === 'RECEIVED' || asaasCharge.status === 'CONFIRMED') {
          await prisma.$transaction(async (tx) => {
            // Atualizar cobrança
            await tx.cobrancas.update({
              where: { id: cobranca.id },
              data: {
                status: 'PAID',
                paidAt: new Date(),
                updatedAt: new Date()
              }
            })

            // Ativar estabelecimento
            await tx.estabelecimentos.update({
              where: { id: estabelecimentoId },
              data: {
                status: 'ATIVO',
                ativadoEm: new Date(),
                updatedAt: new Date()
              }
            })
          })

          return successResponse({
            status: 'ATIVO',
            estabelecimento: {
              id: estabelecimento.id,
              name: estabelecimento.name,
              status: 'ATIVO',
            },
            pagamento: {
              status: 'PAID',
              paidAt: new Date(),
            }
          }, 'Pagamento confirmado! Estabelecimento ativado com sucesso.')
        }

        // Verificar se expirou
        if (asaasCharge.status === 'OVERDUE') {
          await prisma.cobrancas.update({
            where: { id: cobranca.id },
            data: {
              status: 'EXPIRED',
              updatedAt: new Date()
            }
          })

          return successResponse({
            status: 'PENDENTE_PAGAMENTO',
            estabelecimento: {
              id: estabelecimento.id,
              name: estabelecimento.name,
              status: estabelecimento.status,
            },
            pagamento: {
              status: 'EXPIRED',
              valor: Number(cobranca.valor),
              vencimento: cobranca.vencimento,
              urlPagamento: cobranca.urlPagamento,
              pixQrCode: cobranca.pixQrCode,
              needsNewCharge: true
            }
          }, 'Pagamento vencido. É necessário gerar nova cobrança.')
        }

      } catch (asaasError) {
        console.error('Erro ao consultar ASAAS:', asaasError)
        // Continuar com os dados locais se der erro na consulta do ASAAS
      }
    }

    // Retornar status atual da cobrança
    return successResponse({
      status: estabelecimento.status,
      estabelecimento: {
        id: estabelecimento.id,
        name: estabelecimento.name,
        status: estabelecimento.status,
      },
      pagamento: {
        status: cobranca.status,
        valor: Number(cobranca.valor),
        vencimento: cobranca.vencimento,
        urlPagamento: cobranca.urlPagamento,
        pixQrCode: cobranca.pixQrCode,
        createdAt: cobranca.createdAt
      }
    }, 'Status do pagamento consultado com sucesso')

  } catch (error) {
    console.error('Erro ao consultar pagamento:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

/**
 * @swagger
 * /api/estabelecimentos/{id}/pagamento:
 *   post:
 *     tags:
 *       - Estabelecimentos
 *     summary: Gerar nova cobrança para ativação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nova cobrança gerada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id: estabelecimentoId } = await params

    // Verificar se o estabelecimento existe e se o usuário tem permissão
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id: estabelecimentoId },
      include: {
        franqueados: true,
      }
    })

    if (!estabelecimento) {
      return errorResponse('Estabelecimento não encontrado', null, 404)
    }

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && estabelecimento.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Você não tem permissão para acessar este estabelecimento')
    }

    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem gerar cobranças')
    }

    // Verificar se o estabelecimento precisa de pagamento
    if (estabelecimento.status === 'ATIVO') {
      return errorResponse('Estabelecimento já está ativo', null, 400)
    }

    // Cancelar cobranças pendentes anteriores
    await prisma.cobrancas.updateMany({
      where: {
        estabelecimentoId,
        tipo: 'ATIVACAO_ESTABELECIMENTO',
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })

    // Gerar nova cobrança
    const resultadoCobranca = await asaasService.criarCobrancaAtivacao({
      franqueadoId: estabelecimento.franqueadoId,
      estabelecimentoId,
      valorAtivacao: 150.00 // Taxa de ativação configurável
    })

    return successResponse({
      estabelecimento: {
        id: estabelecimento.id,
        name: estabelecimento.name,
        status: estabelecimento.status,
      },
      pagamento: {
        status: 'PENDING',
        valor: Number(resultadoCobranca.cobranca.valor),
        vencimento: resultadoCobranca.cobranca.vencimento,
        urlPagamento: resultadoCobranca.pagamento.invoiceUrl,
        pixQrCode: resultadoCobranca.pagamento.pixQrCode,
        instrucoes: [
          '1. Realize o pagamento da taxa de ativação',
          '2. O estabelecimento será ativado automaticamente após confirmação',
          '3. Você receberá um email de confirmação'
        ]
      }
    }, 'Nova cobrança gerada com sucesso')

  } catch (error) {
    console.error('Erro ao gerar nova cobrança:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
