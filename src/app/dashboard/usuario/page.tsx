'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function UsuarioDashboard() {
  return (
    <ProtectedRoute allowedRoles={['USUARIO']}>
      <DashboardLayout 
        title="Dashboard Usuário" 
        subtitle="Seus cartões e histórico de uso"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 - Meus Cartões */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meus Cartões</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          {/* Card 2 - Saldo Total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ 125,00</p>
              </div>
            </div>
          </div>

          {/* Card 3 - Transações Este Mês */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transações Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          {/* Card 4 - Valor Gasto */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Gasto</p>
                <p className="text-2xl font-bold text-gray-900">R$ 275,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meus Cartões e Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meus Cartões</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Vale Local</p>
                    <p className="text-xs opacity-75">Padaria Central</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ 50,00</p>
                    <p className="text-xs opacity-75">Ativo</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs opacity-75">****  ****  ****  1234</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Vale Local</p>
                    <p className="text-xs opacity-75">Farmácia Saúde</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ 30,00</p>
                    <p className="text-xs opacity-75">Ativo</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs opacity-75">****  ****  ****  5678</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Vale Local</p>
                    <p className="text-xs opacity-75">Supermercado Bom Preço</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ 45,00</p>
                    <p className="text-xs opacity-75">Ativo</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs opacity-75">****  ****  ****  9012</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico Recente</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compra - Padaria Central</p>
                    <p className="text-xs text-gray-500">Ontem às 14:30</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium">-R$ 15,00</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compra - Farmácia Saúde</p>
                    <p className="text-xs text-gray-500">2 dias atrás às 09:15</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium">-R$ 20,00</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compra - Supermercado</p>
                    <p className="text-xs text-gray-500">3 dias atrás às 18:45</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium">-R$ 35,00</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compra - Padaria Central</p>
                    <p className="text-xs text-gray-500">1 semana atrás às 08:20</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium">-R$ 12,00</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
