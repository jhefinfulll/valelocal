'use client';

import { 
  FiCreditCard, 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag,
  FiBarChart,
  FiActivity,
  FiCalendar
} from 'react-icons/fi';
import { User, Dashboard as DashboardType } from '@/types';
import { 
  mockDashboardFranqueadora, 
  mockDashboardFranqueado, 
  mockDashboardEstabelecimento,
  mockTransacoes 
} from '@/data/mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  user: User;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className={`w-4 h-4 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">
          {typeof value === 'number' && title.toLowerCase().includes('valor') 
            ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : value.toLocaleString('pt-BR')
          }
        </h3>
        <p className="text-gray-600 text-sm">{title}</p>
        {subtitle && (
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Função para gerar dados dos últimos 7 dias
function generateLast7DaysData() {
  const days = [];
  const transacoes = [];
  const valores = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }));
    transacoes.push(Math.floor(Math.random() * 50) + 20);
    valores.push(Math.floor(Math.random() * 5000) + 2000);
  }
  
  return { days, transacoes, valores };
}

// Componente de Gráfico de Linha - Transações
function TransactionChart() {
  const { days, transacoes } = generateLast7DaysData();
  
  const data = {
    labels: days,
    datasets: [
      {
        label: 'Transações',
        data: transacoes,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

// Componente de Gráfico de Barras - Valores
function ValueChart() {
  const { days, valores } = generateLast7DaysData();
  
  const data = {
    labels: days,
    datasets: [
      {
        label: 'Valor (R$)',
        data: valores,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function(value: any) {
            return `R$ ${value.toLocaleString('pt-BR')}`;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

// Componente de Gráfico de Rosca - Distribuição por Tipo
function DistributionChart() {
  const data = {
    labels: ['Recarga', 'Alimentação', 'Transporte', 'Outros'],
    datasets: [
      {
        data: [35, 30, 20, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

function RecentTransactions() {
  const recentTransactions = mockTransacoes.slice(0, 5);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Transações Recentes</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
          Ver todas
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.map((transacao) => (
          <div key={transacao.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                transacao.tipo === 'recarga' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {transacao.tipo === 'recarga' ? (
                  <FiTrendingUp className="w-4 h-4" />
                ) : (
                  <FiDollarSign className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {transacao.tipo === 'recarga' ? 'Recarga' : 'Utilização'}
                </p>
                <p className="text-sm text-gray-500">
                  {transacao.createdAt.toLocaleDateString('pt-BR')} às {transacao.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transacao.tipo === 'recarga' ? 'text-green-600' : 'text-blue-600'
              }`}>
                R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs px-2 py-1 rounded-full ${
                transacao.status === 'concluida' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {transacao.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ user }: DashboardProps) {
  const getDashboardData = (): DashboardType => {
    switch (user.type) {
      case 'franqueadora':
        return mockDashboardFranqueadora;
      case 'franqueado':
        return mockDashboardFranqueado;
      case 'estabelecimento':
        return mockDashboardEstabelecimento;
      default:
        return mockDashboardEstabelecimento;
    }
  };

  const dashboardData = getDashboardData();

  const getStatsForUserType = () => {
    const baseStats = [
      {
        title: 'Total de Cartões',
        value: dashboardData.totalCartoes,
        icon: FiCreditCard,
        color: 'bg-blue-500',
        trend: { value: 12.5, isPositive: true }
      },
      {
        title: 'Cartões Ativos',
        value: dashboardData.cartoesAtivos,
        icon: FiActivity,
        color: 'bg-green-500',
        trend: { value: 8.2, isPositive: true }
      },
      {
        title: 'Valor Total',
        value: dashboardData.valorTotal,
        icon: FiDollarSign,
        color: 'bg-purple-500',
        trend: { value: dashboardData.crescimentoMensal, isPositive: true }
      },
      {
        title: 'Transações Hoje',
        value: dashboardData.transacoesHoje,
        icon: FiBarChart,
        color: 'bg-orange-500',
        trend: { value: 15.3, isPositive: true }
      }
    ];

    if (user.type === 'franqueadora' || user.type === 'franqueado') {
      baseStats.push(
        {
          title: 'Estabelecimentos Ativos',
          value: dashboardData.estabelecimentosAtivos,
          icon: FiShoppingBag,
          color: 'bg-indigo-500',
          trend: { value: 5.7, isPositive: true }
        },
        {
          title: 'Comissões Totais',
          value: dashboardData.comissoesTotais,
          icon: FiTrendingUp,
          color: 'bg-emerald-500',
          trend: { value: 18.9, isPositive: true }
        }
      );
    }

    return baseStats;
  };

  const stats = getStatsForUserType();

  const getWelcomeMessage = () => {
    const messages = {
      franqueadora: 'Visão geral de toda a rede de franquias',
      franqueado: 'Acompanhe sua região e estabelecimentos',
      estabelecimento: 'Gerencie suas vendas e transações',
      usuario: 'Consulte seus cartões e benefícios'
    };
    return messages[user.type] || 'Bem-vindo ao sistema';
  };

  return (
    <div className="space-y-6">
      {/* Header com Boas-vindas */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Olá, {user.name}! 👋
            </h1>
            <p className="opacity-90">{getWelcomeMessage()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Último acesso</p>
            <p className="font-semibold">
              {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Gráficos e Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Transações dos Últimos 7 Dias */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Transações dos Últimos 7 Dias</h3>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <FiTrendingUp className="w-4 h-4" />
              <span>+{dashboardData.crescimentoMensal}%</span>
            </div>
          </div>
          <div className="h-64">
            <TransactionChart />
          </div>
        </div>

        {/* Transações Recentes */}
        <div>
          <RecentTransactions />
        </div>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Valores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Valores Transacionados</h3>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <FiDollarSign className="w-4 h-4" />
              <span>R$ {dashboardData.valorTotal.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="h-64">
            <ValueChart />
          </div>
        </div>

        {/* Gráfico de Distribuição */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Distribuição por Categoria</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiBarChart className="w-4 h-4" />
              <span>Últimos 30 dias</span>
            </div>
          </div>
          <div className="h-64">
            <DistributionChart />
          </div>
        </div>
      </div>

      {/* Resumo por Tipo de Usuário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user.type === 'franqueadora' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Ações Rápidas</h4>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FiUsers className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">Adicionar Franqueado</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FiBarChart className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">Gerar Relatório</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FiCreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">Processar Cartões</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {user.type === 'franqueado' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Região: São Paulo</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estabelecimentos</span>
                <span className="font-medium">35 ativos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Comissão</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Solicitações Pendentes</span>
                <span className="font-medium text-orange-600">3</span>
              </div>
            </div>
          </div>
        )}

        {user.type === 'estabelecimento' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Minha Loja</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Ativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categoria</span>
                <span className="font-medium">Alimentação</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cartões Disponíveis</span>
                <span className="font-medium">47</span>
              </div>
            </div>
          </div>
        )}

        {/* Card de Alertas/Notificações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Notificações</h4>
          <div className="space-y-3">
            {user.type === 'franqueadora' && (
              <>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">3 solicitações de cartões pendentes</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Relatório mensal disponível</p>
                </div>
              </>
            )}
            {user.type === 'franqueado' && (
              <>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">2 estabelecimentos adicionados hoje</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">Estoque baixo: 15 cartões restantes</p>
                </div>
              </>
            )}
            {user.type === 'estabelecimento' && (
              <>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">5 transações processadas hoje</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Novo display disponível</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
