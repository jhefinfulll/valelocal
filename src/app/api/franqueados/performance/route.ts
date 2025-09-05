import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse, successResponse, errorResponse } from '@/app/utils/validation'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // Verificar permissões - apenas franqueadoras e admins podem ver performance geral
    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem visualizar dados de performance de franqueados')
    }

    // Se for franqueado, só pode ver sua própria performance
    let whereCondition = {}
    if (user.type === 'FRANQUEADO') {
      whereCondition = { id: user.franqueadoId }
    }

    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)
    const inicio30Dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Métricas do mês atual vs anterior
    const [
      novosFranqueadosMesAtual,
      novosFranqueadosMesAnterior,
      franqueadosAtivos,
      totalFranqueados,
      estabelecimentosRecentes,
      cartoesAtivados
    ] = await Promise.all([
      prisma.franqueados.count({
        where: {
          ...whereCondition,
          createdAt: { gte: inicioMes }
        }
      }),
      prisma.franqueados.count({
        where: {
          ...whereCondition,
          createdAt: {
            gte: inicioMesAnterior,
            lt: inicioMes
          }
        }
      }),
      prisma.franqueados.count({
        where: { 
          ...whereCondition,
          status: 'ATIVO' 
        }
      }),
      prisma.franqueados.count({
        where: whereCondition
      }),
      prisma.estabelecimentos.count({
        where: {
          ...(user.type === 'FRANQUEADO' ? { franqueadoId: user.franqueadoId } : {}),
          createdAt: { gte: inicio30Dias }
        }
      }),
      prisma.cartoes.count({
        where: {
          ...(user.type === 'FRANQUEADO' ? { franqueadoId: user.franqueadoId } : {}),
          status: 'ATIVO',
          dataAtivacao: { gte: inicio30Dias }
        }
      })
    ])
    
    // Calcular tendências
    const crescimentoFranqueados = novosFranqueadosMesAtual - novosFranqueadosMesAnterior
    const taxaAtivacao = totalFranqueados > 0 ? (franqueadosAtivos / totalFranqueados) * 100 : 0
    
    // Performance por região nos últimos 30 dias
    const performancePorRegiao = await prisma.franqueados.groupBy({
      by: ['region'],
      where: {
        createdAt: { gte: inicio30Dias }
      },
      _count: {
        _all: true
      }
    })
    
    const performance = {
      novosFranqueados: {
        atual: novosFranqueadosMesAtual,
        anterior: novosFranqueadosMesAnterior,
        crescimento: crescimentoFranqueados,
        tendencia: crescimentoFranqueados > 0 ? 'up' : crescimentoFranqueados < 0 ? 'down' : 'stable'
      },
      taxaAtivacao: {
        percentual: Number(taxaAtivacao.toFixed(1)),
        ativos: franqueadosAtivos,
        total: totalFranqueados,
        tendencia: taxaAtivacao >= 80 ? 'up' : taxaAtivacao >= 60 ? 'stable' : 'down'
      },
      estabelecimentosRecentes: {
        total: estabelecimentosRecentes,
        periodo: '30 dias'
      },
      cartoesAtivados: {
        total: cartoesAtivados,
        periodo: '30 dias'
      },
      regioesCrescimento: performancePorRegiao.map((item: any) => ({
        region: item.region,
        novos: item._count._all
      })).sort((a: any, b: any) => b.novos - a.novos),
      insights: gerarInsights({
        crescimentoFranqueados,
        taxaAtivacao,
        estabelecimentosRecentes,
        cartoesAtivados
      })
    }
    
    return successResponse(performance, 'Dados de performance obtidos com sucesso')
    
  } catch (error) {
    console.error('Erro ao buscar performance:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

function gerarInsights({ crescimentoFranqueados, taxaAtivacao, estabelecimentosRecentes, cartoesAtivados }: any) {
  const insights = []
  
  if (crescimentoFranqueados > 0) {
    insights.push({
      type: 'success',
      message: `Crescimento de ${crescimentoFranqueados} novos franqueados este mês`
    })
  }
  
  if (taxaAtivacao >= 80) {
    insights.push({
      type: 'success',
      message: `Excelente taxa de ativação: ${taxaAtivacao.toFixed(1)}%`
    })
  } else if (taxaAtivacao < 60) {
    insights.push({
      type: 'warning',
      message: `Taxa de ativação baixa: ${taxaAtivacao.toFixed(1)}%`
    })
  }
  
  if (estabelecimentosRecentes > 10) {
    insights.push({
      type: 'info',
      message: `${estabelecimentosRecentes} novos estabelecimentos nos últimos 30 dias`
    })
  }
  
  if (cartoesAtivados > 50) {
    insights.push({
      type: 'success',
      message: `${cartoesAtivados} cartões ativados recentemente`
    })
  }
  
  return insights
}
