import { NextRequest } from 'next/server'
import { UtilizarCartaoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/cartoes/{id}/utilizar:
 *   post:
 *     tags:
 *       - Cartões
 *     summary: Utilizar cartão
 *     description: Utiliza todo o valor do cartão e coleta dados do usuário
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
 *               - usuarioNome
 *               - usuarioTelefone
 *             properties:
 *               usuarioNome:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome completo do usuário
 *                 example: João Silva
 *               usuarioTelefone:
 *                 type: string
 *                 minLength: 10
 *                 description: Telefone do usuário
 *                 example: "11999999999"
 *     responses:
 *       200:
 *         description: Cartão utilizado com sucesso
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
 *                     comprovante:
 *                       type: string
 *       400:
 *         description: Cartão não pode ser utilizado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

async function utilizarCartaoHandler(
  data: any,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  const cartaoId = params.id
  const { usuarioNome, usuarioTelefone } = data

  // Apenas estabelecimentos podem utilizar cartões
  if (user.type !== 'ESTABELECIMENTO') {
    return forbiddenResponse('Apenas estabelecimentos podem utilizar cartões')
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

    // Verificar se o cartão pode ser utilizado
    if (cartao.status !== 'ATIVO') {
      return errorResponse('Cartão não está ativo para utilização', null, 400)
    }

    if (cartao.valor <= 0) {
      return errorResponse('Cartão não possui valor para utilização', null, 400)
    }

    // Buscar estabelecimento do usuário
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id: user.estabelecimentoId! }
    })

    if (!estabelecimento) {
      return errorResponse('Estabelecimento não encontrado', null, 404)
    }

    // Gerar comprovante único
    const dataHoje = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const numeroSequencial = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const comprovante = `COMP-${dataHoje}-${numeroSequencial}`

    // Iniciar transação do banco de dados
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar cartão (marcar como utilizado)
      const cartaoAtualizado = await tx.cartoes.update({
        where: { id: cartaoId },
        data: {
          status: 'UTILIZADO',
          dataUtilizacao: new Date(),
          usuarioId: `user_${Date.now()}`, // Criar ID temporário para o usuário
          valor: 0, // Zerar o valor após utilização
          updatedAt: new Date()
        }
      })

      // Criar transação de utilização
      const transacao = await tx.transacoes.create({
        data: {
          id: crypto.randomUUID(),
          tipo: 'UTILIZACAO',
          valor: cartao.valor, // Usar o valor original do cartão
          status: 'CONCLUIDA',
          cartaoId: cartaoId,
          estabelecimentoId: estabelecimento.id,
          usuarioNome: usuarioNome,
          usuarioTelefone: usuarioTelefone,
          comprovante: comprovante,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Criar log da operação
      await tx.logs.create({
        data: {
          id: crypto.randomUUID(),
          acao: 'UTILIZACAO',
          entidade: 'Cartao',
          entidadeId: cartaoId,
          dadosAnteriores: {
            valor: cartao.valor,
            status: cartao.status
          },
          dadosNovos: {
            valor: 0,
            status: 'UTILIZADO',
            usuarioNome: usuarioNome,
            usuarioTelefone: usuarioTelefone
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

      return { cartaoAtualizado, transacao }
    })

    return successResponse({
      cartao: {
        id: resultado.cartaoAtualizado.id,
        codigo: resultado.cartaoAtualizado.codigo,
        valor: resultado.cartaoAtualizado.valor,
        status: resultado.cartaoAtualizado.status,
        dataUtilizacao: resultado.cartaoAtualizado.dataUtilizacao
      },
      transacao: {
        id: resultado.transacao.id,
        tipo: resultado.transacao.tipo,
        valor: resultado.transacao.valor,
        usuarioNome: resultado.transacao.usuarioNome,
        usuarioTelefone: resultado.transacao.usuarioTelefone,
        comprovante: resultado.transacao.comprovante,
        createdAt: resultado.transacao.createdAt
      },
      comprovante: comprovante,
      estabelecimento: {
        id: estabelecimento.id,
        name: estabelecimento.name
      }
    }, `Cartão utilizado com sucesso. Valor: R$ ${cartao.valor.toFixed(2)}`)

  } catch (error) {
    console.error('Erro ao utilizar cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params
  return withValidation(UtilizarCartaoSchema, (data, req) => 
    utilizarCartaoHandler(data, req, { params })
  )(request)
}
