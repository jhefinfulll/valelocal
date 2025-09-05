'use client';

import { useState } from 'react';
import { 
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit2,
  FiCheck,
  FiX,
  FiTruck,
  FiPackage,
  FiCalendar,
  FiUser,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { mockSolicitacoes, mockEstabelecimentos, mockFranqueados } from '@/data/mockData';

export default function SolicitacoesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<string | null>(null);

  // Filtra solicitações baseado no tipo de usuário
  const getFilteredSolicitacoes = () => {
    let solicitacoes = mockSolicitacoes;
    
    // Se for franqueado, mostra apenas solicitações da sua rede
    if (user?.type === 'franqueado') {
      const franqueado = mockFranqueados.find(f => f.email === user.email);
      if (franqueado) {
        solicitacoes = solicitacoes.filter(s => s.franqueadoId === franqueado.id);
      }
    }
    
    // Se for estabelecimento, mostra apenas suas solicitações
    if (user?.type === 'estabelecimento') {
      const estabelecimento = mockEstabelecimentos.find(e => e.email === user.email);
      if (estabelecimento) {
        solicitacoes = solicitacoes.filter(s => s.estabelecimentoId === estabelecimento.id);
      }
    }

    // Aplica filtros
    if (searchTerm) {
      solicitacoes = solicitacoes.filter(solicitacao => {
        const estabelecimento = getEstabelecimentoName(solicitacao.estabelecimentoId);
        const franqueado = getFranqueadoName(solicitacao.franqueadoId);
        return (
          estabelecimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          franqueado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (solicitacao.observacoes || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      solicitacoes = solicitacoes.filter(s => s.status === statusFilter);
    }

    return solicitacoes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const filteredSolicitacoes = getFilteredSolicitacoes();

  const getEstabelecimentoName = (estabelecimentoId: string) => {
    const estabelecimento = mockEstabelecimentos.find(e => e.id === estabelecimentoId);
    return estabelecimento?.name || 'N/A';
  };

  const getFranqueadoName = (franqueadoId: string) => {
    const franqueado = mockFranqueados.find(f => f.id === franqueadoId);
    return franqueado?.name || 'N/A';
  };

  const getSolicitacaoStats = () => {
    const pendentes = filteredSolicitacoes.filter(s => s.status === 'pendente');
    const aprovadas = filteredSolicitacoes.filter(s => s.status === 'aprovada');
    const negadas = filteredSolicitacoes.filter(s => s.status === 'negada');
    const enviadas = filteredSolicitacoes.filter(s => s.status === 'enviada');
    const entregues = filteredSolicitacoes.filter(s => s.status === 'entregue');
    
    const quantidadeTotal = filteredSolicitacoes.reduce((acc, s) => acc + s.quantidade, 0);
    const quantidadeEntregue = entregues.reduce((acc, s) => acc + s.quantidade, 0);

    return {
      total: filteredSolicitacoes.length,
      pendentes: pendentes.length,
      aprovadas: aprovadas.length,
      negadas: negadas.length,
      enviadas: enviadas.length,
      entregues: entregues.length,
      quantidadeTotal,
      quantidadeEntregue
    };
  };

  const stats = getSolicitacaoStats();

  const StatusIcon = ({ status }: { status: string }) => {
    const icons = {
      pendente: <FiClock className="w-4 h-4 text-yellow-500" />,
      aprovada: <FiCheckCircle className="w-4 h-4 text-green-500" />,
      negada: <FiXCircle className="w-4 h-4 text-red-500" />,
      enviada: <FiTruck className="w-4 h-4 text-blue-500" />,
      entregue: <FiPackage className="w-4 h-4 text-purple-500" />
    };
    return icons[status as keyof typeof icons] || icons.pendente;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-600',
      aprovada: 'bg-green-100 text-green-600',
      negada: 'bg-red-100 text-red-600',
      enviada: 'bg-blue-100 text-blue-600',
      entregue: 'bg-purple-100 text-purple-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${colors[status as keyof typeof colors]}`}>
        <StatusIcon status={status} />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Aguardando Aprovação',
      aprovada: 'Aprovada',
      negada: 'Negada',
      enviada: 'Enviada',
      entregue: 'Entregue'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const canApprove = user?.type === 'franqueadora' || user?.type === 'franqueado';

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado', 'estabelecimento']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.type === 'estabelecimento' ? 'Minhas Solicitações' : 'Gestão de Solicitações'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'estabelecimento' 
                  ? 'Acompanhe suas solicitações de cartões'
                  : user?.type === 'franqueado'
                  ? 'Aprove e gerencie solicitações da sua região'
                  : 'Monitore todas as solicitações da rede'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Nova Solicitação
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aprovadas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enviadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.enviadas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPackage className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cartões</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.quantidadeTotal}</p>
                  <p className="text-xs text-gray-500">{stats.quantidadeEntregue} entregues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar solicitações..."
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
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="negada">Negada</option>
                <option value="enviada">Enviada</option>
                <option value="entregue">Entregue</option>
              </select>

              <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiFilter className="w-4 h-4 mr-2" />
                Mais Filtros
              </button>
            </div>
          </div>

          {/* Lista de Solicitações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Solicitações de Cartões</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitação
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
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSolicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FiPackage className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Solicitação #{solicitacao.id}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FiCalendar className="w-3 h-3 mr-1" />
                              {solicitacao.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                            {solicitacao.observacoes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {solicitacao.observacoes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {getEstabelecimentoName(solicitacao.estabelecimentoId)}
                          </div>
                        </div>
                      </td>
                      {user?.type === 'franqueadora' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {getFranqueadoName(solicitacao.franqueadoId)}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {solicitacao.quantidade} cartões
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={solicitacao.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="space-y-1">
                            {solicitacao.dataAprovacao && (
                              <div className="flex items-center text-xs text-green-600">
                                <FiCheck className="w-3 h-3 mr-1" />
                                Aprovada: {solicitacao.dataAprovacao.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {solicitacao.dataEnvio && (
                              <div className="flex items-center text-xs text-blue-600">
                                <FiTruck className="w-3 h-3 mr-1" />
                                Enviada: {solicitacao.dataEnvio.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {solicitacao.dataEntrega && (
                              <div className="flex items-center text-xs text-purple-600">
                                <FiPackage className="w-3 h-3 mr-1" />
                                Entregue: {solicitacao.dataEntrega.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <FiEye className="w-4 h-4" />
                          </button>
                          {canApprove && solicitacao.status === 'pendente' && (
                            <>
                              <button className="text-green-600 hover:text-green-900 p-1">
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-1">
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(user?.type === 'franqueadora' || user?.type === 'franqueado') && 
                           solicitacao.status === 'aprovada' && (
                            <button className="text-blue-600 hover:text-blue-900 p-1">
                              <FiTruck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
              <div className="space-y-4">
                {[
                  { status: 'pendente', count: stats.pendentes, color: 'bg-yellow-50', textColor: 'text-yellow-600' },
                  { status: 'aprovada', count: stats.aprovadas, color: 'bg-green-50', textColor: 'text-green-600' },
                  { status: 'enviada', count: stats.enviadas, color: 'bg-blue-50', textColor: 'text-blue-600' },
                  { status: 'entregue', count: stats.entregues, color: 'bg-purple-50', textColor: 'text-purple-600' },
                  { status: 'negada', count: stats.negadas, color: 'bg-red-50', textColor: 'text-red-600' }
                ].filter(item => item.count > 0).map((item) => {
                  const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  
                  return (
                    <div key={item.status} className={`flex items-center justify-between p-3 ${item.color} rounded-lg`}>
                      <div className="flex items-center space-x-3">
                        <StatusIcon status={item.status} />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{getStatusLabel(item.status)}</p>
                          <p className="text-sm text-gray-500">{item.count} solicitações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${item.textColor}`}>
                          {percentage.toFixed(1)}%
                        </p>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-current h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Métricas de Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Aprovação</span>
                  <span className="font-semibold text-green-600">
                    {stats.total > 0 ? (((stats.aprovadas + stats.enviadas + stats.entregues) / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Entrega</span>
                  <span className="font-semibold text-purple-600">
                    {stats.total > 0 ? ((stats.entregues / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Média de Cartões</span>
                  <span className="font-semibold">
                    {stats.total > 0 ? Math.round(stats.quantidadeTotal / stats.total) : 0} por solicitação
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cartões Entregues</span>
                  <span className="font-semibold text-blue-600">
                    {stats.quantidadeEntregue} de {stats.quantidadeTotal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pendências</span>
                  <span className={`font-semibold ${stats.pendentes > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {stats.pendentes} solicitação(ões)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de Nova Solicitação (Placeholder) */}
          {showModal && (
            <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Solicitação de Cartões</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade de Cartões
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Detalhes da solicitação..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      // Aqui seria feita a submissão da solicitação
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
