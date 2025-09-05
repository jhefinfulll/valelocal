'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export interface FilterState {
  search: string
  status: string
  region: string
  comissionMin: number | undefined
  comissionMax: number | undefined
}

interface FranqueadoFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  onClearFilters: () => void
  regions: string[]
  currentFilters?: FilterState
}

const initialFilters: FilterState = {
  search: '',
  status: '',
  region: '',
  comissionMin: undefined,
  comissionMax: undefined
}

export function FranqueadoFilters({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  regions,
  currentFilters = initialFilters
}: FranqueadoFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters)
    }
  }, [isOpen, currentFilters])

  const handleInputChange = (field: keyof FilterState, value: string) => {
    if (field === 'comissionMin' || field === 'comissionMax') {
      const numValue = value === '' ? undefined : parseFloat(value)
      setFilters(prev => ({ ...prev, [field]: numValue }))
    } else {
      setFilters(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClear = () => {
    setFilters(initialFilters)
    onClearFilters()
    onClose()
  }

  const hasActiveFilters = filters.search !== '' || 
    filters.status !== '' || 
    filters.region !== '' || 
    filters.comissionMin !== undefined || 
    filters.comissionMax !== undefined

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros de Pesquisa"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por texto
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nome, email, CNPJ..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos os status</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Região
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todas as regiões</option>
              {regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Comissão (%)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={filters.comissionMin?.toString() || ''}
              onChange={(e) => handleInputChange('comissionMin', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Mín"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={filters.comissionMax?.toString() || ''}
              onChange={(e) => handleInputChange('comissionMax', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Máx"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {hasActiveFilters ? 'Filtros ativos' : 'Nenhum filtro aplicado'}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              Limpar
            </Button>
            <Button onClick={handleApply}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
