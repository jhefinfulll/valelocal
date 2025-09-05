'use client';

import { useState } from 'react';
import { 
  FiActivity,
  FiUser,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiSearch,
  FiShield,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiSettings,
  FiEye,
  FiMonitor,
  FiXCircle,
  FiDatabase,
  FiServer,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useLogs } from '@/hooks/useLogs';

// Mock de logs do sistema
const mockLogs = [
  {
    id: '1',
    timestamp: new Date('2024-01-20T14:30:00'),
    action: 'LOGIN',
    category: 'AUTH',
    severity: 'info',
    userId: 'user-1',
    userName: 'Ana Silva',
    userType: 'franqueadora',
    description: 'Login realizado com sucesso',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  },
  {
    id: '2',
    timestamp: new Date('2024-01-20T14:25:00'),
    action: 'CREATE_CARD',
    category: 'CARD',
    severity: 'success',
    userId: 'user-2',
    userName: 'Carlos Santos',
    userType: 'franqueado',
    description: 'Novo cartão criado: #CARD123456',
    ip: '192.168.1.105',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  },
  {
    id: '3',
    timestamp: new Date('2024-01-20T14:20:00'),
    action: 'FAILED_LOGIN',
    category: 'AUTH',
    severity: 'warning',
    userId: null,
    userName: 'Tentativa inválida',
    userType: null,
    description: 'Tentativa de login com credenciais inválidas',
    ip: '10.0.0.50',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  },
  {
    id: '4',
    timestamp: new Date('2024-01-20T14:15:00'),
    action: 'UPDATE_ESTABLISHMENT',
    category: 'ESTABLISHMENT',
    severity: 'info',
    userId: 'user-3',
    userName: 'Maria Oliveira',
    userType: 'estabelecimento',
    description: 'Dados do estabelecimento atualizados',
    ip: '192.168.1.110',
    userAgent: 'Mozilla/5.0 Safari/605.1.15'
  },
  {
    id: '5',
    timestamp: new Date('2024-01-20T14:10:00'),
    action: 'TRANSACTION',
    category: 'TRANSACTION',
    severity: 'success',
    userId: 'user-4',
    userName: 'João Pereira',
    userType: 'usuario',
    description: 'Transação realizada: R$ 25,00',
    ip: '192.168.1.120',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  },
  {
    id: '6',
    timestamp: new Date('2024-01-20T14:05:00'),
    action: 'SYSTEM_ERROR',
    category: 'SYSTEM',
    severity: 'error',
    userId: null,
    userName: 'Sistema',
    userType: null,
    description: 'Erro na conexão com o banco de dados',
    ip: 'localhost',
    userAgent: 'System'
  },
  {
    id: '7',
    timestamp: new Date('2024-01-20T14:00:00'),
    action: 'DELETE_CARD',
    category: 'CARD',
    severity: 'warning',
    userId: 'user-1',
    userName: 'Ana Silva',
    userType: 'franqueadora',
    description: 'Cartão cancelado: #CARD123455',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  },
  {
    id: '8',
    timestamp: new Date('2024-01-20T13:55:00'),
    action: 'COMMISSION_PAID',
    category: 'COMMISSION',
    severity: 'success',
    userId: 'user-1',
    userName: 'Ana Silva',
    userType: 'franqueadora',
    description: 'Comissão paga: R$ 150,00 para Carlos Santos',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0'
  }
];

export default function LogsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Filtra logs
  const getFilteredLogs = () => {
    let logs = [...mockLogs];

    if (searchTerm) {
      logs = logs.filter(log => 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      logs = logs.filter(log => log.category === categoryFilter);
    }

    if (severityFilter) {
      logs = logs.filter(log => log.severity === severityFilter);
    }

    if (userTypeFilter) {
      logs = logs.filter(log => log.userType === userTypeFilter);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const filteredLogs = getFilteredLogs();

  const getLogStats = () => {
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    
    const logsHoje = mockLogs.filter(log => 
      log.timestamp.toDateString() === hoje.toDateString()
    );
    
    const logsOntem = mockLogs.filter(log => 
      log.timestamp.toDateString() === ontem.toDateString()
    );

    const errors = mockLogs.filter(log => log.severity === 'error').length;
    const warnings = mockLogs.filter(log => log.severity === 'warning').length;
    const success = mockLogs.filter(log => log.severity === 'success').length;

    return {
      total: mockLogs.length,
      hoje: logsHoje.length,
      ontem: logsOntem.length,
      errors,
      warnings,
      success,
      info: mockLogs.filter(log => log.severity === 'info').length
    };
  };

  const stats = getLogStats();

  const getSeverityIcon = (severity: string) => {
    const icons = {
      error: <FiAlertTriangle className="w-4 h-4 text-red-500" />,
      warning: <FiAlertTriangle className="w-4 h-4 text-orange-500" />,
      success: <FiCheckCircle className="w-4 h-4 text-green-500" />,
      info: <FiInfo className="w-4 h-4 text-blue-500" />
    };
    return icons[severity as keyof typeof icons] || icons.info;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      error: 'bg-red-100 text-red-600 border-red-200',
      warning: 'bg-orange-100 text-orange-600 border-orange-200',
      success: 'bg-green-100 text-green-600 border-green-200',
      info: 'bg-blue-100 text-blue-600 border-blue-200'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      AUTH: <FiShield className="w-4 h-4" />,
      CARD: <FiMonitor className="w-4 h-4" />,
      ESTABLISHMENT: <FiSettings className="w-4 h-4" />,
      TRANSACTION: <FiActivity className="w-4 h-4" />,
      COMMISSION: <FiUser className="w-4 h-4" />,
      SYSTEM: <FiSettings className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons] || icons.SYSTEM;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days} dias atrás`;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['franqueadora']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Logs do Sistema</h1>
              <p className="text-gray-600">Monitoramento e auditoria de atividades</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiFilter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar Logs
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiActivity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
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
                  <p className="text-sm font-medium text-gray-600">Sucessos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avisos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.warnings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Erros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas as categorias</option>
                <option value="AUTH">Autenticação</option>
                <option value="CARD">Cartões</option>
                <option value="ESTABLISHMENT">Estabelecimentos</option>
                <option value="TRANSACTION">Transações</option>
                <option value="COMMISSION">Comissões</option>
                <option value="SYSTEM">Sistema</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas as severidades</option>
                <option value="error">Erro</option>
                <option value="warning">Aviso</option>
                <option value="success">Sucesso</option>
                <option value="info">Informação</option>
              </select>

              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os usuários</option>
                <option value="franqueadora">Franqueadora</option>
                <option value="franqueado">Franqueado</option>
                <option value="estabelecimento">Estabelecimento</option>
                <option value="usuario">Usuário</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setSeverityFilter('');
                  setUserTypeFilter('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Lista de Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Atividades Recentes ({filteredLogs.length} logs)
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg border ${getSeverityColor(log.severity)}`}>
                        {getCategoryIcon(log.category)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                            {getSeverityIcon(log.severity)}
                            <span className="ml-1 capitalize">{log.severity}</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiClock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(log.timestamp)}
                        </div>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600">{log.description}</p>
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FiUser className="w-3 h-3 mr-1" />
                          {log.userName} {log.userType && `(${log.userType})`}
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {log.timestamp.toLocaleString('pt-BR')}
                        </div>
                        <div>IP: {log.ip}</div>
                      </div>
                    </div>
                    
                    <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
                      <FiEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Detalhes do Log */}
          {selectedLog && (
            <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes do Log</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID do Log</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.timestamp.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ação</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoria</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Severidade</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedLog.severity)}`}>
                        {getSeverityIcon(selectedLog.severity)}
                        <span className="ml-1 capitalize">{selectedLog.severity}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.userType || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuário</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Endereço IP</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ip}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Agent</label>
                      <p className="mt-1 text-xs text-gray-600 break-all">{selectedLog.userAgent}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Fechar
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
