'use client'

import React from 'react'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCheckCircle, 
  FiPercent,
  FiUsers,
  FiHome,
  FiMinus
} from 'react-icons/fi'
import { PerformanceData } from '@/services/franqueadosService'
import { formatPercentage } from '@/utils/masks'

interface PerformanceRecentProps {
  data: PerformanceData | null
  loading?: boolean
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  trend?: {
    value: number
    type: 'up' | 'down' | 'stable'
  }
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.type) {
      case 'up':
        return <FiTrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <FiTrendingDown className="w-4 h-4 text-red-500" />
      case 'stable':
        return <FiMinus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    switch (trend.type) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-600'
    }
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-60">{subtitle}</p>
          </div>
        </div>
        {trend && (
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                {Math.abs(trend.value)}%
              </span>
            </div>
            <span className="text-xs opacity-60">vs anterior</span>
          </div>
        )}
      </div>
    </div>
  )
}

export const PerformanceRecent: React.FC<PerformanceRecentProps> = ({ 
  data, 
  loading 
}) => {
  if (loading || !data) {
    return <LoadingSkeleton />
  }

  const getTrendType = (value: number): 'up' | 'down' | 'stable' => {
    if (value > 0) return 'up'
    if (value < 0) return 'down'
    return 'stable'
  }

  const metrics: MetricCardProps[] = [
    {
      title: 'Novos este Mês',
      value: data.novosFranqueados.atual,
      subtitle: 'franqueados cadastrados',
      icon: <FiUsers className="w-8 h-8" />,
      color: 'green',
      trend: {
        value: data.novosFranqueados.crescimento,
        type: getTrendType(data.novosFranqueados.crescimento)
      }
    },
    {
      title: 'Taxa de Ativação',
      value: formatPercentage(data.taxaAtivacao.percentual),
      subtitle: 'dos cadastrados',
      icon: <FiCheckCircle className="w-8 h-8" />,
      color: 'blue'
    },
    {
      title: 'Comissão Média',
      value: formatPercentage(15), // Valor padrão temporário até implementar comissaoMedia
      subtitle: 'novos franqueados',
      icon: <FiPercent className="w-8 h-8" />,
      color: 'purple'
    },
    {
      title: 'Estabelecimentos',
      value: data.estabelecimentosRecentes.total,
      subtitle: 'novos no mês',
      icon: <FiHome className="w-8 h-8" />,
      color: 'orange'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FiTrendingUp className="w-5 h-5 mr-2" />
          Performance Recente
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            data.novosFranqueados.tendencia === 'up' ? 'bg-green-500' : 
            data.novosFranqueados.tendencia === 'down' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm text-gray-500 capitalize">
            Tendência {data.novosFranqueados.tendencia === 'up' ? 'crescimento' : 
                      data.novosFranqueados.tendencia === 'down' ? 'declínio' : 'estável'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            💡 Insights do Período
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            {data.novosFranqueados.crescimento > 0 ? (
              <p>• Crescimento positivo de {data.novosFranqueados.crescimento}% em novos franqueados</p>
            ) : data.novosFranqueados.crescimento < 0 ? (
              <p>• Redução de {Math.abs(data.novosFranqueados.crescimento)}% em novos cadastros</p>
            ) : (
              <p>• Cadastros estáveis em relação ao período anterior</p>
            )}
            
            {data.taxaAtivacao.percentual >= 80 ? (
              <p>• Excelente taxa de ativação ({formatPercentage(data.taxaAtivacao.percentual)})</p>
            ) : data.taxaAtivacao.percentual >= 60 ? (
              <p>• Boa taxa de ativação ({formatPercentage(data.taxaAtivacao.percentual)})</p>
            ) : (
              <p>• Taxa de ativação pode ser melhorada ({formatPercentage(data.taxaAtivacao.percentual)})</p>
            )}
            
            <p>• Comissão média dos novos: {formatPercentage(15)}</p> {/* Valor temporário */}
          </div>
        </div>
      </div>
    </div>
  )
}
