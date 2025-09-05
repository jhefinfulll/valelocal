'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag,
  FiBarChart,
  FiActivity,
  FiCalendar
} from 'react-icons/fi'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
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
  )
}

function RecentTransactions() {
  const recentTransactions = [
    {
      id: '1',
      tipo: 'recarga',
      valor: 150.00,
      status: 'concluida',
      createdAt: new Date()
    },
    {
      id: '2',
      tipo: 'utilizacao',
      valor: 45.80,
      status: 'concluida',
      createdAt: new Date()
    },
    {
      id: '3',
      tipo: 'recarga',
      valor: 200.00,
      status: 'processando',
      createdAt: new Date()
    }
  ]
  
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
  )
}

export default function FranqueadoraDashboard() {
  const stats = [
    {
      title: 'Total de Franqueados',
      value: 15,
      icon: FiUsers,
      color: 'bg-blue-500',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Estabelecimentos Ativos',
      value: 142,
      icon: FiShoppingBag,
      color: 'bg-green-500',
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: 'Cartões Ativos',
      value: 2847,
      icon: FiCreditCard,
      color: 'bg-purple-500',
      trend: { value: 15.3, isPositive: true }
    },
    {
      title: 'Volume Mensal',
      value: 84250,
      icon: FiDollarSign,
      color: 'bg-orange-500',
      trend: { value: 18.9, isPositive: true }
    },
    {
      title: 'Transações Hoje',
      value: 156,
      icon: FiActivity,
      color: 'bg-indigo-500',
      trend: { value: 5.7, isPositive: true }
    },
    {
      title: 'Comissões Totais',
      value: 12680,
      icon: FiTrendingUp,
      color: 'bg-emerald-500',
      trend: { value: 22.1, isPositive: true }
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['FRANQUEADORA']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header com Boas-vindas */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Olá, Admin! 👋
                </h1>
                <p className="opacity-90">Visão geral de toda a rede de franquias</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transações Recentes */}
            <div className="lg:col-span-2">
              <RecentTransactions />
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
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
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Notificações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Notificações</h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">3 solicitações de cartões pendentes</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Relatório mensal disponível</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">2 novos estabelecimentos aprovados</p>
                </div>
              </div>
            </div>

            {/* Resumo da Rede */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Resumo da Rede</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Regiões Ativas</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa Média de Comissão</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crescimento Mensal</span>
                  <span className="font-medium text-green-600">+18.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfação Média</span>
                  <span className="font-medium">4.8/5</span>
                </div>
              </div>
            </div>

            {/* Últimas Atividades */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Últimas Atividades</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estabelecimento aprovado</p>
                    <p className="text-xs text-gray-500">Restaurante do João - há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Novo franqueado cadastrado</p>
                    <p className="text-xs text-gray-500">Maria Silva - Região Sul - há 5 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Solicitação de cartões</p>
                    <p className="text-xs text-gray-500">100 cartões - Franqueado Norte - há 1 dia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
