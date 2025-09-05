import React from 'react'
import { FiHome, FiCheckCircle, FiClock, FiAlertTriangle, FiTrendingUp, FiUsers, FiTag, FiCreditCard } from 'react-icons/fi'
import { EstabelecimentoData } from '@/services/estabelecimentosService'

interface StatsCardsProps {
  estabelecimentos?: EstabelecimentoData[]
  loading?: boolean
}

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
          </div>
          <div className="ml-5 flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { direction: 'up' | 'down' | 'stable'; value?: string }
  color?: string
}> = ({ title, value, icon, trend, color = 'text-blue-600' }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`h-8 w-8 ${color}`}>
          {icon}
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="flex items-center">
            <div className="text-lg font-medium text-gray-900">
              {value}
            </div>
            {trend && (
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                trend.direction === 'up' ? 'text-green-600' : 
                trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend.direction === 'up' && '↗'}
                {trend.direction === 'down' && '↘'}
                {trend.direction === 'stable' && '→'}
                {trend.value && <span className="ml-1">{trend.value}</span>}
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
)

export const EstabelecimentosStatsCards: React.FC<StatsCardsProps> = ({ estabelecimentos = [], loading }) => {
  if (loading) {
    return <LoadingSkeleton />
  }

  // Calcular estatísticas simples
  const total = estabelecimentos.length
  const ativos = estabelecimentos.filter(e => e.status === 'ATIVO').length
  
  // Contar categorias únicas
  const categoriasUnicas = new Set(estabelecimentos.map(e => e.category).filter(Boolean)).size
  
  // Contar estabelecimentos com cartões (simulado - você pode ajustar conforme sua estrutura)
  const comCartoes = estabelecimentos.filter(e => e.status === 'ATIVO').length // Temporário

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiHome className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Ativos</p>
            <p className="text-2xl font-bold text-gray-900">{ativos}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FiTag className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Categorias</p>
            <p className="text-2xl font-bold text-gray-900">{categoriasUnicas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FiCreditCard className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Com Cartões</p>
            <p className="text-2xl font-bold text-gray-900">{comCartoes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
