'use client';

import { useState } from 'react';
import { 
  FiDownload,
  FiCalendar,
  FiFilter,
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiDollarSign,
  FiCreditCard,
  FiShoppingBag,
  FiUser,
  FiActivity,
  FiClock,
  FiMapPin
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { 
  mockTransacoes, 
  mockEstabelecimentos, 
  mockFranqueados,
  mockCartoes,
  mockComissoes 
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

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');
  const [periodo, setPeriodo] = useState('30');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Calcula métricas gerais
  const getMetricasGerais = () => {
    const hoje = new Date();
    const diasAtras = new Date(hoje.getTime() - parseInt(periodo) * 24 * 60 * 60 * 1000);
    
    const transacoesPeriodo = mockTransacoes.filter(t => 
      t.createdAt >= diasAtras && t.createdAt <= hoje
    );

    const vendas = transacoesPeriodo.filter(t => t.tipo === 'utilizacao');
    const recargas = transacoesPeriodo.filter(t => t.tipo === 'recarga');

    const totalVendas = vendas.reduce((sum, t) => sum + t.valor, 0);
    const totalRecargas = recargas.reduce((sum, t) => sum + t.valor, 0);
    const totalGeral = totalVendas + totalRecargas;

    const cartõesAtivos = mockCartoes.filter(c => c.status === 'ativo').length;
    const estabelecimentosAtivos = mockEstabelecimentos.filter(e => e.status === 'ativo').length;

    return {
      totalVendas,
      totalRecargas,
      totalGeral,
      transacoesPeriodo: transacoesPeriodo.length,
      vendas: vendas.length,
      recargas: recargas.length,
      cartõesAtivos,
      estabelecimentosAtivos,
      ticketMedio: vendas.length > 0 ? totalVendas / vendas.length : 0
    };
  };

  const metricas = getMetricasGerais();

  // Dados para gráfico de vendas por dia
  const getVendasPorDia = () => {
    const hoje = new Date();
    const dias = parseInt(periodo);
    
    // Dados mockados mais realistas baseados no período selecionado
    const dadosMockados = {
      7: [
        { valor: 2850, transacoes: 28 }, // Segunda
        { valor: 3200, transacoes: 32 }, // Terça
        { valor: 2950, transacoes: 31 }, // Quarta
        { valor: 3850, transacoes: 42 }, // Quinta
        { valor: 4650, transacoes: 56 }, // Sexta
        { valor: 5200, transacoes: 67 }, // Sábado
        { valor: 3800, transacoes: 48 }  // Domingo
      ],
      30: [
        { valor: 2850, transacoes: 28 }, { valor: 3200, transacoes: 32 }, { valor: 2950, transacoes: 31 },
        { valor: 3850, transacoes: 42 }, { valor: 4650, transacoes: 56 }, { valor: 5200, transacoes: 67 },
        { valor: 3800, transacoes: 48 }, { valor: 3100, transacoes: 35 }, { valor: 3450, transacoes: 38 },
        { valor: 2890, transacoes: 29 }, { valor: 4120, transacoes: 45 }, { valor: 4850, transacoes: 58 },
        { valor: 5350, transacoes: 72 }, { valor: 4200, transacoes: 51 }, { valor: 2950, transacoes: 31 },
        { valor: 3580, transacoes: 39 }, { valor: 3780, transacoes: 41 }, { valor: 4250, transacoes: 47 },
        { valor: 5100, transacoes: 64 }, { valor: 5850, transacoes: 78 }, { valor: 4350, transacoes: 53 },
        { valor: 3200, transacoes: 34 }, { valor: 3650, transacoes: 40 }, { valor: 3100, transacoes: 33 },
        { valor: 4300, transacoes: 48 }, { valor: 5200, transacoes: 65 }, { valor: 6100, transacoes: 82 },
        { valor: 4800, transacoes: 59 }, { valor: 3450, transacoes: 37 }, { valor: 3950, transacoes: 43 }
      ],
      90: [], // Será preenchido dinamicamente
      365: [] // Será preenchido dinamicamente
    };

    // Para períodos maiores, gerar dados com padrões realistas
    if (dias > 30) {
      const dadosPorDia = [];
      for (let i = dias - 1; i >= 0; i--) {
        const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
        const diaSemana = data.getDay(); // 0 = domingo, 6 = sábado
        
        // Padrão: fins de semana têm mais movimento
        let baseValor = 3500;
        let baseTransacoes = 40;
        
        if (diaSemana === 0 || diaSemana === 6) { // Fim de semana
          baseValor += 1500;
          baseTransacoes += 20;
        } else if (diaSemana === 5) { // Sexta-feira
          baseValor += 1000;
          baseTransacoes += 15;
        }
        
        // Adicionar variação aleatória pequena
        const variacaoValor = (Math.random() - 0.5) * 800;
        const variacaoTransacoes = Math.floor((Math.random() - 0.5) * 10);
        
        dadosPorDia.push({
          data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          valor: Math.max(1000, baseValor + variacaoValor),
          transacoes: Math.max(10, baseTransacoes + variacaoTransacoes)
        });
      }
      return dadosPorDia;
    }

    // Usar dados mockados fixos para períodos menores
    const dadosFixos = dadosMockados[dias as keyof typeof dadosMockados] || dadosMockados[7];
    const dadosPorDia = [];

    for (let i = dias - 1; i >= 0; i--) {
      const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
      const indice = (dias - 1 - i) % dadosFixos.length;
      const dadoDia = dadosFixos[indice];
      
      dadosPorDia.push({
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: dadoDia.valor,
        transacoes: dadoDia.transacoes
      });
    }

    return dadosPorDia;
  };

  const vendasPorDia = getVendasPorDia();

  // Componente de Gráfico de Linha - Vendas por Dia
  const VendasPorDiaChart = () => {
    const data = {
      labels: vendasPorDia.map(dia => dia.data),
      datasets: [
        {
          label: 'Vendas (R$)',
          data: vendasPorDia.map(dia => dia.valor),
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
        {
          label: 'Transações',
          data: vendasPorDia.map(dia => dia.transacoes),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y1',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            color: '#6b7280',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              if (context.datasetIndex === 0) {
                return `Vendas: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
              } else {
                return `Transações: ${context.parsed.y}`;
              }
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
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
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
      },
    };

    return <Line data={data} options={options} />;
  };

  // Componente de Gráfico de Barras - Top Estabelecimentos
  const TopEstabelecimentosChart = () => {
    const topData = topEstabelecimentos.slice(0, 8); // Pegar apenas os top 8
    
    const data = {
      labels: topData.map(est => est.nome.length > 15 ? est.nome.substring(0, 15) + '...' : est.nome),
      datasets: [
        {
          label: 'Vendas (R$)',
          data: topData.map(est => est.total),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(101, 163, 13, 0.8)',
            'rgba(217, 70, 239, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(249, 115, 22)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(101, 163, 13)',
            'rgb(217, 70, 239)',
          ],
          borderWidth: 2,
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
          callbacks: {
            label: function(context: any) {
              const estabelecimento = topData[context.dataIndex];
              return [
                `Vendas: R$ ${context.parsed.y.toLocaleString('pt-BR')}`,
                `Transações: ${estabelecimento.transacoes}`,
                `Ticket Médio: R$ ${estabelecimento.ticketMedio.toLocaleString('pt-BR')}`
              ];
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
            maxRotation: 45,
          },
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  // Componente de Gráfico de Rosca - Vendas por Categoria
  const VendasPorCategoriaChart = () => {
    const data = {
      labels: vendasPorCategoria.map(cat => cat.categoria),
      datasets: [
        {
          data: vendasPorCategoria.map(cat => cat.total),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(249, 115, 22)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
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
              const total = vendasPorCategoria.reduce((sum, cat) => sum + cat.total, 0);
              const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : '0';
              return `${context.label}: R$ ${context.parsed.toLocaleString('pt-BR')} (${percentage}%)`;
            }
          }
        },
      },
    };

    return <Doughnut data={data} options={options} />;
  };

  // Top estabelecimentos
  const getTopEstabelecimentos = () => {
    // Dados mockados realistas para top estabelecimentos
    const estabelecimentosMockados = [
      {
        id: '1',
        nome: 'Restaurante Sabor & Arte',
        categoria: 'Alimentação',
        total: 45650.80,
        transacoes: 356,
        ticketMedio: 128.23
      },
      {
        id: '2',
        nome: 'Farmácia Central',
        categoria: 'Saúde',
        total: 38920.50,
        transacoes: 289,
        ticketMedio: 134.67
      },
      {
        id: '3',
        nome: 'Supermercado Bom Preço',
        categoria: 'Alimentação',
        total: 35480.30,
        transacoes: 412,
        ticketMedio: 86.12
      },
      {
        id: '4',
        nome: 'Posto Shell Centro',
        categoria: 'Combustível',
        total: 32150.75,
        transacoes: 267,
        ticketMedio: 120.41
      },
      {
        id: '5',
        nome: 'Loja de Roupas Fashion',
        categoria: 'Vestuário',
        total: 28640.90,
        transacoes: 178,
        ticketMedio: 160.90
      },
      {
        id: '6',
        nome: 'Padaria São Jorge',
        categoria: 'Alimentação',
        total: 24320.60,
        transacoes: 523,
        ticketMedio: 46.51
      },
      {
        id: '7',
        nome: 'Academia Corpo & Mente',
        categoria: 'Serviços',
        total: 21850.40,
        transacoes: 145,
        ticketMedio: 150.69
      },
      {
        id: '8',
        nome: 'Livraria Cultura',
        categoria: 'Educação',
        total: 19230.85,
        transacoes: 234,
        ticketMedio: 82.18
      },
      {
        id: '9',
        nome: 'Pet Shop Amigo Fiel',
        categoria: 'Pet',
        total: 17680.30,
        transacoes: 156,
        ticketMedio: 113.34
      },
      {
        id: '10',
        nome: 'Ótica Visão Clara',
        categoria: 'Saúde',
        total: 15940.70,
        transacoes: 89,
        ticketMedio: 179.11
      }
    ];

    return estabelecimentosMockados;
  };

  const topEstabelecimentos = getTopEstabelecimentos();

  // Dados por categoria
  const getVendasPorCategoria = () => {
    // Dados mockados realistas para vendas por categoria
    const categoriasMockadas = [
      {
        categoria: 'Alimentação',
        total: 105451.70 // Restaurante + Supermercado + Padaria
      },
      {
        categoria: 'Saúde',
        total: 54861.20 // Farmácia + Ótica
      },
      {
        categoria: 'Combustível',
        total: 32150.75 // Posto
      },
      {
        categoria: 'Vestuário',
        total: 28640.90 // Loja de Roupas
      },
      {
        categoria: 'Serviços',
        total: 21850.40 // Academia
      },
      {
        categoria: 'Educação',
        total: 19230.85 // Livraria
      },
      {
        categoria: 'Pet',
        total: 17680.30 // Pet Shop
      },
      {
        categoria: 'Outros',
        total: 12450.60 // Diversos estabelecimentos menores
      }
    ];

    return categoriasMockadas.sort((a, b) => b.total - a.total);
  };

  const vendasPorCategoria = getVendasPorCategoria();

  const RelatorioVendas = () => (
    <div className="space-y-6">
      {/* Gráfico de Vendas por Dia */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Dia</h3>
        <div className="h-80">
          <VendasPorDiaChart />
        </div>
      </div>

      {/* Gráficos de Estabelecimentos e Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Top Estabelecimentos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Estabelecimentos</h3>
          <div className="h-80">
            <TopEstabelecimentosChart />
          </div>
        </div>

        {/* Gráfico de Vendas por Categoria */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Categoria</h3>
          <div className="h-80">
            <VendasPorCategoriaChart />
          </div>
        </div>
      </div>

      {/* Lista detalhada dos Top Estabelecimentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhamento dos Estabelecimentos</h3>
        <div className="space-y-3">
          {topEstabelecimentos.map((estabelecimento, index) => (
            <div key={estabelecimento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{estabelecimento.nome}</p>
                  <p className="text-sm text-gray-500">{estabelecimento.categoria}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  R$ {estabelecimento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">
                  {estabelecimento.transacoes} vendas
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RelatorioComissoes = () => {
    const comissoesPeriodo = mockComissoes.filter(c => {
      const hoje = new Date();
      const diasAtras = new Date(hoje.getTime() - parseInt(periodo) * 24 * 60 * 60 * 1000);
      return c.createdAt >= diasAtras && c.createdAt <= hoje;
    });

    const totalComissoes = comissoesPeriodo.reduce((sum, c) => sum + c.valor, 0);
    const comissoesPagas = comissoesPeriodo.filter(c => c.status === 'paga');
    const comissoesPendentes = comissoesPeriodo.filter(c => c.status === 'pendente');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comissões</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagas</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {comissoesPagas.reduce((sum, c) => sum + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {comissoesPendentes.reduce((sum, c) => sum + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comissões por Franqueado</h3>
          <div className="space-y-3">
            {mockFranqueados.map(franqueado => {
              const comissoesFranqueado = comissoesPeriodo.filter(c => c.franqueadoId === franqueado.id);
              const total = comissoesFranqueado.reduce((sum, c) => sum + c.valor, 0);
              
              if (total === 0) return null;
              
              return (
                <div key={franqueado.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{franqueado.name}</p>
                      <p className="text-sm text-gray-500">{franqueado.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {comissoesFranqueado.length} transações
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const RelatorioCartoes = () => {
    const cartoesData = {
      ativos: mockCartoes.filter(c => c.status === 'ativo').length,
      utilizados: mockCartoes.filter(c => c.status === 'utilizado').length,
      expirados: mockCartoes.filter(c => c.status === 'expirado').length,
      total: mockCartoes.length
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{cartoesData.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiActivity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{cartoesData.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilizados</p>
                <p className="text-2xl font-bold text-gray-900">{cartoesData.utilizados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiActivity className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-gray-900">{cartoesData.expirados}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Status</h3>
          <div className="space-y-4">
            {Object.entries(cartoesData).filter(([key]) => key !== 'total').map(([status, count]) => {
              const percentage = cartoesData.total > 0 ? (count / cartoesData.total) * 100 : 0;
              const colors = {
                ativos: 'bg-green-500',
                utilizados: 'bg-orange-500',
                expirados: 'bg-red-500'
              };
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium capitalize">{status}</span>
                    <span className="text-gray-900 font-semibold">{count} cartões</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[status as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {percentage.toFixed(1)}% do total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRelatorio = () => {
    switch (tipoRelatorio) {
      case 'vendas':
        return <RelatorioVendas />;
      case 'comissoes':
        return <RelatorioComissoes />;
      case 'cartoes':
        return <RelatorioCartoes />;
      default:
        return <RelatorioVendas />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
              <p className="text-gray-600">Análise detalhada de performance e métricas</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiFilter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <FiDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {metricas.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recargas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {metricas.totalRecargas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiActivity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.transacoesPeriodo}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiBarChart className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Filtro */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={tipoRelatorio}
                  onChange={(e) => setTipoRelatorio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="vendas">Vendas e Transações</option>
                  <option value="comissoes">Comissões</option>
                  <option value="cartoes">Cartões</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="365">Último ano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo do Relatório */}
          {renderRelatorio()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
