import { NextRequest } from 'next/server'
import { UpdateEstabelecimentoSchema } from '@/app/utils/schemas'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/estabelecimentos/{id}:
 *   get:
 *     tags:
 *       - Estabelecimentos
 *     summary: Busca estabelecimento por ID
 *     description: Retorna os dados completos de um estabelecimento específico com informações do franqueado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do estabelecimento
 *     responses:
 *       200:
 *         description: Estabelecimento encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Estabelecimento'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 *
 *   put:
 *     tags:
 *       - Estabelecimentos
 *     summary: Atualiza um estabelecimento
 *     description: Atualiza os dados de um estabelecimento existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do estabelecimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEstabelecimento'
 *           examples:
 *             atualizar_estabelecimento:
 *               summary: Exemplo de atualização
 *               value:
 *                 name: "Padaria Central Atualizada"
 *                 email: "novo-email@padariacentral.com"
 *                 phone: "11999888777"
 *                 address: "Nova Rua das Flores, 456 - Centro, São Paulo - SP"
 *                 category: "Alimentação"
 *                 logo: "https://exemplo.com/novo-logo.png"
 *     responses:
 *       200:
 *         description: Estabelecimento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Estabelecimento'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 *
 *   delete:
 *     tags:
 *       - Estabelecimentos
 *     summary: Remove um estabelecimento
 *     description: Remove permanentemente um estabelecimento do sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do estabelecimento
 *     responses:
 *       200:
 *         description: Estabelecimento removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */

// PUT - Atualizar estabelecimento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    console.log('PUT Body recebido:', JSON.stringify(body, null, 2))
    
    const result = UpdateEstabelecimentoSchema.safeParse(body)
    
    if (!result.success) {
      console.log('Erro de validação:', result.error.issues)
      return errorResponse('Dados inválidos', result.error.issues, 400)
    }
    
    // Autenticação
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse('Token de autenticação inválido ou expirado')
    }

    const { id } = await params

    // Verifica se o estabelecimento existe
    const estabelecimentoExistente = await prisma.estabelecimentos.findUnique({
      where: { id }
    })

    if (!estabelecimentoExistente) {
      return notFoundResponse('Estabelecimento não encontrado')
    }

    // Permissões: franqueadora pode tudo, franqueado só seus próprios estabelecimentos
    if (user.type === 'FRANQUEADO' && estabelecimentoExistente.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Você não tem permissão para atualizar este estabelecimento')
    }
    
    if (user.type === 'ESTABELECIMENTO' && estabelecimentoExistente.id !== user.estabelecimentoId) {
      return forbiddenResponse('Você não tem permissão para atualizar este estabelecimento')
    }

    // Atualiza o estabelecimento
    const estabelecimento = await prisma.estabelecimentos.update({
      where: { id },
      data: {
        ...result.data,
        updatedAt: new Date()
      },
      include: {
        franqueados: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return successResponse(estabelecimento, 'Estabelecimento atualizado com sucesso')

  } catch (error) {
    console.error('Erro no PUT:', error)
    return errorResponse('Erro ao processar requisição', null, 500)
  }
}

// GET - Buscar estabelecimento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse('Token de autenticação inválido ou expirado')
    }

    const { id } = await params

    // Buscar estabelecimento
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id },
      include: {
        franqueados: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!estabelecimento) {
      return notFoundResponse('Estabelecimento não encontrado')
    }

    // Permissões: franqueadora pode ver tudo, franqueado só seus próprios
    if (user.type === 'FRANQUEADO' && estabelecimento.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Você não tem permissão para acessar este estabelecimento')
    }
    
    if (user.type === 'ESTABELECIMENTO' && estabelecimento.id !== user.estabelecimentoId) {
      return forbiddenResponse('Você não tem permissão para acessar este estabelecimento')
    }

    return successResponse(estabelecimento, 'Estabelecimento encontrado')

  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

// DELETE - Excluir estabelecimento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse('Token de autenticação inválido ou expirado')
    }

    const { id } = await params

    // Buscar estabelecimento
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id }
    })

    if (!estabelecimento) {
      return notFoundResponse('Estabelecimento não encontrado')
    }

    // Permissões: franqueadora pode excluir tudo, franqueado só seus próprios
    if (user.type === 'FRANQUEADO' && estabelecimento.franqueadoId !== user.franqueadoId) {
      return forbiddenResponse('Você não tem permissão para excluir este estabelecimento')
    }
    
    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem excluir outros estabelecimentos')
    }

    // Excluir o estabelecimento
    await prisma.estabelecimentos.delete({
      where: { id }
    })

    return successResponse(null, 'Estabelecimento excluído com sucesso')

  } catch (error) {
    console.error('Erro ao excluir estabelecimento:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}