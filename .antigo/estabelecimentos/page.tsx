'use client';

import { useState } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiCreditCard,
  FiX,
  FiDollarSign
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';
import EstabelecimentoModal from '@/components/estabelecimentos/EstabelecimentoModal';
import EstabelecimentoPaymentModal from '@/components/estabelecimentos/EstabelecimentoPaymentModal';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { Estabelecimento } from '@/services/estabelecimentosService';
import { mockEstabelecimentos, mockFranqueados, mockCartoes, mockTransacoes } from '@/data/mockData';

export default function EstabelecimentosPage() {
  const { user } = useAuth();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  
  // Hook para gerenciar estabelecimentos com dados reais
  const {
    estabelecimentos: realEstabelecimentos,
    loading,
    pagination,
    filters,
    createEstabelecimento,
    updateEstabelecimento,
    deleteEstabelecimento,
    exportEstabelecimentos,
    updateFilters,
    refetch
  } = useEstabelecimentos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<Estabelecimento | undefined>();
  const [editingItem, setEditingItem] = useState<Estabelecimento | null>(null);
  const [viewingItem, setViewingItem] = useState<Estabelecimento | null>(null);
  const [paymentItem, setPaymentItem] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Funções de manipulação do modal
  const handleSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateEstabelecimento(editingItem.id, data);
        showSuccess('Estabelecimento atualizado com sucesso!');
      } else {
        await createEstabelecimento(data);
        showSuccess('Estabelecimento criado com sucesso!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      const errorMessage = editingItem ? 'Erro ao atualizar estabelecimento' : 'Erro ao criar estabelecimento';
      showError(errorMessage);
      console.error('Erro ao salvar estabelecimento:', error);
    }
  };

  const handleEdit = (estabelecimento: Estabelecimento) => {
    setEditingItem(estabelecimento);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEstabelecimento(id);
      showSuccess('Estabelecimento excluído com sucesso!');
      setShowDeleteConfirm(null);
    } catch (error) {
      showError('Erro ao excluir estabelecimento');
      console.error('Erro ao excluir estabelecimento:', error);
    }
  };

  const handleView = (estabelecimento: Estabelecimento) => {
    setViewingItem(estabelecimento);
    setIsViewModalOpen(true);
  };

  const handleViewPayment = (estabelecimento: any) => {
    // Simular dados de cobrança para demonstração
    const estabelecimentoComCobranca = {
      ...estabelecimento,
      cobrancas: estabelecimento.status.toLowerCase() === 'pendente_pagamento' || 
                 estabelecimento.status === 'PENDENTE_PAGAMENTO' ? [{
        id: `cob_${estabelecimento.id}`,
        valor: 150.00,
        vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        urlPagamento: `https://asaas.com/pay/${estabelecimento.id}`,
        pixQrCode: '00020126580014br.gov.bcb.pix01364e4f0f8c-3f5f-4b5f-9f5f-4b5f9f5f4b5f5204000053039865802BR5925ESTABELECIMENTO LTDA6009SAO PAULO62070503***63049999',
        status: 'PENDING'
      }] : []
    };
    
    setPaymentItem(estabelecimentoComCobranca);
    setIsPaymentModalOpen(true);
  };

  const handleRefreshPayment = async () => {
    // Simular atualização do status
    showSuccess('Status do pagamento atualizado!');
    await refetch();
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Se temos dados reais, usar a função de exportar do hook
      if (realEstabelecimentos.length > 0) {
        await exportEstabelecimentos(filters);
        showSuccess('Dados exportados com sucesso!');
      } else {
        // Fallback para dados mock - criar CSV manual
        const csvData = getFilteredEstabelecimentos().map(est => ({
          Nome: est.name,
          CNPJ: est.cnpj,
          Email: est.email,
          Telefone: est.phone,
          Endereço: est.address,
          Categoria: est.category,
          Status: est.status,
          Franqueado: getFranqueadoName(est.franqueadoId)
        }));

        const csvContent = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `estabelecimentos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Dados exportados com sucesso!');
      }
    } catch (error) {
      showError('Erro ao exportar dados');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Filtra estabelecimentos baseado no tipo de usuário - usa dados reais ou mock como fallback
  const getFilteredEstabelecimentos = () => {
    // Usar dados reais se disponíveis, senão usar mock
    let estabelecimentos = realEstabelecimentos.length > 0 ? realEstabelecimentos.map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      address: e.address,
      category: e.category,
      status: e.status.toLowerCase(),
      franqueadoId: e.franqueadoId,
      cnpj: e.cnpj
    })) : mockEstabelecimentos;
    
    // Se for franqueado, mostra apenas seus estabelecimentos
    if (user?.type === 'franqueado') {
      const franqueado = mockFranqueados.find(f => f.email === user.email);
      if (franqueado) {
        estabelecimentos = estabelecimentos.filter(e => e.franqueadoId === franqueado.id);
      }
    }

    // Aplica filtros de busca apenas se não estivermos usando filtros do hook
    if (!realEstabelecimentos.length && searchTerm) {
      estabelecimentos = estabelecimentos.filter(estabelecimento =>
        estabelecimento.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estabelecimento.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estabelecimento.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!realEstabelecimentos.length && categoryFilter) {
      estabelecimentos = estabelecimentos.filter(e => e.category === categoryFilter);
    }

    return estabelecimentos;
  };

  const filteredEstabelecimentos = getFilteredEstabelecimentos();

  // Funções para manipulação do CRUD e filtros
  const handleSearch = () => {
    if (realEstabelecimentos.length > 0) {
      updateFilters({
        ...filters,
        search: searchTerm,
        category: categoryFilter || undefined,
        status: statusFilter as any || undefined,
        page: 1
      });
    }
    // Para dados mock, o filtro é aplicado automaticamente na função getFilteredEstabelecimentos
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    if (realEstabelecimentos.length > 0) {
      updateFilters({ page: 1, limit: filters.limit });
    }
  };

  const applyFilters = () => {
    handleSearch();
  };

  const handleCreateEstabelecimento = () => {
    setSelectedEstabelecimento(undefined);
    setIsModalOpen(true);
  };

  const handleEditEstabelecimento = (estabelecimento: any) => {
    // Converter para o formato esperado pelo modal
    const estabelecimentoForEdit = realEstabelecimentos.find(e => e.id === estabelecimento.id) || {
      ...estabelecimento,
      status: estabelecimento.status.toUpperCase()
    };
    setSelectedEstabelecimento(estabelecimentoForEdit as Estabelecimento);
    setIsModalOpen(true);
  };

  const handleDeleteEstabelecimento = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm && realEstabelecimentos.length > 0) {
      await deleteEstabelecimento(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleModalSave = async (data: any) => {
    if (realEstabelecimentos.length > 0) {
      if (selectedEstabelecimento) {
        await updateEstabelecimento(selectedEstabelecimento.id, data);
      } else {
        await createEstabelecimento(data);
      }
    }
    setIsModalOpen(false);
    setSelectedEstabelecimento(undefined);
  };

  const handleExport = async () => {
    if (realEstabelecimentos.length > 0) {
      await exportEstabelecimentos();
    }
  };

  const getEstabelecimentoStats = (estabelecimentoId: string) => {
    const cartoes = mockCartoes.filter(c => c.estabelecimentoId === estabelecimentoId);
    const transacoes = mockTransacoes.filter(t => t.estabelecimentoId === estabelecimentoId);
    
    return {
      cartoes: cartoes.length,
      transacoes: transacoes.length,
      valorTotal: transacoes.reduce((acc, t) => acc + t.valor, 0)
    };
  };

  const getFranqueadoName = (franqueadoId: string) => {
    const franqueado = mockFranqueados.find(f => f.id === franqueadoId);
    return franqueado?.name || 'N/A';
  };

  // Obter categorias dos dados reais ou mock
  const categories = realEstabelecimentos.length > 0 
    ? Array.from(new Set(realEstabelecimentos.map(e => e.category).filter(Boolean)))
    : Array.from(new Set(mockEstabelecimentos.map(e => e.category)));

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'ativo' 
        ? 'bg-green-100 text-green-600' 
        : 'bg-red-100 text-red-600'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.type === 'franqueado' ? 'Meus Estabelecimentos' : 'Gestão de Estabelecimentos'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'franqueado' 
                  ? 'Gerencie os estabelecimentos da sua região' 
                  : 'Gerencie todos os estabelecimentos da rede'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button 
                onClick={handleExportData}
                disabled={loading || isExporting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar'}
              </button>
              <button 
                onClick={handleCreateEstabelecimento}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Novo Estabelecimento
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realEstabelecimentos.length > 0 ? pagination.total : filteredEstabelecimentos.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiEye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realEstabelecimentos.length > 0 
                      ? realEstabelecimentos.filter(e => e.status === 'ATIVO').length
                      : filteredEstabelecimentos.filter(e => e.status === 'ativo').length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(filteredEstabelecimentos.map(e => e.category)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cartões Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realEstabelecimentos.length > 0 
                      ? realEstabelecimentos.filter(e => e._count && e._count.cartoes > 0).length
                      : mockCartoes.filter(c => 
                          filteredEstabelecimentos.some(e => e.id === c.estabelecimentoId) && 
                          c.status === 'ativo'
                        ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar estabelecimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os status</option>
                <option value={realEstabelecimentos.length > 0 ? "ATIVO" : "ativo"}>Ativo</option>
                <option value={realEstabelecimentos.length > 0 ? "INATIVO" : "inativo"}>Inativo</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={applyFilters}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <FiSearch className="w-4 h-4 mr-2" />
                  Filtrar
                </button>
                <button
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Estabelecimentos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estabelecimentos Cadastrados</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estabelecimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    {user?.type === 'franqueadora' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Franqueado
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEstabelecimentos.map((estabelecimento) => {
                    const stats = getEstabelecimentoStats(estabelecimento.id);
                    
                    return (
                      <tr key={estabelecimento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {estabelecimento.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{estabelecimento.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiMail className="w-3 h-3 mr-1" />
                                {estabelecimento.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiPhone className="w-3 h-3 mr-1" />
                                {estabelecimento.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{estabelecimento.category}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {estabelecimento.address.split(',')[0]}
                          </div>
                        </td>
                        {user?.type === 'franqueadora' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getFranqueadoName(estabelecimento.franqueadoId)}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="font-medium">{stats.cartoes}</div>
                                <div className="text-xs text-gray-500">Cartões</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{stats.transacoes}</div>
                                <div className="text-xs text-gray-500">Transações</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">R$ {stats.valorTotal.toFixed(0)}</div>
                                <div className="text-xs text-gray-500">Volume</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={estabelecimento.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleView(estabelecimento as Estabelecimento)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Visualizar"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewPayment(estabelecimento)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Status de Pagamento"
                          >
                            <FiDollarSign className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(estabelecimento as Estabelecimento)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(estabelecimento.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Categoria</h3>
              <div className="space-y-4">
                {categories.map(category => {
                  const estabelecimentosDaCategoria = filteredEstabelecimentos.filter(e => e.category === category);
                  const percentage = (estabelecimentosDaCategoria.length / filteredEstabelecimentos.length) * 100;
                  
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
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Geral</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Ativação</span>
                  <span className="font-semibold text-green-600">
                    {((filteredEstabelecimentos.filter(e => e.status === 'ativo').length / filteredEstabelecimentos.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cartões por Estabelecimento</span>
                  <span className="font-semibold">
                    {(mockCartoes.filter(c => 
                      filteredEstabelecimentos.some(e => e.id === c.estabelecimentoId)
                    ).length / filteredEstabelecimentos.length).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volume Total</span>
                  <span className="font-semibold">
                    R$ {mockTransacoes
                      .filter(t => filteredEstabelecimentos.some(e => e.id === t.estabelecimentoId))
                      .reduce((acc, t) => acc + t.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Médio</span>
                  <span className="font-semibold">
                    R$ {(mockTransacoes
                      .filter(t => filteredEstabelecimentos.some(e => e.id === t.estabelecimentoId))
                      .reduce((acc, t) => acc + t.valor, 0) / 
                      mockTransacoes.filter(t => filteredEstabelecimentos.some(e => e.id === t.estabelecimentoId)).length || 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <EstabelecimentoModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSubmit}
            estabelecimento={editingItem || undefined}
          />
        )}

        {/* View Modal */}
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Estabelecimento</h3>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Básicas</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Nome:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">CNPJ:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.cnpj}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Telefone:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Categoria:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <StatusBadge status={typeof viewingItem.status === 'string' ? viewingItem.status.toLowerCase() : 'ativo'} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Localização e Relacionamentos</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Endereço:</span>
                        <p className="text-sm font-medium text-gray-900">{viewingItem.address}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Franqueado:</span>
                        <p className="text-sm font-medium text-gray-900">{getFranqueadoName(viewingItem.franqueadoId || '')}</p>
                      </div>
                      {viewingItem.logo && (
                        <div>
                          <span className="text-sm text-gray-500">Logo:</span>
                          <div className="mt-2">
                            <img 
                              src={viewingItem.logo} 
                              alt="Logo" 
                              className="w-16 h-16 object-contain border border-gray-200 rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Estatísticas</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {(() => {
                      const stats = getEstabelecimentoStats(viewingItem.id);
                      return (
                        <>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.cartoes}</div>
                            <div className="text-sm text-blue-600">Cartões</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.transacoes}</div>
                            <div className="text-sm text-green-600">Transações</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">R$ {stats.valorTotal.toFixed(0)}</div>
                            <div className="text-sm text-purple-600">Volume Total</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingItem(null);
                    handleEdit(viewingItem);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && paymentItem && (
          <EstabelecimentoPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setPaymentItem(null);
            }}
            estabelecimento={paymentItem}
            onRefresh={handleRefreshPayment}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza de que deseja excluir este estabelecimento? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </ProtectedRoute>
  );
}
