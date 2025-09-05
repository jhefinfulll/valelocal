import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/estabelecimentos/{id}/approve:
 *   patch:
 *     tags:
 *       - Estabelecimentos
 *     summary: Aprovar/Desaprovar estabelecimento
 *     description: Alterna o status do estabelecimento entre ATIVO e PENDENTE_PAGAMENTO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do estabelecimento
 *     responses:
 *       200:
 *         description: Status do estabelecimento alterado com sucesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Erro interno do servidor
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse('Token de autenticação inválido ou expirado')
    }

    // Apenas franqueadoras podem aprovar/desaprovar
    if (user.type !== 'FRANQUEADORA') {
      return forbiddenResponse('Apenas franqueadoras podem aprovar/desaprovar estabelecimentos')
    }

    const { id } = await params

    // Buscar estabelecimento
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id }
    })

    if (!estabelecimento) {
      return notFoundResponse('Estabelecimento não encontrado')
    }

    // Determinar o novo status
    let novoStatus: 'ATIVO' | 'PENDENTE_PAGAMENTO'
    let mensagem: string

    if (estabelecimento.status === 'PENDENTE_PAGAMENTO') {
      novoStatus = 'ATIVO'
      mensagem = 'Estabelecimento aprovado com sucesso'
    } else if (estabelecimento.status === 'ATIVO') {
      novoStatus = 'PENDENTE_PAGAMENTO'
      mensagem = 'Estabelecimento desaprovado com sucesso'
    } else {
      return errorResponse('Não é possível alterar o status deste estabelecimento', null, 400)
    }

    // Atualizar o status
    const estabelecimentoAtualizado = await prisma.estabelecimentos.update({
      where: { id },
      data: {
        status: novoStatus,
        updatedAt: new Date()
      },
      include: {
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        }
      }
    })

    return successResponse({
      estabelecimento: estabelecimentoAtualizado
    }, mensagem)

  } catch (error) {
    console.error('Erro ao aprovar/desaprovar estabelecimento:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
