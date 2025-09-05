import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Autenticação
 *     summary: Obter dados do usuário logado
 *     description: Retorna os dados do usuário atual baseado no token JWT
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
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
 *                   example: Dados do usuário obtidos com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [FRANQUEADORA, FRANQUEADO, ESTABELECIMENTO, USUARIO]
 *                         status:
 *                           type: string
 *                           enum: [ATIVO, INATIVO]
 *                         lastLogin:
 *                           type: string
 *                           format: date-time
 *                         franqueadora:
 *                           type: object
 *                           nullable: true
 *                         franqueado:
 *                           type: object
 *                           nullable: true
 *                         estabelecimento:
 *                           type: object
 *                           nullable: true
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar token JWT
    const user = getAuthenticatedUser(request)
    
    if (!user) {
      return unauthorizedResponse()
    }

    // Buscar dados completos do usuário
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        franqueadoraId: true,
        franqueadoId: true,
        estabelecimentoId: true,
        franqueadoras: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            status: true,
            logo: true
          }
        },
        franqueados: {
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
            franqueadoraId: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            category: true,
            status: true,
            logo: true,
            franqueadoId: true
          }
        }
      }
    })

    if (!userData) {
      return errorResponse('Usuário não encontrado', null, 404)
    }

    return successResponse({
      user: userData
    }, 'Dados do usuário obtidos com sucesso')

  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
