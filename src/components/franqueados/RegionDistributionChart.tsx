'use client'

import React from 'react'
import { FiMapPin, FiUsers, FiPercent } from 'react-icons/fi'
import { RegionDistribution } from '@/services/franqueadosService'

interface RegionDistributionProps {
  data: RegionDistribution[] | null
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
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mr-4"></div>
              <div className="flex-1 bg-gray-200 rounded h-2 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const RegionBar: React.FC<{ 
  region: RegionDistribution
  maxCount: number
  totalCount: number 
}> = ({ region, maxCount, totalCount }) => {
  const percentage = totalCount > 0 ? (region.count / totalCount) * 100 : 0
  const barWidth = maxCount > 0 ? (region.count / maxCount) * 100 : 0

  const getRegionColor = (regionName: string) => {
    const colors = {
      'Norte': 'bg-green-500',
      'Nordeste': 'bg-yellow-500',
      'Centro-Oeste': 'bg-orange-500',
      'Sudeste': 'bg-blue-500',
      'Sul': 'bg-purple-500'
    } as Record<string, string>
    
    return colors[regionName] || 'bg-gray-500'
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 min-w-[100px]">
            {region.region}
          </span>
          <div className="ml-2 text-xs text-gray-500">
            {region.estabelecimentos} estabelecimentos
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-900">
            {region.count}
          </span>
          <span className="text-xs text-gray-500">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div 
          className={`h-2 rounded-full transition-all duration-300 group-hover:opacity-80 ${getRegionColor(region.region)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Estabelecimentos: {region.estabelecimentos}</span>
        <span className="text-right">{percentage.toFixed(1)}% do total</span>
      </div>
    </div>
  )
}

export const RegionDistributionChart: React.FC<RegionDistributionProps> = ({ 
  data, 
  loading 
}) => {
  if (loading || !data) {
    return <LoadingSkeleton />
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FiMapPin className="w-5 h-5 mr-2" />
          Distribuição por Região
        </h3>
        <div className="text-center py-8">
          <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum dado de distribuição disponível</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...data.map(item => item.count))
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  // Ordenar por quantidade (maior para menor)
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FiMapPin className="w-5 h-5 mr-2" />
          Distribuição por Região
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <FiUsers className="w-4 h-4 mr-1" />
          {totalCount} total
        </div>
      </div>
      
      <div className="space-y-6">
        {sortedData.map((region) => (
          <RegionBar
            key={region.region}
            region={region}
            maxCount={maxCount}
            totalCount={totalCount}
          />
        ))}
      </div>

      {/* Resumo */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Região Líder</p>
            <p className="font-medium text-gray-900">{sortedData[0]?.region}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Mais Estabelecimentos</p>
            <p className="font-medium text-gray-900">
              {Math.max(...data.map(r => r.estabelecimentos))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
