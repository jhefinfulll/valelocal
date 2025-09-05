'use client';

import { useState } from 'react';
import { 
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { mockTransacoes, mockEstabelecimentos, mockFranqueados, mockCartoes } from '@/data/mockData';

export default function TransacoesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('hoje');

  // Filtra transações baseado no tipo de usuário
  const getFilteredTransacoes = () => {
    let transacoes = mockTransacoes;
    
    // Se for franqueado, mostra apenas transações da sua rede
    if (user?.type === 'franqueado') {
      const franqueado = mockFranqueados.find(f => f.email === user.email);
      if (franqueado) {
        const estabelecimentosIds = mockEstabelecimentos
          .filter(e => e.franqueadoId === franqueado.id)
          .map(e => e.id);
        transacoes = transacoes.filter(t => estabelecimentosIds.includes(t.estabelecimentoId));
      }
    }
    
    // Se for estabelecimento, mostra apenas suas transações
    if (user?.type === 'estabelecimento') {
      const estabelecimento = mockEstabelecimentos.find(e => e.email === user.email);
      if (estabelecimento) {
        transacoes = transacoes.filter(t => t.estabelecimentoId === estabelecimento.id);
      }
    }

    // Aplica filtros
    if (searchTerm) {
      transacoes = transacoes.filter(transacao => {
        const estabelecimento = getEstabelecimentoName(transacao.estabelecimentoId);
        const cartao = getCartaoInfo(transacao.cartaoId);
        return (
          estabelecimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cartao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (transacao.dadosUsuario?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (transacao.comprovante || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (tipoFilter) {
      transacoes = transacoes.filter(t => t.tipo === tipoFilter);
    }

    if (statusFilter) {
      transacoes = transacoes.filter(t => t.status === statusFilter);
    }

    // Filtro por data
    const hoje = new Date();
    if (dateRange === 'hoje') {
      transacoes = transacoes.filter(t => 
        t.createdAt.toDateString() === hoje.toDateString()
      );
    } else if (dateRange === 'semana') {
      const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      transacoes = transacoes.filter(t => t.createdAt >= semanaAtras);
    } else if (dateRange === 'mes') {
      const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      transacoes = transacoes.filter(t => t.createdAt >= mesAtras);
    }

    return transacoes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const filteredTransacoes = getFilteredTransacoes();

  const getEstabelecimentoName = (estabelecimentoId: string) => {
    const estabelecimento = mockEstabelecimentos.find(e => e.id === estabelecimentoId);
    return estabelecimento?.name || 'N/A';
  };

  const getCartaoInfo = (cartaoId: string) => {
    const cartao = mockCartoes.find(c => c.id === cartaoId);
    return cartao || { codigo: 'N/A', valor: 0 };
  };

  const getFranqueadoName = (estabelecimentoId: string) => {
    const estabelecimento = mockEstabelecimentos.find(e => e.id === estabelecimentoId);
    if (!estabelecimento) return 'N/A';
    const franqueado = mockFranqueados.find(f => f.id === estabelecimento.franqueadoId);
    return franqueado?.name || 'N/A';
  };

  const getTransacaoStats = () => {
    const recargas = filteredTransacoes.filter(t => t.tipo === 'recarga');
    const utilizacoes = filteredTransacoes.filter(t => t.tipo === 'utilizacao');
    const valorTotal = filteredTransacoes.reduce((acc, t) => acc + t.valor, 0);
    const valorRecargas = recargas.reduce((acc, t) => acc + t.valor, 0);
    const valorUtilizacoes = utilizacoes.reduce((acc, t) => acc + t.valor, 0);

    return {
      total: filteredTransacoes.length,
      recargas: recargas.length,
      utilizacoes: utilizacoes.length,
      valorTotal,
      valorRecargas,
      valorUtilizacoes,
      concluidas: filteredTransacoes.filter(t => t.status === 'concluida').length
    };
  };

  const stats = getTransacaoStats();

  const TipoIcon = ({ tipo }: { tipo: string }) => (
    tipo === 'recarga' 
      ? <FiTrendingUp className="w-4 h-4 text-green-500" />
      : <FiTrendingDown className="w-4 h-4 text-blue-500" />
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-600',
      concluida: 'bg-green-100 text-green-600',
      cancelada: 'bg-red-100 text-red-600'
    };
    
    const icons = {
      pendente: <FiClock className="w-3 h-3" />,
      concluida: <FiCheckCircle className="w-3 h-3" />,
      cancelada: <FiXCircle className="w-3 h-3" />
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${colors[status as keyof typeof colors]}`}>
        {icons[status as keyof typeof icons]}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
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
                {user?.type === 'estabelecimento' ? 'Minhas Transações' : 'Gestão de Transações'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'estabelecimento' 
                  ? 'Acompanhe todas as transações do seu estabelecimento'
                  : user?.type === 'franqueado'
                  ? 'Monitore as transações da sua região'
                  : 'Monitore todas as transações da rede'
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <FiEye className="w-4 h-4 mr-2" />
                Relatório Detalhado
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recargas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recargas}</p>
                  <p className="text-xs text-gray-500">R$ {stats.valorRecargas.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiTrendingDown className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilizações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.utilizacoes}</p>
                  <p className="text-xs text-gray-500">R$ {stats.valorUtilizacoes.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Volume Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os tipos</option>
                <option value="recarga">Recarga</option>
                <option value="utilizacao">Utilização</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mês</option>
                <option value="todos">Todos</option>
              </select>

              <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiFilter className="w-4 h-4 mr-2" />
                Mais Filtros
              </button>
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Histórico de Transações</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cartão
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
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
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
                  {filteredTransacoes.map((transacao) => {
                    const cartaoInfo = getCartaoInfo(transacao.cartaoId);
                    
                    return (
                      <tr key={transacao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${
                              transacao.tipo === 'recarga' 
                                ? 'bg-green-100' 
                                : 'bg-blue-100'
                            }`}>
                              <TipoIcon tipo={transacao.tipo} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {transacao.tipo}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiCalendar className="w-3 h-3 mr-1" />
                                {transacao.createdAt.toLocaleDateString('pt-BR')} às {transacao.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {transacao.comprovante && (
                                <div className="text-xs text-gray-500">
                                  Comprovante: {transacao.comprovante}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCreditCard className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{cartaoInfo.codigo}</div>
                              <div className="text-sm text-gray-500">
                                Valor do cartão: R$ {cartaoInfo.valor.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {getEstabelecimentoName(transacao.estabelecimentoId)}
                            </div>
                          </div>
                        </td>
                        {user?.type === 'franqueadora' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getFranqueadoName(transacao.estabelecimentoId)}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transacao.dadosUsuario ? (
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {transacao.dadosUsuario.nome}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transacao.dadosUsuario.telefone}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transacao.tipo === 'recarga' 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }`}>
                            {transacao.tipo === 'recarga' ? '+' : '-'}R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={transacao.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <FiEye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumos e Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo por Tipo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Recargas</p>
                      <p className="text-sm text-gray-500">{stats.recargas} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      R$ {stats.valorRecargas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stats.total > 0 ? ((stats.recargas / stats.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiTrendingDown className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Utilizações</p>
                      <p className="text-sm text-gray-500">{stats.utilizacoes} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      R$ {stats.valorUtilizacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stats.total > 0 ? ((stats.utilizacoes / stats.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Sucesso</span>
                  <span className="font-semibold text-green-600">
                    {stats.total > 0 ? ((stats.concluidas / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Médio</span>
                  <span className="font-semibold">
                    R$ {stats.total > 0 ? (stats.valorTotal / stats.total).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Médio Recarga</span>
                  <span className="font-semibold text-green-600">
                    R$ {stats.recargas > 0 ? (stats.valorRecargas / stats.recargas).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Médio Utilização</span>
                  <span className="font-semibold text-blue-600">
                    R$ {stats.utilizacoes > 0 ? (stats.valorUtilizacoes / stats.utilizacoes).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transações por Hora</span>
                  <span className="font-semibold">
                    {(stats.total / 24).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
