import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/cobrancas/{id}/pay:
 *   patch:
 *     tags:
 *       - Cobranças
 *     summary: Marcar cobrança como paga
 *     description: Permite que franqueadora marque uma cobrança como paga manualmente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da cobrança
 *     responses:
 *       200:
 *         description: Cobrança marcada como paga com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Apenas FRANQUEADORA pode marcar cobranças como pagas
    if (user.type !== 'FRANQUEADORA') {
      return forbiddenResponse('Apenas franqueadoras podem marcar cobranças como pagas')
    }

    const { id: cobrancaId } = await params

    // Buscar a cobrança
    const cobranca = await prisma.cobrancas.findFirst({
      where: {
        id: cobrancaId,
        franqueado: {
          franqueadoraId: user.franqueadoraId // Só pode marcar cobranças dos seus franqueados
        }
      },
      include: {
        estabelecimento: {
          select: {
            id: true,
            name: true
          }
        },
        franqueado: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!cobranca) {
      return errorResponse('Cobrança não encontrada', null, 404)
    }

    // Verificar se a cobrança já está paga
    if (cobranca.status === 'PAID') {
      return errorResponse('Cobrança já está marcada como paga', null, 400)
    }

    // Verificar se a cobrança não está cancelada ou vencida
    if (cobranca.status === 'CANCELLED') {
      return errorResponse('Não é possível marcar cobrança cancelada como paga', null, 400)
    }

    // Marcar como paga
    const cobrancaAtualizada = await prisma.cobrancas.update({
      where: { id: cobrancaId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
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

    console.log(`✅ Cobrança ${cobrancaId} marcada como paga pela franqueadora ${user.franqueadoraId}`)

    return successResponse({
      cobranca: cobrancaAtualizada
    }, 'Cobrança marcada como paga com sucesso')

  } catch (error) {
    console.error('Erro ao marcar cobrança como paga:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
