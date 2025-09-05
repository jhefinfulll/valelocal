'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiCreditCard,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCode,
  FiUser,
  FiShoppingBag,
  FiEye,
  FiEdit,
  FiTrash2,
  FiX,
  FiSave,
  FiMoreHorizontal,
  FiDollarSign,
  FiLock,
  FiUnlock
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useCartoes } from '@/hooks/useCartoes';
import { useToast } from '@/hooks/useToast';
import { api } from '@/config/api';
import { downloadQRCode } from '@/utils/downloadHelpers';

export default function CartoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRecarregarModal, setShowRecarregarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBloquearModal, setShowBloquearModal] = useState(false);
  const [showAtivarModal, setShowAtivarModal] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  // Estados para formulário
  const [formData, setFormData] = useState({
    codigo: '',
    qrCode: '',
    franqueadoId: '',
    estabelecimentoId: '',
    valor: 0,
    status: 'DISPONIVEL' as 'DISPONIVEL' | 'ATIVO' | 'UTILIZADO' | 'EXPIRADO'
  });
  const [valorRecarga, setValorRecarga] = useState(0);
  const [franqueados, setFranqueados] = useState<any[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<any[]>([]);
  const [estabelecimentosFiltrados, setEstabelecimentosFiltrados] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Hook para cartões
  const { 
    cartoes, 
    loading, 
    error, 
    createCartao,
    updateCartao,
    deleteCartao,
    recarregarCartao,
    bloquearCartao,
    ativarCartao,
    gerarQRCode,
    refetch
  } = useCartoes();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  // Carregar franqueados
  const loadFranqueados = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const response = await api.get('/franqueados');
      console.log('Franqueados carregados:', response);
      setFranqueados(response.data?.franqueados || response.franqueados || []);
    } catch (error) {
      console.error('Erro ao carregar franqueados:', error);
      showError('Erro ao carregar franqueados');
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  // Carregar estabelecimentos
  const loadEstabelecimentos = useCallback(async () => {
    try {
      const response = await api.get('/estabelecimentos');
      console.log('Estabelecimentos carregados:', response);
      setEstabelecimentos(response.data?.estabelecimentos || response.estabelecimentos || []);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      showError('Erro ao carregar estabelecimentos');
    }
  }, []);

  // Filtrar estabelecimentos por franqueado
  const filtrarEstabelecimentos = useCallback((franqueadoId: string) => {
    if (!franqueadoId) {
      setEstabelecimentosFiltrados([]);
      return;
    }
    
    const filtrados = estabelecimentos.filter(est => est.franqueadoId === franqueadoId);
    setEstabelecimentosFiltrados(filtrados);
  }, [estabelecimentos]);

  // Atualizar estabelecimentos filtrados quando mudar o franqueado no form
  const handleFranqueadoChange = (franqueadoId: string) => {
    setFormData(prev => ({
      ...prev,
      franqueadoId,
      estabelecimentoId: '' // Limpar estabelecimento quando mudar franqueado
    }));
    filtrarEstabelecimentos(franqueadoId);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadFranqueados();
    loadEstabelecimentos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers para ações
  const handleCreate = () => {
    setFormData({
      codigo: '',
      qrCode: '',
      franqueadoId: '',
      estabelecimentoId: '',
      valor: 0,
      status: 'DISPONIVEL'
    });
    setShowCreateModal(true);
  };

  const handleEdit = (cartao: any) => {
    setSelectedCartao(cartao);
    
    const formDataToSet = {
      codigo: cartao.codigo,
      qrCode: cartao.qrCode,
      franqueadoId: cartao.franqueadoId || '',
      estabelecimentoId: cartao.estabelecimentoId || '',
      valor: cartao.valor,
      status: cartao.status
    };
    
    setFormData(formDataToSet);
    
    // Filtrar estabelecimentos para o franqueado do cartão
    if (cartao.franqueadoId) {
      filtrarEstabelecimentos(cartao.franqueadoId);
    } else {
      setEstabelecimentosFiltrados([]);
    }
    
    setShowEditModal(true);
  };

  const handleView = (cartao: any) => {
    setSelectedCartao(cartao);
    setShowViewModal(true);
  };

  const handleDelete = async (cartao: any) => {
    setSelectedCartao(cartao);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCartao) {
      try {
        await deleteCartao(selectedCartao.id);
        showSuccess('Cartão excluído com sucesso!');
        refetch();
      } catch (error) {
        showError('Erro ao excluir cartão');
      }
    }
    setShowDeleteModal(false);
    setSelectedCartao(null);
  };

  const handleDownloadQR = async (cartao: any) => {
    try {
      const qrData = await gerarQRCode(cartao.id);
      
      if (qrData && qrData.dataUrl) {
        const success = downloadQRCode(qrData.dataUrl, `qr-${cartao.codigo}`);
        
        if (success) {
          showSuccess('QR Code baixado com sucesso!');
        } else {
          showError('Erro ao fazer download do QR Code');
        }
      } else {
        showError('QR Code não foi gerado corretamente');
      }
    } catch (error) {
      console.error('Erro ao gerar/baixar QR Code:', error);
      showError('Erro ao gerar QR Code');
    }
  };

  const handleHistory = (cartao: any) => {
    // Usar router do Next.js
    router.push(`/transacoes?cartao=${cartao.id}`);
  };

  const handleSave = async () => {
    try {
      if (showCreateModal) {
        // Validações
        if (!formData.codigo.trim()) {
          showError('Código do cartão é obrigatório');
          return;
        }
        
        if (!formData.franqueadoId) {
          showError('Franqueado é obrigatório');
          return;
        }
        
        await createCartao({
          codigo: formData.codigo.trim(),
          qrCode: `QR_${formData.codigo.trim()}_${Date.now()}`, // Gerar QR Code único
          valor: formData.valor || 0,
          franqueadoId: formData.franqueadoId,
          estabelecimentoId: formData.estabelecimentoId || undefined
        });
        setShowCreateModal(false);
        showSuccess('Cartão criado com sucesso!');
      } else if (showEditModal && selectedCartao) {
        await updateCartao(selectedCartao.id, {
          codigo: formData.codigo,
          qrCode: formData.qrCode || selectedCartao.qrCode,
          valor: formData.valor,
          franqueadoId: formData.franqueadoId || selectedCartao.franqueadoId,
          estabelecimentoId: formData.estabelecimentoId || selectedCartao.estabelecimentoId
        });
        setShowEditModal(false);
        showSuccess('Cartão atualizado com sucesso!');
      }
      refetch();
    } catch (error) {
      showError('Erro ao salvar cartão');
    }
  };

  const handleRecarregar = async (cartao: any) => {
    setSelectedCartao(cartao);
    setShowRecarregarModal(true);
  };

  const confirmarRecarga = async () => {
    if (valorRecarga && valorRecarga > 0 && selectedCartao) {
      try {
        await recarregarCartao(selectedCartao.id, valorRecarga);
        showSuccess('Cartão recarregado com sucesso!');
        setShowRecarregarModal(false);
        setValorRecarga(0);
        setSelectedCartao(null);
        refetch();
      } catch (error) {
        showError('Erro ao recarregar cartão');
      }
    }
  };

  const handleBloquear = async (cartao: any) => {
    setSelectedCartao(cartao);
    setShowBloquearModal(true);
  };

  const confirmBloquear = async () => {
    if (selectedCartao) {
      try {
        await bloquearCartao(selectedCartao.id);
        showSuccess('Cartão bloqueado com sucesso!');
        refetch();
      } catch (error) {
        showError('Erro ao bloquear cartão');
      }
    }
    setShowBloquearModal(false);
    setSelectedCartao(null);
  };

  const handleAtivar = async (cartao: any) => {
    setSelectedCartao(cartao);
    setShowAtivarModal(true);
  };

  const confirmAtivar = async () => {
    if (selectedCartao) {
      try {
        await ativarCartao(selectedCartao.id);
        showSuccess('Cartão ativado com sucesso!');
        refetch();
      } catch (error) {
        showError('Erro ao ativar cartão');
      }
    }
    setShowAtivarModal(false);
    setSelectedCartao(null);
  };

  // Filtra cartões baseado no tipo de usuário
  const getFilteredCartoes = () => {
    let cartoesFiltered = cartoes;
    
    // Se for franqueado, mostra apenas cartões da sua rede
    if (user?.type === 'franqueado') {
      const franqueado = franqueados.find(f => f.email === user.email);
      if (franqueado) {
        cartoesFiltered = cartoesFiltered.filter(c => c.franqueadoId === franqueado.id);
      }
    }
    
    // Se for estabelecimento, mostra apenas seus cartões
    if (user?.type === 'estabelecimento') {
      const estabelecimento = estabelecimentos.find(e => e.email === user.email);
      if (estabelecimento) {
        cartoesFiltered = cartoesFiltered.filter(c => c.estabelecimentoId === estabelecimento.id);
      }
    }

    // Aplica filtros de busca
    if (searchTerm) {
      cartoesFiltered = cartoesFiltered.filter(cartao =>
        cartao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cartao.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      cartoesFiltered = cartoesFiltered.filter(c => c.status === statusFilter.toUpperCase());
    }

    return cartoesFiltered;
  };

  const filteredCartoes = getFilteredCartoes();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['franqueadora', 'franqueado', 'estabelecimento']}>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['franqueadora', 'franqueado', 'estabelecimento']}>
        <Layout>
          <div className="text-center p-8">
            <div className="text-red-600 text-xl font-semibold mb-2">Erro ao carregar cartões</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getEstabelecimentoName = (estabelecimentoId?: string | null) => {
    if (!estabelecimentoId) return 'Cartão Geral';
    const estabelecimento = estabelecimentos.find(e => e.id === estabelecimentoId);
    return estabelecimento?.name || 'N/A';
  };

  const getFranqueadoName = (franqueadoId: string) => {
    const franqueado = franqueados.find(f => f.id === franqueadoId);
    return franqueado?.name || 'N/A';
  };

  const getTransacaoInfo = (cartaoId: string) => {
    // Por enquanto retorna informações básicas
    // TODO: Implementar busca real de transações quando a API estiver pronta
    return {
      total: 0,
      ultimaTransacao: null
    };
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const icons = {
      DISPONIVEL: <FiClock className="w-4 h-4 text-gray-500" />,
      ATIVO: <FiActivity className="w-4 h-4 text-green-500" />,
      UTILIZADO: <FiCheckCircle className="w-4 h-4 text-blue-500" />,
      EXPIRADO: <FiXCircle className="w-4 h-4 text-red-500" />
    };
    return icons[status as keyof typeof icons] || icons.DISPONIVEL;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      DISPONIVEL: 'bg-gray-100 text-gray-600',
      ATIVO: 'bg-green-100 text-green-600',
      UTILIZADO: 'bg-blue-100 text-blue-600',
      EXPIRADO: 'bg-red-100 text-red-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${colors[status as keyof typeof colors]}`}>
        <StatusIcon status={status} />
        <span>{status.toLowerCase().charAt(0).toUpperCase() + status.toLowerCase().slice(1)}</span>
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado', 'estabelecimento']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.type === 'estabelecimento' ? 'Meus Cartões' : 'Gestão de Cartões'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'estabelecimento' 
                  ? 'Acompanhe os cartões do seu estabelecimento'
                  : user?.type === 'franqueado'
                  ? 'Gerencie os cartões da sua região'
                  : 'Gerencie todos os cartões da rede'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>
              {user?.type !== 'estabelecimento' && (
                <button 
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Gerar Cartões
                </button>
              )}
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiCreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Cartões</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredCartoes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiActivity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cartões Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCartoes.filter(c => c.status === 'ATIVO').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCartoes.filter(c => c.status === 'UTILIZADO').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {filteredCartoes.reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por código ou QR Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos os status</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="UTILIZADO">Utilizado</option>
                  <option value="EXPIRADO">Expirado</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FiFilter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Cartões */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cartões Cadastrados</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cartão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estabelecimento
                    </th>
                    {user?.type === 'franqueadora' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Franqueado
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atividade
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
                  {filteredCartoes.map((cartao) => {
                    const transacaoInfo = getTransacaoInfo(cartao.id);
                    
                    return (
                      <tr key={cartao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <FiCreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cartao.codigo}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiCode className="w-3 h-3 mr-1" />
                                QR Code disponível
                              </div>
                              {cartao.dataAtivacao && (
                                <div className="text-xs text-gray-500">
                                  Ativado em {new Date(cartao.dataAtivacao).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {cartao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          {cartao.dataUtilizacao && (
                            <div className="text-xs text-gray-500">
                              Utilizado em {new Date(cartao.dataUtilizacao).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getEstabelecimentoName(cartao.estabelecimentoId)}
                          </div>
                        </td>
                        {user?.type === 'franqueadora' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getFranqueadoName(cartao.franqueadoId)}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{transacaoInfo.total}</span>
                              <span className="text-gray-500">transações</span>
                            </div>
                            {transacaoInfo.ultimaTransacao && (
                              <div className="text-xs text-gray-500">
                                Última: {new Date().toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={cartao.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleView(cartao)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Ver detalhes"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadQR(cartao)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Baixar QR Code"
                          >
                            <FiCode className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleHistory(cartao)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Ver histórico"
                          >
                            <FiShoppingBag className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(cartao)}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cartao)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown de ações especiais */}
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(showDropdown === cartao.id ? null : cartao.id);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1"
                              title="Mais ações"
                            >
                              <FiMoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {showDropdown === cartao.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleRecarregar(cartao);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FiDollarSign className="w-4 h-4 mr-2" />
                                    Recarregar
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleBloquear(cartao);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FiLock className="w-4 h-4 mr-2" />
                                    Bloquear
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleAtivar(cartao);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FiUnlock className="w-4 h-4 mr-2" />
                                    Ativar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
              <div className="space-y-4">
                {['DISPONIVEL', 'ATIVO', 'UTILIZADO', 'EXPIRADO'].map(status => {
                  const cartoesPorStatus = filteredCartoes.filter(c => c.status === status);
                  const percentage = filteredCartoes.length > 0 ? (cartoesPorStatus.length / filteredCartoes.length) * 100 : 0;
                  const valorTotal = cartoesPorStatus.reduce((acc, c) => acc + c.valor, 0);
                  
                  return (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon status={status} />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{status.toLowerCase()}</p>
                          <p className="text-sm text-gray-500">
                            {cartoesPorStatus.length} cartão(ões) • R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Ativação</span>
                  <span className="font-semibold text-green-600">
                    {filteredCartoes.length > 0 
                      ? ((filteredCartoes.filter(c => c.status !== 'DISPONIVEL').length / filteredCartoes.length) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Utilização</span>
                  <span className="font-semibold text-blue-600">
                    {filteredCartoes.length > 0 
                      ? ((filteredCartoes.filter(c => c.status === 'UTILIZADO').length / filteredCartoes.length) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Médio por Cartão</span>
                  <span className="font-semibold">
                    R$ {filteredCartoes.length > 0 
                      ? (filteredCartoes.reduce((acc, c) => acc + c.valor, 0) / filteredCartoes.length).toFixed(2)
                      : '0.00'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total em Circulação</span>
                  <span className="font-semibold">
                    R$ {filteredCartoes
                      .filter(c => c.status === 'ATIVO')
                      .reduce((acc, c) => acc + c.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Criação */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Criar Novo Cartão</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Cartão *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o código do cartão"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Franqueado *
                  </label>
                  <select
                    value={formData.franqueadoId}
                    onChange={(e) => handleFranqueadoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loadingDropdowns}
                  >
                    <option value="">
                      {loadingDropdowns ? 'Carregando...' : 'Selecione um franqueado'}
                    </option>
                    {franqueados.map((franqueado) => (
                      <option key={franqueado.id} value={franqueado.id}>
                        {franqueado.name} - {franqueado.region || franqueado.cnpj}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estabelecimento
                  </label>
                  <select
                    key={`estabelecimento-create-${formData.franqueadoId}-${estabelecimentosFiltrados.length}`}
                    value={formData.estabelecimentoId}
                    onChange={(e) => setFormData({ ...formData, estabelecimentoId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingDropdowns || !formData.franqueadoId}
                  >
                    <option value="">
                      {!formData.franqueadoId 
                        ? 'Selecione um franqueado primeiro' 
                        : loadingDropdowns 
                        ? 'Carregando...' 
                        : 'Nenhum (cartão geral)'}
                    </option>
                    {estabelecimentosFiltrados.map((estabelecimento) => (
                      <option key={estabelecimento.id} value={estabelecimento.id}>
                        {estabelecimento.name} - {estabelecimento.category || estabelecimento.cnpj}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Editar Cartão</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Cartão
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="UTILIZADO">Utilizado</option>
                    <option value="EXPIRADO">Expirado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Franqueado *
                  </label>
                  <select
                    value={formData.franqueadoId}
                    onChange={(e) => handleFranqueadoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loadingDropdowns}
                  >
                    <option value="">
                      {loadingDropdowns ? 'Carregando...' : 'Selecione um franqueado'}
                    </option>
                    {franqueados.map((franqueado) => (
                      <option key={franqueado.id} value={franqueado.id}>
                        {franqueado.name} - {franqueado.region || franqueado.cnpj}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estabelecimento
                  </label>
                  <select
                    key={`estabelecimento-edit-${formData.franqueadoId}-${estabelecimentosFiltrados.length}`}
                    value={formData.estabelecimentoId}
                    onChange={(e) => setFormData({ ...formData, estabelecimentoId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingDropdowns || !formData.franqueadoId}
                  >
                    <option value="">
                      {!formData.franqueadoId 
                        ? 'Selecione um franqueado primeiro' 
                        : loadingDropdowns 
                        ? 'Carregando...' 
                        : 'Nenhum (cartão geral)'}
                    </option>
                    {estabelecimentosFiltrados.map((estabelecimento) => (
                      <option key={estabelecimento.id} value={estabelecimento.id}>
                        {estabelecimento.name} - {estabelecimento.category || estabelecimento.cnpj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização */}
        {showViewModal && selectedCartao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes do Cartão</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Código</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedCartao.codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Valor</label>
                  <p className="text-lg font-semibold text-green-600">
                    R$ {selectedCartao.valor?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <StatusBadge status={selectedCartao.status} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Criação</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedCartao.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Recarga */}
        {showRecarregarModal && selectedCartao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recarregar Cartão
                </h3>
                <button
                  onClick={() => {
                    setShowRecarregarModal(false);
                    setValorRecarga(0);
                    setSelectedCartao(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cartão</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedCartao.codigo}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Saldo Atual</label>
                  <p className="text-lg font-semibold text-green-600">
                    R$ {selectedCartao.valor?.toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Recarga *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={valorRecarga}
                    onChange={(e) => setValorRecarga(Number(e.target.value))}
                    placeholder="Digite o valor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Novo saldo:</strong> R$ {((selectedCartao.valor || 0) + valorRecarga).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowRecarregarModal(false);
                    setValorRecarga(0);
                    setSelectedCartao(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarRecarga}
                  disabled={!valorRecarga || valorRecarga <= 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirmar Recarga
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação - Excluir */}
        {showDeleteModal && selectedCartao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCartao(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Tem certeza que deseja excluir o cartão <strong>{selectedCartao.codigo}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCartao(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação - Bloquear */}
        {showBloquearModal && selectedCartao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Bloqueio
                </h3>
                <button
                  onClick={() => {
                    setShowBloquearModal(false);
                    setSelectedCartao(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Tem certeza que deseja bloquear o cartão <strong>{selectedCartao.codigo}</strong>?
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  O cartão não poderá ser utilizado até ser ativado novamente.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowBloquearModal(false);
                    setSelectedCartao(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBloquear}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação - Ativar */}
        {showAtivarModal && selectedCartao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Ativação
                </h3>
                <button
                  onClick={() => {
                    setShowAtivarModal(false);
                    setSelectedCartao(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Tem certeza que deseja ativar o cartão <strong>{selectedCartao.codigo}</strong>?
                </p>
                <p className="text-sm text-green-600 mt-2">
                  O cartão voltará a estar disponível para uso.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAtivarModal(false);
                    setSelectedCartao(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAtivar}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Ativar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sistema de Toast */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                flex items-center p-4 rounded-lg shadow-lg text-white font-medium transform transition-all duration-500
                ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              <div className="flex items-center">
                {toast.type === 'success' && <FiCheckCircle className="w-5 h-5 mr-2" />}
                {toast.type === 'error' && <FiXCircle className="w-5 h-5 mr-2" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
