import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/estabelecimentos/stats:
 *   get:
 *     tags:
 *       - Estabelecimentos
 *     summary: Estatísticas de estabelecimentos
 *     description: Retorna estatísticas gerais dos estabelecimentos como contadores por categoria, status e região
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalEstabelecimentos:
 *                           type: integer
 *                           description: Total de estabelecimentos
 *                         porCategoria:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                           description: Distribuição por categoria
 *                         porStatus:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                           description: Distribuição por status
 *                         porRegiao:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               region:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                           description: Distribuição por região do franqueado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */

export const dynamic = 'force-dynamic'

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
    } else if (user.type === 'ESTABELECIMENTO') {
      where.id = user.estabelecimentoId
    }
    // FRANQUEADORA pode ver todos os estabelecimentos

    // Buscar estatísticas
    const [
      totalEstabelecimentos,
      porCategoria,
      porStatus,
      porRegiao
    ] = await Promise.all([
      // Total de estabelecimentos
      prisma.estabelecimentos.count({ where }),
      
      // Distribuição por categoria
      prisma.estabelecimentos.groupBy({
        by: ['category'],
        where,
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      }),
      
      // Distribuição por status
      prisma.estabelecimentos.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true
        }
      }),
      
      // Distribuição por região (através do franqueado)
      prisma.estabelecimentos.findMany({
        where,
        select: {
          franqueados: {
            select: {
              region: true
            }
          }
        }
      }).then(estabelecimentos => {
        const regioes: { [key: string]: number } = {}
        estabelecimentos.forEach(est => {
          const region = est.franqueados?.region || 'Sem região'
          regioes[region] = (regioes[region] || 0) + 1
        })
        return Object.entries(regioes)
          .map(([region, count]) => ({ region, count }))
          .sort((a, b) => b.count - a.count)
      })
    ])

    return successResponse({
      totalEstabelecimentos,
      porCategoria: porCategoria.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      porStatus: porStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      porRegiao
    }, 'Estatísticas de estabelecimentos obtidas com sucesso')

  } catch (error) {
    console.error('Erro ao buscar estatísticas de estabelecimentos:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
