import { NextRequest } from 'next/server'
import { RecargarCartaoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/cartoes/{id}/recarregar:
 *   post:
 *     tags:
 *       - Cartões
 *     summary: Recarregar cartão
 *     description: Adiciona valor a um cartão e cria uma transação de recarga
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *             properties:
 *               valor:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Valor da recarga
 *                 example: 50.00
 *     responses:
 *       200:
 *         description: Cartão recarregado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartao:
 *                       type: object
 *                     transacao:
 *                       type: object
 *                     comissao:
 *                       type: object
 *       400:
 *         description: Cartão não pode ser recarregado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

async function recarregarCartaoHandler(
  data: any,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  const cartaoId = params.id
  const { valor } = data

  // Apenas estabelecimentos podem recarregar cartões
  if (user.type !== 'ESTABELECIMENTO') {
    return forbiddenResponse('Apenas estabelecimentos podem recarregar cartões')
  }

  try {
    // Buscar cartão
    const cartao = await prisma.cartoes.findUnique({
      where: { id: cartaoId },
      include: {
        franqueados: true,
        estabelecimentos: true
      }
    })

    if (!cartao) {
      return notFoundResponse('Cartão não encontrado')
    }

    // Verificar se o cartão pode ser recarregado
    if (cartao.status === 'EXPIRADO') {
      return errorResponse('Cartão expirado não pode ser recarregado', null, 400)
    }

    if (cartao.status === 'UTILIZADO') {
      return errorResponse('Cartão já foi utilizado e não pode ser recarregado', null, 400)
    }

    // Buscar estabelecimento do usuário
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id: user.estabelecimentoId! },
      include: {
        franqueados: true
      }
    })

    if (!estabelecimento) {
      return errorResponse('Estabelecimento não encontrado', null, 404)
    }

    // Iniciar transação do banco de dados
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar cartão
      const cartaoAtualizado = await tx.cartoes.update({
        where: { id: cartaoId },
        data: {
          valor: cartao.valor + valor,
          status: 'ATIVO',
          dataAtivacao: cartao.dataAtivacao || new Date(),
          estabelecimentoId: estabelecimento.id,
          updatedAt: new Date()
        }
      })

      // Criar transação
      const transacao = await tx.transacoes.create({
        data: {
          id: crypto.randomUUID(),
          tipo: 'RECARGA',
          valor: valor,
          status: 'CONCLUIDA',
          cartaoId: cartaoId,
          estabelecimentoId: estabelecimento.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Calcular e criar comissão
      const percentualComissao = estabelecimento.franqueados.comissionRate
      const valorComissao = (valor * percentualComissao) / 100

      const comissao = await tx.comissoes.create({
        data: {
          id: crypto.randomUUID(),
          valor: valorComissao,
          percentual: percentualComissao,
          status: 'PENDENTE',
          franqueadoId: estabelecimento.franqueadoId,
          estabelecimentoId: estabelecimento.id,
          transacaoId: transacao.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Criar log da operação
      await tx.logs.create({
        data: {
          id: crypto.randomUUID(),
          acao: 'RECARGA',
          entidade: 'Cartao',
          entidadeId: cartaoId,
          dadosAnteriores: {
            valor: cartao.valor,
            status: cartao.status
          },
          dadosNovos: {
            valor: cartaoAtualizado.valor,
            status: cartaoAtualizado.status
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          userId: user.id,
          cartaoId: cartaoId,
          transacaoId: transacao.id,
          estabelecimentoId: estabelecimento.id,
          createdAt: new Date()
        }
      })

      return { cartaoAtualizado, transacao, comissao }
    })

    return successResponse({
      cartao: {
        id: resultado.cartaoAtualizado.id,
        codigo: resultado.cartaoAtualizado.codigo,
        valor: resultado.cartaoAtualizado.valor,
        status: resultado.cartaoAtualizado.status,
        dataAtivacao: resultado.cartaoAtualizado.dataAtivacao
      },
      transacao: resultado.transacao,
      comissao: {
        valor: resultado.comissao.valor,
        percentual: resultado.comissao.percentual
      }
    }, `Cartão recarregado com R$ ${valor.toFixed(2)}`)

  } catch (error) {
    console.error('Erro ao recarregar cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params
  return withValidation(RecargarCartaoSchema, (data, req) => 
    recarregarCartaoHandler(data, req, { params })
  )(request)
}
