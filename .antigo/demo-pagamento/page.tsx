// src/app/demo-pagamento/page.tsx
'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import PaymentStatus from '@/components/estabelecimentos/PaymentStatus'
import { useState } from 'react'
import { FiRefreshCw, FiInfo } from 'react-icons/fi'

export default function DemoPagamentoPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dados de exemplo
  const estabelecimentoPendente = {
    id: 'est_123456',
    name: 'Restaurante do João',
    status: 'PENDENTE_PAGAMENTO' as const,
    cobrancas: [{
      id: 'cob_123',
      valor: 150.00,
      vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      urlPagamento: 'https://asaas.com/pay/123456',
      pixQrCode: '00020126580014br.gov.bcb.pix01364e4f0f8c-3f5f-4b5f-9f5f-4b5f9f5f4b5f5204000053039865802BR5925RESTAURANTE DO JOAO LTDA6009SAO PAULO62070503***63049999',
      status: 'PENDING'
    }]
  }

  const estabelecimentoAtivo = {
    id: 'est_789012',
    name: 'Padaria da Maria',
    status: 'ATIVO' as const,
    cobrancas: []
  }

  const pagamentoDireto = {
    status: 'PENDENTE',
    valor: 150.00,
    vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    urlPagamento: 'https://asaas.com/pay/789012',
    pixQrCode: '00020126580014br.gov.bcb.pix01364e4f0f8c-3f5f-4b5f-9f5f-4b5f9f5f4b5f5204000053039865802BR5925PADARIA DA MARIA LTDA6009SAO PAULO62070503***63049999',
    instrucoes: [
      '1. Realize o pagamento da taxa de ativação de R$ 150,00',
      '2. O estabelecimento será ativado automaticamente após confirmação',
      '3. Você receberá um email de confirmação',
      '4. O prazo para pagamento é de 24 horas'
    ]
  }

  const handleRefresh = async (estabelecimentoId: string) => {
    setIsRefreshing(true)
    console.log(`Atualizando status do estabelecimento ${estabelecimentoId}`)
    
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Em um caso real, faria uma chamada para a API
    alert(`Status do estabelecimento ${estabelecimentoId} atualizado!`)
    setIsRefreshing(false)
  }

  return (
    <ProtectedRoute allowedRoles={['franqueadora', 'franqueado']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🧪 Demo - Status de Pagamento
              </h1>
              <p className="text-gray-600">
                Demonstração dos componentes de status de pagamento para ativação de estabelecimentos
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button 
                onClick={() => window.location.reload()}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar Demo'}
              </button>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Sobre esta demonstração:</p>
                <p>Esta página mostra como os componentes de pagamento funcionam dentro do layout padrão do sistema. 
                Os dados são simulados para fins de demonstração da integração com o Asaas.</p>
              </div>
            </div>
          </div>

          {/* Cards de Demonstração */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Estabelecimento Pendente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⏳ Aguardando Pagamento
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Demo
                </span>
              </div>
              <PaymentStatus 
                estabelecimento={estabelecimentoPendente}
                onRefresh={() => handleRefresh(estabelecimentoPendente.id)}
              />
            </div>

            {/* Estabelecimento Ativo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ✅ Estabelecimento Ativo
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Demo
                </span>
              </div>
              <PaymentStatus 
                estabelecimento={estabelecimentoAtivo}
                onRefresh={() => handleRefresh(estabelecimentoAtivo.id)}
              />
            </div>
          </div>

          {/* Pagamento via Props - Full Width */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                💰 Pagamento Direto (via props)
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Demo
              </span>
            </div>
            <PaymentStatus 
              estabelecimento={{
                id: 'est_props_test',
                name: 'Lanchonete do Pedro',
                status: 'PENDENTE_PAGAMENTO'
              }}
              pagamento={pagamentoDireto}
              onRefresh={() => handleRefresh('est_props_test')}
            />
          </div>

          {/* Informações Técnicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              📋 Informações Técnicas
            </h3>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-800 mb-4">Estados do Estabelecimento:</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-gray-900">RASCUNHO</div>
                      <div className="text-sm text-gray-600">Recém criado, sem cobrança</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-gray-900">PENDENTE_PAGAMENTO</div>
                      <div className="text-sm text-gray-600">Aguardando pagamento da taxa</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-gray-900">ATIVO</div>
                      <div className="text-sm text-gray-600">Pagamento confirmado, funcionando</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-4">Funcionalidades Implementadas:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Contador de tempo para vencimento
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Copiar código PIX com um clique
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Link direto para pagamento no Asaas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Atualização manual de status
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Interface responsiva
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Integração com layout do sistema
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">🚀 Integração Completa - Fase 1 MVP</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="text-sm text-blue-700">
                  <div className="font-medium">✅ Backend:</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Database schema criado</li>
                    <li>• Serviço Asaas implementado</li>
                    <li>• Webhook funcionando</li>
                    <li>• API integrada</li>
                  </ul>
                </div>
                <div className="text-sm text-blue-700">
                  <div className="font-medium">✅ Frontend:</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Componentes de pagamento</li>
                    <li>• Layout integrado</li>
                    <li>• Estados visuais</li>
                    <li>• UX responsiva</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
