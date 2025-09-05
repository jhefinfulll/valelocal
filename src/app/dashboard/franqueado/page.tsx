'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingBag,
  FiBarChart
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

export default function FranqueadoDashboard() {
  const stats = [
    {
      title: 'Estabelecimentos Ativos',
      value: 35,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
      trend: { value: 8.3, isPositive: true }
    },
    {
      title: 'Cartões Distribuídos',
      value: 450,
      icon: FiCreditCard,
      color: 'bg-green-500',
      trend: { value: 12.1, isPositive: true }
    },
    {
      title: 'Volume da Região',
      value: 18500,
      icon: FiDollarSign,
      color: 'bg-purple-500',
      trend: { value: 15.7, isPositive: true }
    },
    {
      title: 'Comissões do Mês',
      value: 2775,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      trend: { value: 18.2, isPositive: true }
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['FRANQUEADO']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header com Boas-vindas */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Olá, Gestor! 👋
                </h1>
                <p className="opacity-90">Acompanhe sua região e estabelecimentos</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Região</p>
                <p className="font-semibold text-lg">São Paulo</p>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estabelecimentos Recentes */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Estabelecimentos da Região</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { nome: 'Restaurante do João', categoria: 'Alimentação', status: 'Ativo', vendas: 'R$ 2.450' },
                  { nome: 'Padaria Central', categoria: 'Alimentação', status: 'Ativo', vendas: 'R$ 1.890' },
                  { nome: 'Mercado Silva', categoria: 'Supermercado', status: 'Ativo', vendas: 'R$ 3.200' },
                  { nome: 'Farmácia Saúde', categoria: 'Farmácia', status: 'Pendente', vendas: 'R$ 980' }
                ].map((estabelecimento, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FiShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{estabelecimento.nome}</p>
                        <p className="text-sm text-gray-500">{estabelecimento.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{estabelecimento.vendas}</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        estabelecimento.status === 'Ativo' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {estabelecimento.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações da Região */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Região: São Paulo</h3>
              <div className="space-y-4">
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meta Mensal</span>
                  <span className="font-medium text-green-600">R$ 25.000</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Ações Rápidas</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FiShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">Adicionar Estabelecimento</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FiCreditCard className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-800">Solicitar Cartões</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FiBarChart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-800">Ver Relatório</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Notificações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Notificações</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">2 estabelecimentos adicionados hoje</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">Estoque baixo: 15 cartões restantes</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Relatório mensal disponível</p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meta Mensal</span>
                  <span className="font-medium">74%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '74%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crescimento</span>
                  <span className="font-medium text-green-600">+15.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ranking Regional</span>
                  <span className="font-medium">2º lugar</span>
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
                    <p className="text-xs text-gray-500">Farmácia Nova - há 1 hora</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cartões distribuídos</p>
                    <p className="text-xs text-gray-500">50 cartões - há 3 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Comissão processada</p>
                    <p className="text-xs text-gray-500">R$ 450,00 - ontem</p>
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
