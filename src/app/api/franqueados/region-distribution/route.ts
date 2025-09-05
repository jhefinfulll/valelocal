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

    // Verificar permissões - apenas franqueadoras e admins podem ver distribuição geral
    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem visualizar distribuição de franqueados')
    }

    console.log('🗺️ Getting region distribution...')

    // Se for franqueado, só pode ver sua própria região
    let whereCondition = {}
    if (user.type === 'FRANQUEADO') {
      whereCondition = { id: user.franqueadoId }
    }

    // Buscar franqueados com estabelecimentos
    const franqueados = await prisma.franqueados.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: {
            estabelecimentos: true
          }
        }
      }
    })
    
    // Agrupar por região
    const distribuicaoPorRegiao = franqueados.reduce((acc: any, franqueado: any) => {
      const region = franqueado.region
      if (!acc[region]) {
        acc[region] = {
          region,
          count: 0,
          ativos: 0,
          inativos: 0,
          estabelecimentos: 0,
          percentage: 0
        }
      }
      
      acc[region].count += 1
      acc[region].estabelecimentos += franqueado._count?.estabelecimentos || 0
      
      if (franqueado.status === 'ATIVO') {
        acc[region].ativos += 1
      } else {
        acc[region].inativos += 1
      }
      
      return acc
    }, {})
    
    // Converter para array e calcular percentuais
    const totalFranqueados = franqueados.length
    const distribution = Object.values(distribuicaoPorRegiao).map((item: any) => ({
      ...item,
      percentage: totalFranqueados > 0 ? Math.round((item.count / totalFranqueados) * 100) : 0
    }))
    
    // Ordenar por quantidade (maior para menor)
    distribution.sort((a: any, b: any) => b.count - a.count)

    console.log('✅ Region distribution calculated:', distribution)
    
    return successResponse(distribution, 'Distribuição regional obtida com sucesso')
    
  } catch (error) {
    console.error('❌ Error getting region distribution:', error)
    return errorResponse('Erro ao buscar distribuição por região', null, 500)
  }
}
