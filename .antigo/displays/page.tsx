'use client';

import { useState } from 'react';
import { 
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiMonitor,
  FiShoppingBag,
  FiUser,
  FiCalendar,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiTool,
  FiWifi,
  FiWifiOff,
  FiXCircle,
  FiAlertTriangle,
  FiActivity,
  FiZap,
  FiThermometer,
  FiHardDrive
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DisplayModal } from '@/components/displays/DisplayModal';
import { useAuth } from '@/hooks/useAuth';
import { useDisplays } from '@/hooks/useDisplays';
import { mockDisplays, mockEstabelecimentos, mockFranqueados } from '@/data/mockData';

export default function DisplaysPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filtra displays baseado no tipo de usuário
  const getFilteredDisplays = () => {
    let displays = mockDisplays;
    
    // Se for franqueado, mostra apenas displays da sua rede
    if (user?.type === 'franqueado') {
      const franqueado = mockFranqueados.find(f => f.email === user.email);
      if (franqueado) {
        displays = displays.filter(d => d.franqueadoId === franqueado.id);
      }
    }

    // Aplica filtros
    if (searchTerm) {
      displays = displays.filter(display => {
        const estabelecimento = display.estabelecimentoId 
          ? getEstabelecimentoName(display.estabelecimentoId)
          : 'Não instalado';
        const franqueado = getFranqueadoName(display.franqueadoId);
        return (
          estabelecimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          franqueado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          display.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (tipoFilter) {
      displays = displays.filter(d => d.tipo === tipoFilter);
    }

    if (statusFilter) {
      displays = displays.filter(d => d.status === statusFilter);
    }

    return displays.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const filteredDisplays = getFilteredDisplays();

  const getEstabelecimentoName = (estabelecimentoId: string) => {
    const estabelecimento = mockEstabelecimentos.find(e => e.id === estabelecimentoId);
    return estabelecimento?.name || 'N/A';
  };

  const getFranqueadoName = (franqueadoId: string) => {
    const franqueado = mockFranqueados.find(f => f.id === franqueadoId);
    return franqueado?.name || 'N/A';
  };

  const getDisplayStats = () => {
    const disponiveis = filteredDisplays.filter(d => d.status === 'disponivel');
    const instalados = filteredDisplays.filter(d => d.status === 'instalado');
    const manutencao = filteredDisplays.filter(d => d.status === 'manutencao');
    
    const porTipo = {
      balcao: filteredDisplays.filter(d => d.tipo === 'balcao').length,
      parede: filteredDisplays.filter(d => d.tipo === 'parede').length,
      mesa: filteredDisplays.filter(d => d.tipo === 'mesa').length
    };

    return {
      total: filteredDisplays.length,
      disponiveis: disponiveis.length,
      instalados: instalados.length,
      manutencao: manutencao.length,
      porTipo
    };
  };

  const stats = getDisplayStats();

  const StatusIcon = ({ status }: { status: string }) => {
    const icons = {
      disponivel: <FiCheckCircle className="w-4 h-4 text-green-500" />,
      instalado: <FiMapPin className="w-4 h-4 text-blue-500" />,
      manutencao: <FiTool className="w-4 h-4 text-orange-500" />
    };
    return icons[status as keyof typeof icons] || icons.disponivel;
  };

  const TipoIcon = ({ tipo }: { tipo: string }) => {
    const icons = {
      balcao: <FiMonitor className="w-4 h-4 text-purple-500" />,
      parede: <FiMonitor className="w-4 h-4 text-blue-500" />,
      mesa: <FiMonitor className="w-4 h-4 text-green-500" />
    };
    return icons[tipo as keyof typeof icons] || icons.balcao;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      disponivel: 'bg-green-100 text-green-600',
      instalado: 'bg-blue-100 text-blue-600',
      manutencao: 'bg-orange-100 text-orange-600'
    };
    
    const labels = {
      disponivel: 'Disponível',
      instalado: 'Instalado',
      manutencao: 'Manutenção'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${colors[status as keyof typeof colors]}`}>
        <StatusIcon status={status} />
        <span>{labels[status as keyof typeof labels]}</span>
      </span>
    );
  };

  const TipoBadge = ({ tipo }: { tipo: string }) => {
    const colors = {
      balcao: 'bg-purple-100 text-purple-600',
      parede: 'bg-blue-100 text-blue-600',
      mesa: 'bg-green-100 text-green-600'
    };
    
    const labels = {
      balcao: 'Balcão',
      parede: 'Parede',
      mesa: 'Mesa'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${colors[tipo as keyof typeof colors]}`}>
        <TipoIcon tipo={tipo} />
        <span>{labels[tipo as keyof typeof labels]}</span>
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
                {user?.type === 'franqueado' ? 'Meus Displays' : 'Gestão de Displays'}
              </h1>
              <p className="text-gray-600">
                {user?.type === 'franqueado' 
                  ? 'Gerencie os displays expositores da sua região'
                  : 'Controle todo o estoque de displays da rede'
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
                Novo Display
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiMonitor className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Displays</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.disponiveis}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Instalados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.instalados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiTool className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Manutenção</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.manutencao}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar displays..."
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
                <option value="balcao">Balcão</option>
                <option value="parede">Parede</option>
                <option value="mesa">Mesa</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os status</option>
                <option value="disponivel">Disponível</option>
                <option value="instalado">Instalado</option>
                <option value="manutencao">Manutenção</option>
              </select>

              <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiFilter className="w-4 h-4 mr-2" />
                Mais Filtros
              </button>
            </div>
          </div>

          {/* Lista de Displays */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Displays Cadastrados</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instalação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDisplays.map((display) => (
                    <tr key={display.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FiMonitor className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Display #{display.id}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FiCalendar className="w-3 h-3 mr-1" />
                              Criado em {display.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TipoBadge tipo={display.tipo} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {display.estabelecimentoId 
                              ? getEstabelecimentoName(display.estabelecimentoId)
                              : 'Não instalado'
                            }
                          </div>
                        </div>
                      </td>
                      {user?.type === 'franqueadora' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {getFranqueadoName(display.franqueadoId)}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={display.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {display.dataInstalacao ? (
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 text-green-500 mr-2" />
                              <div>
                                <div className="font-medium">
                                  {display.dataInstalacao.toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Instalado há {Math.floor((new Date().getTime() - display.dataInstalacao.getTime()) / (1000 * 60 * 60 * 24))} dias
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Não instalado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {display.status === 'disponivel' && (
                            <button className="text-purple-600 hover:text-purple-900 p-1">
                              <FiMapPin className="w-4 h-4" />
                            </button>
                          )}
                          {display.status === 'instalado' && (
                            <button className="text-orange-600 hover:text-orange-900 p-1">
                              <FiTool className="w-4 h-4" />
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

          {/* Resumos e Estatísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Tipo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo</h3>
              <div className="space-y-4">
                {Object.entries(stats.porTipo).map(([tipo, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const labels = { balcao: 'Balcão', parede: 'Parede', mesa: 'Mesa' };
                  
                  return (
                    <div key={tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TipoIcon tipo={tipo} />
                        <div>
                          <p className="font-medium text-gray-900">{labels[tipo as keyof typeof labels]}</p>
                          <p className="text-sm text-gray-500">{count} displays</p>
                        </div>
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
                  );
                })}
              </div>
            </div>

            {/* Métricas de Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Utilização</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Instalação</span>
                  <span className="font-semibold text-blue-600">
                    {stats.total > 0 ? ((stats.instalados / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Displays Disponíveis</span>
                  <span className="font-semibold text-green-600">
                    {stats.disponiveis} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Em Manutenção</span>
                  <span className={`font-semibold ${stats.manutencao > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {stats.manutencao} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Eficiência de Uso</span>
                  <span className="font-semibold text-purple-600">
                    {stats.total > 0 ? (((stats.instalados + stats.manutencao) / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Necessita Atenção</span>
                  <span className={`font-semibold ${stats.manutencao > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.manutencao > 0 ? `${stats.manutencao} display(s)` : 'Nenhum'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de Novo Display (Placeholder) */}
          {showModal && (
            <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Display Expositor</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Display
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="">Selecione o tipo</option>
                      <option value="balcao">Balcão</option>
                      <option value="parede">Parede</option>
                      <option value="mesa">Mesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estabelecimento (opcional)
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="">Manter em estoque</option>
                      {mockEstabelecimentos.map(est => (
                        <option key={est.id} value={est.id}>{est.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Informações adicionais..."
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
                      // Aqui seria feita a criação do display
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Criar Display
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
