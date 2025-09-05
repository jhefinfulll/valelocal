'use client'

import React from 'react'
import { 
  FiUsers, 
  FiCheckCircle, 
  FiMapPin, 
  FiPercent,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiHome
} from 'react-icons/fi'
import { FranqueadoStats } from '@/services/franqueadosService'
import { formatPercentage } from '@/utils/masks'

interface StatsCardsProps {
  stats: FranqueadoStats | null
  loading?: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  trend?: {
    value: number
    type: 'up' | 'down' | 'stable'
  }
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs. mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  console.log('📊 StatsCards DEBUG:', { stats, loading, statsType: typeof stats })
  
  if (loading) {
    console.log('⏳ Loading = true, mostrando skeleton')
    return <LoadingSkeleton />
  }
  
  if (!stats) {
    console.log('❌ Stats = null/undefined, mostrando skeleton') 
    return <LoadingSkeleton />
  }

  console.log('✅ Renderizando cards com dados:', stats)

  const cards: StatCardProps[] = [
    {
      title: 'Total de Franqueados',
      value: stats.total,
      subtitle: `${stats.ativos} ativos • ${stats.inativos} inativos`,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'blue',
      trend: {
        value: stats.crescimentoMensal,
        type: stats.crescimentoMensal > 0 ? 'up' : stats.crescimentoMensal < 0 ? 'down' : 'stable'
      }
    },
    {
      title: 'Taxa de Ativação',
      value: formatPercentage(Math.round((stats.ativos / stats.total) * 100)),
      subtitle: 'Franqueados ativos',
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Regiões Atendidas',
      value: stats.regioes,
      subtitle: 'Distribuição nacional',
      icon: <FiMapPin className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Estabelecimentos',
      value: stats.estabelecimentos,
      subtitle: 'Total da rede',
      icon: <FiHome className="w-6 h-6" />,
      color: 'orange'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  )
}
