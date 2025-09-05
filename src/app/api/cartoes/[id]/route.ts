import { NextRequest } from 'next/server'
import { RecargarCartaoSchema, UtilizarCartaoSchema, CreateCartaoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/cartoes/{id}:
 *   get:
 *     tags:
 *       - Cartões
 *     summary: Obter cartão por ID
 *     description: Retorna os dados de um cartão específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cartão
 *     responses:
 *       200:
 *         description: Cartão retornado com sucesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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

    const { id: cartaoId } = await params

    // Buscar cartão
    const cartao = await prisma.cartoes.findUnique({
      where: { id: cartaoId },
      select: {
        id: true,
        codigo: true,
        qrCode: true,
        valor: true,
        status: true,
        dataAtivacao: true,
        dataUtilizacao: true,
        franqueadoId: true,
        estabelecimentoId: true,
        createdAt: true,
        updatedAt: true,
        usuarioId: true,
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true
          }
        },
        transacoes: {
          select: {
            id: true,
            tipo: true,
            valor: true,
            status: true,
            usuarioNome: true,
            usuarioTelefone: true,
            createdAt: true,
            estabelecimentos: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!cartao) {
      return notFoundResponse('Cartão não encontrado')
    }

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && cartao.franqueados.id !== user.franqueadoId) {
      return forbiddenResponse('Você só pode ver cartões da sua franquia')
    }

    if (user.type === 'ESTABELECIMENTO' && cartao.estabelecimentos?.id !== user.estabelecimentoId) {
      return forbiddenResponse('Você só pode ver cartões do seu estabelecimento')
    }

    return successResponse(cartao, 'Cartão obtido com sucesso')

  } catch (error) {
    console.error('Erro ao obter cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

// PUT - Atualizar cartão
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id: cartaoId } = await params
    const body = await request.json()

    // Verificar se o cartão existe
    const cartaoExistente = await prisma.cartoes.findUnique({
      where: { id: cartaoId }
    })

    if (!cartaoExistente) {
      return notFoundResponse('Cartão não encontrado')
    }

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && cartaoExistente.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Sem permissão para atualizar este cartão')
    }

    if (user.type === 'ESTABELECIMENTO' && cartaoExistente.estabelecimentoId !== user.estabelecimentoId) {
      return forbiddenResponse('Sem permissão para atualizar este cartão')
    }

    // Verificar se o código já existe em outro cartão (se foi alterado)
    if (body.codigo && body.codigo !== cartaoExistente.codigo) {
      const cartaoComCodigo = await prisma.cartoes.findFirst({
        where: { 
          codigo: body.codigo,
          id: { not: cartaoId }
        }
      })

      if (cartaoComCodigo) {
        return errorResponse('Já existe um cartão com este código', null, 400)
      }
    }

    // Preparar dados para atualização (apenas campos que podem ser alterados)
    const updateData: any = {}
    
    if (body.codigo !== undefined) updateData.codigo = body.codigo
    if (body.qrCode !== undefined) updateData.qrCode = body.qrCode
    if (body.valor !== undefined) updateData.valor = Number(body.valor)
    if (body.status !== undefined) updateData.status = body.status
    if (body.franqueadoId !== undefined) updateData.franqueadoId = body.franqueadoId
    if (body.estabelecimentoId !== undefined) updateData.estabelecimentoId = body.estabelecimentoId

    // Atualizar o cartão
    const cartaoAtualizado = await prisma.cartoes.update({
      where: { id: cartaoId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        codigo: true,
        qrCode: true,
        valor: true,
        status: true,
        dataAtivacao: true,
        dataUtilizacao: true,
        franqueadoId: true,
        estabelecimentoId: true,
        createdAt: true,
        updatedAt: true,
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    return successResponse(cartaoAtualizado, 'Cartão atualizado com sucesso')
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

// DELETE - Excluir cartão
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    
    if (!user) {
      return unauthorizedResponse()
    }

    const { id: cartaoId } = await params

    // Verificar se o cartão existe
    const cartaoExistente = await prisma.cartoes.findUnique({
      where: { id: cartaoId },
      include: {
        transacoes: {
          select: { id: true }
        },
        franqueados: {
          select: { id: true, name: true }
        }
      }
    })

    if (!cartaoExistente) {
      return notFoundResponse('Cartão não encontrado')
    }

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && cartaoExistente.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Sem permissão para excluir este cartão')
    }

    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem excluir cartões')
    }

    // Verificar se o cartão tem transações
    if (cartaoExistente.transacoes.length > 0) {
      return errorResponse('Não é possível excluir cartão com transações. Desative-o em vez disso.', null, 400)
    }

    // Excluir o cartão
    await prisma.cartoes.delete({
      where: { id: cartaoId }
    })

    return successResponse({ message: 'Cartão excluído com sucesso' }, 'Cartão excluído com sucesso')
    
  } catch (error) {
    console.error('Erro ao excluir cartão:', error)
    
    // Verificar se é erro do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2025') {
        return notFoundResponse('Cartão não encontrado')
      } else if (prismaError.code === 'P2003') {
        return errorResponse('Não é possível excluir cartão com dependências', null, 400)
      }
    }
    
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

// POST - Ações específicas do cartão (recarregar, utilizar, bloquear, ativar)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const { id: cartaoId } = await params

    // Verificar se o cartão existe
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

    switch (action) {
      case 'recarregar':
        try {
          const body = await request.json()
          const valor = Number(body.valor)

          if (!valor || valor <= 0) {
            return errorResponse('Valor deve ser maior que 0', null, 400)
          }

          // Verificar permissões para recarga
          if (user.type === 'ESTABELECIMENTO' && cartao.estabelecimentoId !== user.estabelecimentoId) {
            return forbiddenResponse('Sem permissão para recarregar este cartão')
          }

          // Atualizar saldo do cartão
          const cartaoAtualizado = await prisma.cartoes.update({
            where: { id: cartaoId },
            data: {
              valor: (cartao.valor || 0) + valor,
              status: 'ATIVO',
              updatedAt: new Date()
            },
            select: {
              id: true,
              codigo: true,
              qrCode: true,
              valor: true,
              status: true,
              dataAtivacao: true,
              franqueadoId: true,
              estabelecimentoId: true,
              createdAt: true,
              updatedAt: true
            }
          })

          // Registrar transação
          await prisma.transacoes.create({
            data: {
              id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              tipo: 'RECARGA',
              valor: valor,
              status: 'CONCLUIDA',
              cartaoId: cartaoId,
              estabelecimentoId: user.estabelecimentoId || cartao.estabelecimentoId!,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          return successResponse(cartaoAtualizado, 'Cartão recarregado com sucesso')
        } catch (error) {
          console.error('Erro na recarga:', error)
          return errorResponse('Erro ao processar recarga', null, 500)
        }

      case 'utilizar':
        try {
          const body = await request.json()
          const valor = Number(body.valor)

          if (!valor || valor <= 0) {
            return errorResponse('Valor deve ser maior que 0', null, 400)
          }

          if ((cartao.valor || 0) < valor) {
            return errorResponse('Saldo insuficiente', null, 400)
          }

          // Verificar permissões para utilização
          if (user.type === 'ESTABELECIMENTO' && cartao.estabelecimentoId !== user.estabelecimentoId) {
            return forbiddenResponse('Sem permissão para utilizar este cartão')
          }

          // Atualizar saldo do cartão
          const cartaoAtualizado = await prisma.cartoes.update({
            where: { id: cartaoId },
            data: {
              valor: (cartao.valor || 0) - valor,
              status: (cartao.valor || 0) - valor <= 0 ? 'UTILIZADO' : 'ATIVO',
              dataUtilizacao: new Date(),
              updatedAt: new Date()
            }
          })

          // Registrar transação
          await prisma.transacoes.create({
            data: {
              id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              tipo: 'UTILIZACAO',
              valor: valor,
              status: 'CONCLUIDA',
              cartaoId: cartaoId,
              estabelecimentoId: user.estabelecimentoId || cartao.estabelecimentoId!,
              usuarioNome: body.usuarioNome || 'Usuário não identificado',
              usuarioTelefone: body.usuarioTelefone || '',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          return successResponse(cartaoAtualizado, 'Cartão utilizado com sucesso')
        } catch (error) {
          console.error('Erro na utilização:', error)
          return errorResponse('Erro ao processar utilização', null, 500)
        }

      case 'bloquear':
        // Como não existe status BLOQUEADO, vamos usar EXPIRADO para "bloquear"
        const cartaoBloqueado = await prisma.cartoes.update({
          where: { id: cartaoId },
          data: { 
            status: 'EXPIRADO',
            updatedAt: new Date()
          },
          select: {
            id: true,
            codigo: true,
            qrCode: true,
            valor: true,
            status: true,
            dataAtivacao: true,
            franqueadoId: true,
            estabelecimentoId: true,
            createdAt: true,
            updatedAt: true
          }
        })
        return successResponse(cartaoBloqueado, 'Cartão bloqueado com sucesso')

      case 'ativar':
        const cartaoAtivado = await prisma.cartoes.update({
          where: { id: cartaoId },
          data: { 
            status: 'ATIVO',
            dataAtivacao: new Date(),
            updatedAt: new Date()
          },
          select: {
            id: true,
            codigo: true,
            qrCode: true,
            valor: true,
            status: true,
            dataAtivacao: true,
            franqueadoId: true,
            estabelecimentoId: true,
            createdAt: true,
            updatedAt: true
          }
        })
        return successResponse(cartaoAtivado, 'Cartão ativado com sucesso')

      case 'gerar-qr':
        // Gerar QR Code do cartão
        const qrData = {
          cartaoId: cartao.id,
          codigo: cartao.codigo,
          valor: cartao.valor,
          timestamp: new Date().toISOString()
        }
        
        const qrCodeString = JSON.stringify(qrData)
        
        // Simular geração de data URL (em produção, usar uma lib como qrcode)
        const dataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`
        
        return successResponse({
          qrCode: qrCodeString,
          dataUrl: dataUrl
        }, 'QR Code gerado com sucesso')

      default:
        return errorResponse('Ação não reconhecida', null, 400)
    }
  } catch (error) {
    console.error('Erro ao processar ação do cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
