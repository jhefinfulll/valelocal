'use client'

import React, { useState, useEffect } from 'react'
import { FiPlus, FiRefreshCw, FiAlertCircle } from 'react-icons/fi'
import { EstabelecimentosStatsCards } from '@/components/estabelecimentos/EstabelecimentosStatsCards'
import { EstabelecimentosTable } from '@/components/estabelecimentos/EstabelecimentosTable'
import { EstabelecimentoModal } from '@/components/estabelecimentos/EstabelecimentoModal'
import { EstabelecimentoPasswordModal } from '@/components/estabelecimentos/EstabelecimentoPasswordModal'
import { EstabelecimentoPaymentModal } from '@/components/estabelecimentos/EstabelecimentoPaymentModal'
import { DeleteEstabelecimentoModal } from '@/components/estabelecimentos/DeleteEstabelecimentoModal'
import { CobrancasTable } from '@/components/cobrancas/CobrancasTable'
import { ToastContainer } from '@/components/ui/Toast'
import { estabelecimentosService, EstabelecimentoData, CreateEstabelecimentoData, UpdateEstabelecimentoData } from '@/services/estabelecimentosService'
import { franqueadosService, FranqueadoData } from '@/services/franqueadosService'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

function EstabelecimentosPageContent() {
  const { user } = useAuth()
  const { showSuccess, showError, showInfo, toasts, removeToast } = useToast()
  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoData[]>([])
  const [franqueados, setFranqueados] = useState<FranqueadoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Estados do modal de estabelecimento
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<EstabelecimentoData | null>(null)

  // Estados do modal de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedEstabelecimentoForPassword, setSelectedEstabelecimentoForPassword] = useState<EstabelecimentoData | null>(null)

  // Estados do modal de pagamento
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedEstabelecimentoForPayment, setSelectedEstabelecimentoForPayment] = useState<EstabelecimentoData | null>(null)

  // Estados do modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Para franqueados, a API já filtra automaticamente pelos seus estabelecimentos
      // Para franqueadoras, carrega todos os estabelecimentos
      const [estabelecimentosResponse, franqueadosResponse] = await Promise.all([
        estabelecimentosService.getAll(),
        franqueadosService.getFranqueados()
      ])
      
      console.log('🏢 Estabelecimentos carregados:', estabelecimentosResponse.estabelecimentos?.length || 0)
      console.log('👥 Franqueados carregados:', franqueadosResponse.franqueados?.length || 0)
      console.log('👤 Usuário atual:', user ? { type: user.type, franqueadoId: user.franqueadoId } : 'Não logado')
      
      setEstabelecimentos(estabelecimentosResponse.estabelecimentos)
      setFranqueados(franqueadosResponse.franqueados)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      showError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  const handleCreate = () => {
    setSelectedEstabelecimento(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (estabelecimento: EstabelecimentoData) => {
    setSelectedEstabelecimento(estabelecimento)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleView = (estabelecimento: EstabelecimentoData) => {
    setSelectedEstabelecimento(estabelecimento)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleSave = async (data: CreateEstabelecimentoData | UpdateEstabelecimentoData) => {
    try {
      if (modalMode === 'create') {
        await estabelecimentosService.create(data as CreateEstabelecimentoData)
        showSuccess('Estabelecimento criado com sucesso!')
      } else if (modalMode === 'edit' && selectedEstabelecimento) {
        await estabelecimentosService.update(selectedEstabelecimento.id, data as UpdateEstabelecimentoData)
        showSuccess('Estabelecimento atualizado com sucesso!')
      }
      
      // Recarregar dados
      await loadData()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Erro ao salvar estabelecimento:', err)
      if (modalMode === 'create') {
        showError('Erro ao criar estabelecimento.')
      } else {
        showError('Erro ao atualizar estabelecimento.')
      }
      throw err
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await estabelecimentosService.approve(id)
      await loadData()
      showSuccess('Estabelecimento aprovado com sucesso!')
    } catch (err) {
      console.error('Erro ao aprovar estabelecimento:', err)
      showError('Erro ao aprovar estabelecimento.')
    }
  }

  const handleDelete = (estabelecimento: EstabelecimentoData) => {
    setSelectedEstabelecimento(estabelecimento)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedEstabelecimento) return

    try {
      setDeleting(true)
      await estabelecimentosService.delete(selectedEstabelecimento.id)
      await loadData()
      setShowDeleteModal(false)
      setSelectedEstabelecimento(null)
      showSuccess('Estabelecimento excluído com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir estabelecimento:', err)
      showError('Erro ao excluir estabelecimento.')
    } finally {
      setDeleting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEstabelecimento(null)
  }

  // Função para gerenciar senha
  const handleManagePassword = (estabelecimento: EstabelecimentoData) => {
    setSelectedEstabelecimentoForPassword(estabelecimento)
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setSelectedEstabelecimentoForPassword(null)
  }

  // Função para gerenciar pagamento
  const handleManagePayment = (estabelecimento: EstabelecimentoData) => {
    setSelectedEstabelecimentoForPayment(estabelecimento)
    setIsPaymentModalOpen(true)
  }

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setSelectedEstabelecimentoForPayment(null)
    // Recarregar dados após fechar o modal de pagamento
    loadData()
  }

  // Determinar título e subtítulo baseado no tipo de usuário
  const getPageInfo = () => {
    switch (user?.type) {
      case 'FRANQUEADO':
        return {
          title: 'Meus Estabelecimentos',
          subtitle: 'Gerencie os estabelecimentos da sua franquia'
        }
      case 'FRANQUEADORA':
        return {
          title: 'Estabelecimentos',
          subtitle: 'Gerencie todos os estabelecimentos da rede'
        }
      default:
        return {
          title: 'Estabelecimentos',
          subtitle: 'Gerencie os estabelecimentos cadastrados no sistema'
        }
    }
  }

  const pageInfo = getPageInfo()

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageInfo.title}</h1>
          <p className="text-gray-600">{pageInfo.subtitle}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Novo Estabelecimento
          </button>
        </div>
      </div>

      {/* Cards de estatísticas do componente */}
      <EstabelecimentosStatsCards estabelecimentos={estabelecimentos} loading={isLoading} />

      {/* Tabela de estabelecimentos */}
      <div className="bg-white rounded-lg shadow">
        <EstabelecimentosTable
          data={estabelecimentos}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onApprove={user?.type === 'FRANQUEADORA' ? handleApprove : undefined}
          onDelete={handleDelete}
          onManagePassword={user?.type === 'FRANQUEADORA' ? handleManagePassword : undefined}
          onManagePayment={['FRANQUEADORA', 'FRANQUEADO'].includes(user?.type || '') ? handleManagePayment : undefined}
          userType={user?.type}
        />
      </div>

      {/* Seção de Cobranças */}
      <CobrancasTable onRefresh={loadData} />

      {/* Resumo por Categoria e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Categoria</h3>
          <div className="space-y-4">
            {Array.from(new Set(estabelecimentos.map(e => e.category).filter(Boolean))).map(category => {
              const estabelecimentosDaCategoria = estabelecimentos.filter(e => e.category === category)
              const percentage = estabelecimentos.length > 0 ? (estabelecimentosDaCategoria.length / estabelecimentos.length) * 100 : 0
              
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{category}</p>
                    <p className="text-sm text-gray-500">
                      {estabelecimentosDaCategoria.length} estabelecimento(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      {percentage.toFixed(1)}%
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Geral</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Ativação</span>
              <span className="font-semibold text-green-600">
                {estabelecimentos.length > 0 ? 
                  ((estabelecimentos.filter(e => e.status === 'ATIVO').length / estabelecimentos.length) * 100).toFixed(1) + '%' :
                  '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cartões por Estabelecimento</span>
              <span className="font-semibold">
                {estabelecimentos.length > 0 ? 
                  (estabelecimentos.reduce((acc, e) => acc + (e._count?.cartoes || 0), 0) / estabelecimentos.length).toFixed(1) :
                  '0'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transações Totais</span>
              <span className="font-semibold">
                {estabelecimentos.reduce((acc, e) => acc + (e._count?.transacoes || 0), 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Displays Ativos</span>
              <span className="font-semibold">
                {estabelecimentos.reduce((acc, e) => acc + (e._count?.displays || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EstabelecimentoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        estabelecimento={selectedEstabelecimento}
        franqueados={franqueados}
        currentUser={user ? { type: user.type, franqueadoId: user.franqueadoId || undefined } : undefined}
        onSave={handleSave}
      />

      {/* Modal de Senha */}
      {selectedEstabelecimentoForPassword && (
        <EstabelecimentoPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={closePasswordModal}
          estabelecimentoId={selectedEstabelecimentoForPassword.id}
          estabelecimentoNome={selectedEstabelecimentoForPassword.name}
        />
      )}

      {/* Modal de Pagamento */}
      {selectedEstabelecimentoForPayment && (
        <EstabelecimentoPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          estabelecimentoId={selectedEstabelecimentoForPayment.id}
          estabelecimentoNome={selectedEstabelecimentoForPayment.name}
        />
      )}

      {/* Modal de Exclusão */}
      <DeleteEstabelecimentoModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedEstabelecimento(null)
        }}
        onConfirm={confirmDelete}
        estabelecimento={selectedEstabelecimento}
        loading={deleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default function EstabelecimentosPage() {
  return (
    <ProtectedRoute allowedRoles={['FRANQUEADORA', 'FRANQUEADO']}>
      <DashboardLayout>
        <EstabelecimentosPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
