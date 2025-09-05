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

    // Verificar permissões - apenas franqueadoras e admins podem ver estatísticas gerais
    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem visualizar estatísticas de franqueados')
    }

    // Se for franqueado, só pode ver suas próprias estatísticas
    let whereCondition = {}
    if (user.type === 'FRANQUEADO') {
      whereCondition = { id: user.franqueadoId }
    }
    // Buscar estatísticas dos franqueados
    const totalFranqueados = await prisma.franqueados.count({
      where: whereCondition
    })
    
    const franqueadosAtivos = await prisma.franqueados.count({
      where: { ...whereCondition, status: 'ATIVO' }
    })
    
    const franqueados = await prisma.franqueados.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: {
            estabelecimentos: true,
            cartoes: true,
            comissoes: true
          }
        }
      }
    })
    
    const totalEstabelecimentos = franqueados.reduce(
      (sum: number, f: any) => sum + f._count.estabelecimentos, 0
    )
    
    const comissaoMedia = franqueados.length > 0 
      ? franqueados.reduce((sum: number, f: any) => sum + f.comissionRate, 0) / franqueados.length
      : 0
    
    const regioes = new Set(franqueados.map((f: any) => f.region)).size
    
    const crescimentoMensal = await calcularCrescimentoMensal()
    
    const stats = {
      total: totalFranqueados,
      ativos: franqueadosAtivos,
      inativos: totalFranqueados - franqueadosAtivos,
      estabelecimentos: totalEstabelecimentos,
      comissaoMedia: Number(comissaoMedia.toFixed(1)),
      regioes,
      crescimentoMensal,
      tendencias: {
        franqueados: crescimentoMensal > 0 ? 'up' : crescimentoMensal < 0 ? 'down' : 'stable',
        ativacao: franqueadosAtivos / totalFranqueados > 0.8 ? 'up' : 'down'
      }
    }
    
    return successResponse(stats, 'Estatísticas obtidas com sucesso')
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

async function calcularCrescimentoMensal() {
  const agora = new Date()
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)
  
  const [franqueadosMesAtual, franqueadosMesAnterior] = await Promise.all([
    prisma.franqueados.count({
      where: {
        createdAt: {
          gte: inicioMesAtual
        }
      }
    }),
    prisma.franqueados.count({
      where: {
        createdAt: {
          gte: inicioMesAnterior,
          lte: fimMesAnterior
        }
      }
    })
  ])
  
  return franqueadosMesAtual - franqueadosMesAnterior
}
