import { NextRequest } from 'next/server'
import { successResponse, errorResponse, unauthorizedResponse } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Obter métricas do dashboard
 *     description: Retorna métricas personalizadas baseadas no tipo de usuário
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCartoes:
 *                       type: integer
 *                     cartoesAtivos:
 *                       type: integer
 *                     cartoesUtilizados:
 *                       type: integer
 *                     valorTotal:
 *                       type: number
 *                     valorUtilizado:
 *                       type: number
 *                     transacoesHoje:
 *                       type: integer
 *                     estabelecimentosAtivos:
 *                       type: integer
 *                     comissoesTotais:
 *                       type: number
 *                     crescimentoMensal:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Definir filtros baseados no tipo de usuário
    let cartaoFilter: any = {}
    let estabelecimentoFilter: any = {}
    let transacaoFilter: any = {}
    let comissaoFilter: any = {}

    if (user.type === 'FRANQUEADO') {
      cartaoFilter.franqueadoId = user.franqueadoId
      estabelecimentoFilter.franqueadoId = user.franqueadoId
      transacaoFilter = {
        cartoes: { franqueadoId: user.franqueadoId }
      }
      comissaoFilter.franqueadoId = user.franqueadoId
    } else if (user.type === 'ESTABELECIMENTO') {
      cartaoFilter.estabelecimentoId = user.estabelecimentoId
      estabelecimentoFilter.id = user.estabelecimentoId
      transacaoFilter.estabelecimentoId = user.estabelecimentoId
      comissaoFilter.estabelecimentoId = user.estabelecimentoId
    }
    // FRANQUEADORA não tem filtros (vê tudo)

    // Data de hoje para filtrar transações
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    // Data do início do mês para crescimento mensal
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59)

    // Buscar métricas em paralelo
    const [
      totalCartoes,
      cartoesAtivos,
      cartoesUtilizados,
      valorTotalResult,
      valorUtilizadoResult,
      transacoesHoje,
      estabelecimentosAtivos,
      comissoesTotais,
      transacoesMesAtual,
      transacoesMesAnterior
    ] = await Promise.all([
      // Total de cartões
      prisma.cartoes.count({
        where: cartaoFilter
      }),

      // Cartões ativos
      prisma.cartoes.count({
        where: {
          ...cartaoFilter,
          status: 'ATIVO'
        }
      }),

      // Cartões utilizados
      prisma.cartoes.count({
        where: {
          ...cartaoFilter,
          status: 'UTILIZADO'
        }
      }),

      // Valor total em cartões ativos
      prisma.cartoes.aggregate({
        where: {
          ...cartaoFilter,
          status: 'ATIVO'
        },
        _sum: {
          valor: true
        }
      }),

      // Valor já utilizado
      prisma.transacoes.aggregate({
        where: {
          ...transacaoFilter,
          tipo: 'UTILIZACAO',
          status: 'CONCLUIDA'
        },
        _sum: {
          valor: true
        }
      }),

      // Transações de hoje
      prisma.transacoes.count({
        where: {
          ...transacaoFilter,
          createdAt: {
            gte: hoje,
            lt: amanha
          }
        }
      }),

      // Estabelecimentos ativos
      prisma.estabelecimentos.count({
        where: {
          ...estabelecimentoFilter,
          status: 'ATIVO'
        }
      }),

      // Comissões totais pendentes
      prisma.comissoes.aggregate({
        where: {
          ...comissaoFilter,
          status: 'PENDENTE'
        },
        _sum: {
          valor: true
        }
      }),

      // Transações do mês atual
      prisma.transacoes.count({
        where: {
          ...transacaoFilter,
          createdAt: {
            gte: inicioMes
          }
        }
      }),

      // Transações do mês anterior
      prisma.transacoes.count({
        where: {
          ...transacaoFilter,
          createdAt: {
            gte: inicioMesAnterior,
            lt: inicioMes
          }
        }
      })
    ])

    // Calcular crescimento mensal
    let crescimentoMensal = 0
    if (transacoesMesAnterior > 0) {
      crescimentoMensal = ((transacoesMesAtual - transacoesMesAnterior) / transacoesMesAnterior) * 100
    } else if (transacoesMesAtual > 0) {
      crescimentoMensal = 100 // 100% se não havia transações no mês anterior
    }

    const dashboard = {
      totalCartoes,
      cartoesAtivos,
      cartoesUtilizados,
      valorTotal: valorTotalResult._sum.valor || 0,
      valorUtilizado: valorUtilizadoResult._sum.valor || 0,
      transacoesHoje,
      estabelecimentosAtivos,
      comissoesTotais: comissoesTotais._sum.valor || 0,
      crescimentoMensal: Math.round(crescimentoMensal * 100) / 100, // Arredondar para 2 casas decimais
      periodo: {
        hoje: hoje.toISOString().split('T')[0],
        mesAtual: inicioMes.toISOString().split('T')[0],
        transacoesMesAtual,
        transacoesMesAnterior
      }
    }

    // Adicionar métricas específicas por tipo de usuário
    let metricsEspecificas: any = {}

    if (user.type === 'FRANQUEADORA') {
      const [totalFranqueados, franqueadosAtivos] = await Promise.all([
        prisma.franqueados.count(),
        prisma.franqueados.count({
          where: { status: 'ATIVO' }
        })
      ])

      metricsEspecificas = {
        totalFranqueados,
        franqueadosAtivos
      }
    }

    if (user.type === 'FRANQUEADO') {
      const [comissoesPagas, displaysTotais] = await Promise.all([
        prisma.comissoes.aggregate({
          where: {
            franqueadoId: user.franqueadoId,
            status: 'PAGA'
          },
          _sum: {
            valor: true
          }
        }),
        prisma.displays.count({
          where: {
            franqueadoId: user.franqueadoId
          }
        })
      ])

      metricsEspecificas = {
        comissoesPagas: comissoesPagas._sum.valor || 0,
        displaysTotais
      }
    }

    return successResponse({
      ...dashboard,
      ...metricsEspecificas
    }, 'Métricas do dashboard obtidas com sucesso')

  } catch (error) {
    console.error('Erro ao obter métricas do dashboard:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}
