'use client'
import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { franqueadosService } from '@/services/franqueadosService'
import { StatsCards } from '@/components/franqueados/StatsCards'
import { RegionDistributionChart } from '@/components/franqueados/RegionDistributionChart'
import { PerformanceRecent } from '@/components/franqueados/PerformanceRecent'
import { FranqueadosTable } from '@/components/franqueados/FranqueadosTable'
import { FranqueadoModal } from '@/components/franqueados/FranqueadoModal'
import { FranqueadoFilters } from '@/components/franqueados/FranqueadoFilters'
import { DeleteFranqueadoModal } from '@/components/franqueados/DeleteFranqueadoModal'
import { 
  FiPlus, 
  FiDownload, 
  FiSearch, 
  FiFilter
} from 'react-icons/fi'
import type {
  FranqueadoData,
  FranqueadoStats,
  RegionDistribution,
  PerformanceData,
  CreateFranqueadoData,
  UpdateFranqueadoData
} from '@/services/franqueadosService'

interface FilterState {
  search: string
  status: string
  region: string
  comissionMin: number | undefined
  comissionMax: number | undefined
}

export default function FranqueadosPage() {
  const { user } = useAuth()
  const { showSuccess, showError, showInfo, toasts, removeToast } = useToast()
  
  // Estados dos dados
  const [franqueados, setFranqueados] = useState<FranqueadoData[]>([])
  const [stats, setStats] = useState<FranqueadoStats | null>(null)
  const [regionData, setRegionData] = useState<RegionDistribution[] | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  
  // Estados de loading
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    region: '',
    comissionMin: undefined,
    comissionMax: undefined
  })
  
  // Estados dos modais
  const [showModal, setShowModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view')
  const [selectedFranqueado, setSelectedFranqueado] = useState<FranqueadoData | null>(null)
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Carregar todos os dados
  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Carregar dados públicos primeiro (não requerem auth)
      try {
        console.log('🔄 Carregando stats...')
        const statsResponse = await franqueadosService.getStats()
        console.log('✅ Stats recebidas:', statsResponse)
        setStats(statsResponse)
        
        console.log('🔄 Carregando regiões...')
        const regionResponse = await franqueadosService.getRegionDistribution()
        console.log('✅ Regiões recebidas:', regionResponse)
        setRegionData(regionResponse)
        
        console.log('🔄 Carregando performance...')
        const performanceResponse = await franqueadosService.getPerformanceData()
        console.log('✅ Performance recebida:', performanceResponse)
        setPerformanceData(performanceResponse)
      } catch (error) {
        console.error('❌ Erro ao carregar dados públicos:', error)
        showError('Erro ao carregar estatísticas')
      }
      
      // Carregar dados que requerem autenticação
      try {
        const franqueadosResponse = await franqueadosService.getFranqueados({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        })
        
        setFranqueados(franqueadosResponse.franqueados)
        setPagination(prev => ({
          ...prev,
          total: franqueadosResponse.pagination.total,
          pages: franqueadosResponse.pagination.pages
        }))
      } catch (error) {
        console.error('Erro ao carregar franqueados:', error)
        showError('Erro ao carregar franqueados. Verifique sua autenticação.')
      }
      
    } catch (error) {
      console.error('Erro geral:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Carregar apenas franqueados (para filtros e paginação)
  const loadFranqueados = async () => {
    try {
      const response = await franqueadosService.getFranqueados({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      })
      
      setFranqueados(response.franqueados)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }))
      
    } catch (error) {
      console.error('Erro ao carregar franqueados:', error)
      showError('Erro ao carregar franqueados')
    }
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadAllData()
  }, [])

  // Efeito para aplicar filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
      loadFranqueados()
    }, 500)

    return () => clearTimeout(timer)
  }, [filters])

  // Efeito para mudança de página
  useEffect(() => {
    if (pagination.page > 1) {
      loadFranqueados()
    }
  }, [pagination.page])

  // Handlers dos modais
  const handleViewFranqueado = (franqueado: FranqueadoData) => {
    setSelectedFranqueado(franqueado)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditFranqueado = (franqueado: FranqueadoData) => {
    setSelectedFranqueado(franqueado)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreateFranqueado = () => {
    setSelectedFranqueado(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleDeleteFranqueado = (franqueado: FranqueadoData) => {
    setSelectedFranqueado(franqueado)
    setShowDeleteModal(true)
  }

  // Operações CRUD
  const handleSaveFranqueado = async (data: CreateFranqueadoData | UpdateFranqueadoData) => {
    try {
      setSaving(true)
      
      if (modalMode === 'create') {
        await franqueadosService.createFranqueado(data as CreateFranqueadoData)
        showSuccess('Franqueado criado com sucesso!')
      } else if (modalMode === 'edit' && selectedFranqueado) {
        await franqueadosService.updateFranqueado(selectedFranqueado.id, data as UpdateFranqueadoData)
        showSuccess('Franqueado atualizado com sucesso!')
      }
      
      await loadAllData() // Recarregar todos os dados
      setShowModal(false)
      setSelectedFranqueado(null)
    } catch (error) {
      console.error('Erro ao salvar franqueado:', error)
      showError('Erro ao salvar franqueado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteFranqueado = async () => {
    if (!selectedFranqueado) return

    try {
      setSaving(true)
      await franqueadosService.deleteFranqueado(selectedFranqueado.id)
      showSuccess('Franqueado excluído com sucesso!')
      await loadAllData()
      setShowDeleteModal(false)
      setSelectedFranqueado(null)
    } catch (error) {
      console.error('Erro ao excluir franqueado:', error)
      showError('Erro ao excluir franqueado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // Handlers de filtros
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    setShowFiltersModal(false)
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      region: '',
      comissionMin: undefined,
      comissionMax: undefined
    })
  }

  // Handler de busca rápida
  const filteredFranqueados = franqueados.filter(franqueado => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    return (
      franqueado.name.toLowerCase().includes(search) ||
      franqueado.email.toLowerCase().includes(search) ||
      franqueado.cnpj.includes(search) ||
      franqueado.region.toLowerCase().includes(search)
    )
  })

  // Handler de exportação
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    showInfo(`Exportação em formato ${format} será implementada em breve`)
  }

  // Loading inicial
  if (loading && franqueados.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['FRANQUEADORA']}>
        <DashboardLayout title="Franqueados" subtitle="Gerencie os franqueados da rede">
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['FRANQUEADORA']}>
      <DashboardLayout 
        title={`Franqueados${stats ? ` (${stats.total})` : ''}`} 
        subtitle="Gerencie os franqueados da rede"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestão de Franqueados</h1>
              <p className="text-gray-600">Gerencie todos os franqueados da rede</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleCreateFranqueado}>
                <FiPlus className="w-4 h-4 mr-2" />
                Novo Franqueado
              </Button>
            </div>
          </div>

          {/* Cards Estatísticos */}
          <StatsCards stats={stats} loading={loading} />

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou região..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFiltersModal(true)}
                >
                  <FiFilter className="w-4 h-4 mr-2" />
                  Filtros
                  {(filters.search !== '' || 
                    filters.status !== '' || 
                    filters.region !== '' || 
                    filters.comissionMin !== undefined || 
                    filters.comissionMax !== undefined) && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                      Ativos
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabela de Franqueados */}
          <FranqueadosTable
            franqueados={filteredFranqueados}
            loading={loading}
            pagination={pagination}
            onView={handleViewFranqueado}
            onEdit={handleEditFranqueado}
            onDelete={handleDeleteFranqueado}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            searchTerm={searchTerm}
          />

          {/* Analytics - Distribuição por Região e Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <RegionDistributionChart data={regionData} loading={loading} />
            <PerformanceRecent data={performanceData} loading={loading} />
          </div>

          {/* Modais */}
          <FranqueadoModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false)
              setSelectedFranqueado(null)
            }}
            onSave={handleSaveFranqueado}
            franqueado={selectedFranqueado}
            mode={modalMode}
            loading={saving}
          />

          <FranqueadoFilters
            isOpen={showFiltersModal}
            onClose={() => setShowFiltersModal(false)}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            regions={['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']}
            currentFilters={filters}
          />

          <DeleteFranqueadoModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedFranqueado(null)
            }}
            onConfirm={confirmDeleteFranqueado}
            franqueado={selectedFranqueado}
            loading={saving}
          />

          {/* Toast Container */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
