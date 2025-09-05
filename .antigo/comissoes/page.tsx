'use client';

import { useState, useEffect } from 'react';
import { 
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPercent,
  FiPlus,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ComissaoModal } from '@/components/comissoes/ComissaoModal';
import { useAuth } from '@/hooks/useAuth';
import { useComissoes } from '@/hooks/useComissoes';
import { useToast } from '@/hooks/useToast';
import { mockFranqueados } from '@/data/mockData';
import type { Comissao } from '@/services/comissoesService';

export default function ComissoesPage() {
  const { user } = useAuth();
  const { 
    comissoes, 
    loading, 
    error, 
    createComissao, 
    updateComissao, 
    fetchComissoes
  } = useComissoes();
  const { showSuccess, showError } = useToast();
  
  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedComissao, setSelectedComissao] = useState<Comissao | null>(null);
  
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('mes');

  // Carregar comissões na inicialização
  useEffect(() => {
    fetchComissoes();
  }, [fetchComissoes]);

  // Filtra comissões baseado no tipo de usuário
  const getFilteredComissoes = () => {
    let filteredComissoes = comissoes || [];
    
    // Se for franqueado, mostra apenas suas comissões
    if (user?.type === 'franqueado') {
      const franqueado = mockFranqueados.find(f => f.email === user.email);
      if (franqueado) {
        filteredComissoes = filteredComissoes.filter((c: Comissao) => c.franqueadoId === franqueado.id);
      }
    }

    // Aplica filtros
    if (searchTerm) {
      filteredComissoes = filteredComissoes.filter((comissao: Comissao) => {
        const franqueado = getFranqueadoName(comissao.franqueadoId);
        return franqueado.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter) {
      filteredComissoes = filteredComissoes.filter((c: Comissao) => c.status === statusFilter);
    }

    // Filtro por data
    const hoje = new Date();
    if (dateRange === 'mes') {
      const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredComissoes = filteredComissoes.filter((c: Comissao) => new Date(c.createdAt) >= mesAtras);
    }

    return filteredComissoes.sort((a: Comissao, b: Comissao) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const filteredComissoes = getFilteredComissoes();

  const getFranqueadoName = (franqueadoId: string) => {
    const franqueado = mockFranqueados.find(f => f.id === franqueadoId);
    return franqueado?.name || 'N/A';
  };

  const getComissaoStats = () => {
    const valorTotal = filteredComissoes.reduce((acc: number, c: Comissao) => acc + c.valorCalculado, 0);
    const valorPago = filteredComissoes.filter(c => c.status === 'PAGA').reduce((acc: number, c: Comissao) => acc + c.valorCalculado, 0);
    const valorPendente = filteredComissoes.filter(c => c.status === 'CALCULADA').reduce((acc: number, c: Comissao) => acc + c.valorCalculado, 0);

    return {
      total: filteredComissoes.length,
      valorTotal,
      valorPago,
      valorPendente,
      pagas: filteredComissoes.filter(c => c.status === 'PAGA').length,
      pendentes: filteredComissoes.filter(c => c.status === 'CALCULADA').length
    };
  };

  const stats = getComissaoStats();

  const handleCreateComissao = () => {
    setSelectedComissao(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditComissao = (comissao: Comissao) => {
    setSelectedComissao(comissao);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewComissao = (comissao: Comissao) => {
    setSelectedComissao(comissao);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await createComissao(data);
        showSuccess('Comissão criada com sucesso!');
      } else if (modalMode === 'edit' && selectedComissao) {
        await updateComissao(selectedComissao.id, data);
        showSuccess('Comissão atualizada com sucesso!');
      }
      setIsModalOpen(false);
      return true;
    } catch (error) {
      showError('Erro ao salvar comissão. Tente novamente.');
      return false;
    }
  };

  const handleProcessPayment = async (comissaoId: string) => {
    try {
      // Simular processamento de pagamento
      await updateComissao(comissaoId, { status: 'PAGA' });
      showSuccess('Pagamento processado com sucesso!');
    } catch (error) {
      showError('Erro ao processar pagamento.');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const configs = {
      CALCULADA: {
        color: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        icon: <FiClock className="w-3 h-3" />
      },
      PAGA: {
        color: 'bg-green-100 text-green-600 border-green-200',
        icon: <FiCheckCircle className="w-3 h-3" />
      },
      CANCELADA: {
        color: 'bg-red-100 text-red-600 border-red-200',
        icon: <FiXCircle className="w-3 h-3" />
      }
    };
    
    const config = configs[status as keyof typeof configs] || configs.CALCULADA;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${config.color}`}>
        {config.icon}
        <span>{status}</span>
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.type === 'franqueado' ? 'Minhas Comissões' : 'Gestão de Comissões'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'franqueado' 
                  ? 'Acompanhe suas comissões e pagamentos'
                  : 'Gerencie comissões de toda a rede'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>
              {user?.type === 'franqueadora' && (
                <button
                  onClick={handleCreateComissao}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nova Comissão
                </button>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Comissões</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pagas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pagas}</p>
                  <p className="text-xs text-gray-500">
                    R$ {stats.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
                  <p className="text-xs text-gray-500">
                    R$ {stats.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPercent className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredComissoes.length > 0 
                      ? (filteredComissoes.reduce((acc: number, c: Comissao) => acc + (c.percentual || 0), 0) / filteredComissoes.length).toFixed(1)
                      : '0'
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar comissões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos os status</option>
                  <option value="CALCULADA">Calculada</option>
                  <option value="PAGA">Paga</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="mes">Último mês</option>
                <option value="trimestre">Último trimestre</option>
                <option value="ano">Último ano</option>
                <option value="todos">Todos</option>
              </select>

              <button 
                onClick={() => fetchComissoes()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Lista de Comissões */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Gestão de Comissões</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando comissões...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">Erro ao carregar comissões: {error}</p>
                <button 
                  onClick={() => fetchComissoes()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : filteredComissoes.length === 0 ? (
              <div className="p-8 text-center">
                <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nenhuma comissão encontrada</p>
                <p className="text-sm text-gray-500">
                  {user?.type === 'franqueadora' 
                    ? 'Clique em "Nova Comissão" para começar'
                    : 'Entre em contato com a franqueadora para mais informações'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Franqueado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
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
                    {filteredComissoes.map((comissao: Comissao) => (
                      <tr key={comissao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {getFranqueadoName(comissao.franqueadoId)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            R$ {comissao.valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiPercent className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {comissao.percentual}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {new Date(comissao.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={comissao.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewComissao(comissao)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Visualizar"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {user?.type === 'franqueadora' && (
                              <>
                                <button 
                                  onClick={() => handleEditComissao(comissao)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Editar"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                {comissao.status === 'CALCULADA' && (
                                  <button 
                                    onClick={() => handleProcessPayment(comissao.id)}
                                    className="text-purple-600 hover:text-purple-900 p-1"
                                    title="Processar Pagamento"
                                  >
                                    <FiCheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Comissão */}
        {isModalOpen && (
          <ComissaoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            comissao={selectedComissao}
            mode={modalMode}
            loading={loading}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
