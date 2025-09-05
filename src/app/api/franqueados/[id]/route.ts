import { NextRequest } from 'next/server'
import { UpdateFranqueadoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/franqueados/{id}:
 *   get:
 *     tags:
 *       - Franqueados
 *     summary: Obter franqueado por ID
 *     description: Retorna os dados de um franqueado específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do franqueado
 *     responses:
 *       200:
 *         description: Franqueado retornado com sucesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags:
 *       - Franqueados
 *     summary: Atualizar franqueado
 *     description: Atualiza os dados de um franqueado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do franqueado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFranqueado'
 *     responses:
 *       200:
 *         description: Franqueado atualizado com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags:
 *       - Franqueados
 *     summary: Excluir franqueado
 *     description: Remove um franqueado permanentemente do sistema e exclui usuários e dados associados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do franqueado
 *     responses:
 *       200:
 *         description: Franqueado e dados associados excluídos permanentemente com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: " *         description: Franqueado e dados associados excluídos permanentemente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuariosExcluidos:
 *                       type: number
 *                       example: 2
 *       400:
 *         description: Franqueado tem dependências e não pode ser excluído
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

    const { id: franqueadoId } = await params

    // Verificar permissões
    if (user.type === 'FRANQUEADO' && user.franqueadoId !== franqueadoId) {
      return forbiddenResponse('Você só pode ver seus próprios dados')
    }

    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem ver dados de franqueados')
    }

    // Buscar franqueado
    const franqueado = await prisma.franqueados.findUnique({
      where: { id: franqueadoId },
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
        logo: true,
        createdAt: true,
        updatedAt: true,
        franqueadoras: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            createdAt: true
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            estabelecimentos: true,
            cartoes: true,
            comissoes: { where: { status: 'PENDENTE' } },
            displays: true
          }
        }
      }
    })

    if (!franqueado) {
      return notFoundResponse('Franqueado não encontrado')
    }

    return successResponse(franqueado, 'Franqueado obtido com sucesso')

  } catch (error) {
    console.error('Erro ao obter franqueado:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

async function updateFranqueadoHandler(
  data: any,
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  const { id: franqueadoId } = await params

  // Verificar permissões
  if (user.type === 'FRANQUEADO' && user.franqueadoId !== franqueadoId) {
    return forbiddenResponse('Você só pode editar seus próprios dados')
  }

  if (user.type === 'ESTABELECIMENTO') {
    return forbiddenResponse('Estabelecimentos não podem editar franqueados')
  }

  try {
    // Verificar se o franqueado existe
    const existingFranqueado = await prisma.franqueados.findUnique({
      where: { id: franqueadoId }
    })

    if (!existingFranqueado) {
      return notFoundResponse('Franqueado não encontrado')
    }

    // Verificar CNPJ único (se fornecido)
    if (data.cnpj && data.cnpj !== existingFranqueado.cnpj) {
      const cnpjExists = await prisma.franqueados.findUnique({
        where: { cnpj: data.cnpj }
      })

      if (cnpjExists) {
        return errorResponse('CNPJ já cadastrado por outro franqueado', null, 400)
      }
    }

    // Verificar email único (se fornecido)
    if (data.email && data.email !== existingFranqueado.email) {
      const emailExists = await prisma.franqueados.findUnique({
        where: { email: data.email }
      })

      if (emailExists) {
        return errorResponse('Email já cadastrado por outro franqueado', null, 400)
      }
    }

    // Atualizar franqueado
    const updateData = { ...data }
    
    // Se a senha estiver vazia, removê-la dos dados de atualização
    if (!data.password || data.password.trim() === '') {
      delete updateData.password
    }
    
    const updatedFranqueado = await prisma.franqueados.update({
      where: { id: franqueadoId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
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
        logo: true,
        updatedAt: true,
        franqueadoras: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return successResponse(updatedFranqueado, 'Franqueado atualizado com sucesso')

  } catch (error) {
    console.error('Erro ao atualizar franqueado:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Apenas FRANQUEADORA pode deletar franqueados
    if (user.type !== 'FRANQUEADORA') {
      return forbiddenResponse('Apenas franqueadoras podem excluir franqueados')
    }

    const { id } = await params

    const franqueadoId = id

    // Verificar se o franqueado existe
    const existingFranqueado = await prisma.franqueados.findUnique({
      where: { id: franqueadoId },
      include: {
        estabelecimentos: true,
        cartoes: true,
        comissoes: true,
        users: true // Incluir usuários associados
      }
    })

    if (!existingFranqueado) {
      return notFoundResponse('Franqueado não encontrado')
    }

    // Verificar se pode ser deletado (não tem dependências)
    if (existingFranqueado.estabelecimentos.length > 0) {
      return errorResponse(
        'Não é possível excluir franqueado com estabelecimentos cadastrados',
        { estabelecimentos: existingFranqueado.estabelecimentos.length },
        400
      )
    }

    if (existingFranqueado.cartoes.length > 0) {
      return errorResponse(
        'Não é possível excluir franqueado com cartões cadastrados',
        { cartoes: existingFranqueado.cartoes.length },
        400
      )
    }

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // 1. Excluir usuários associados ao franqueado
      if (existingFranqueado.users.length > 0) {
        // Primeiro, excluir refresh_tokens dos usuários
        await tx.refresh_tokens.deleteMany({
          where: {
            userId: {
              in: existingFranqueado.users.map(u => u.id)
            }
          }
        })

        // Depois, excluir os usuários
        await tx.users.deleteMany({
          where: {
            franqueadoId: franqueadoId
          }
        })
      }

      // 2. Excluir comissões associadas ao franqueado
      await tx.comissoes.deleteMany({
        where: {
          franqueadoId: franqueadoId
        }
      })

      // 3. Excluir displays associados ao franqueado
      await tx.displays.deleteMany({
        where: {
          franqueadoId: franqueadoId
        }
      })

      // 4. Excluir solicitações de cartão associadas ao franqueado
      await tx.solicitacoes_cartao.deleteMany({
        where: {
          franqueadoId: franqueadoId
        }
      })

      // 5. Excluir logs associados ao franqueado
      await tx.logs.deleteMany({
        where: {
          franqueadoId: franqueadoId
        }
      })

      // 6. Finalmente, excluir o franqueado
      await tx.franqueados.delete({
        where: { id: franqueadoId }
      })
    })

    return successResponse(
      { 
        usuariosExcluidos: existingFranqueado.users.length 
      }, 
      'Franqueado e dados associados excluídos permanentemente com sucesso'
    )

  } catch (error) {
    console.error('Erro ao excluir franqueado:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  return withValidation(UpdateFranqueadoSchema, (data, req) => 
    updateFranqueadoHandler(data, req, context)
  )(request)
}
