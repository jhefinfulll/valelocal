'use client'

import React, { useState, useEffect } from 'react'
import { FiCheck, FiClock, FiAlertCircle, FiEye, FiRefreshCw } from 'react-icons/fi'
import { cobrancasService, CobrancaData } from '@/services/cobrancasService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

interface CobrancasTableProps {
  onRefresh?: () => void
}

export function CobrancasTable({ onRefresh }: CobrancasTableProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [cobrancas, setCobrancas] = useState<CobrancaData[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null)

  useEffect(() => {
    loadCobrancas()
  }, [])

  const loadCobrancas = async () => {
    try {
      setLoading(true)
      const response = await cobrancasService.listCobrancas()
      console.log('Resposta cobranças:', response)
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && response.data && response.data.cobrancas) {
        setCobrancas(response.data.cobrancas)
      } else if (response && (response as any).cobrancas) {
        // Fallback para estrutura direta (compatibilidade)
        setCobrancas((response as any).cobrancas)
      } else {
        console.warn('Resposta da API não tem a estrutura esperada:', response)
        setCobrancas([])
      }
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error)
      showError('Erro ao carregar cobranças')
      setCobrancas([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (cobrancaId: string) => {
    try {
      setMarkingAsPaid(cobrancaId)
      await cobrancasService.markAsPaid(cobrancaId)
      showSuccess('Cobrança marcada como paga com sucesso!')
      await loadCobrancas()
      onRefresh?.()
    } catch (error) {
      console.error('Erro ao marcar como paga:', error)
      showError('Erro ao marcar cobrança como paga')
    } finally {
      setMarkingAsPaid(null)
    }
  }

  const getStatusIcon = (status: CobrancaData['status']) => {
    switch (status) {
      case 'PAID':
        return <FiCheck className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <FiClock className="w-4 h-4 text-yellow-600" />
      case 'EXPIRED':
        return <FiAlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FiClock className="w-4 h-4 text-gray-600" />
    }
  }

  const isVencida = (vencimento: string) => {
    return new Date(vencimento) < new Date()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cobrancas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <FiClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhuma cobrança encontrada</p>
          <p className="text-sm">Quando houver cobranças, elas aparecerão aqui.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Cobranças</h3>
        <button
          onClick={loadCobrancas}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estabelecimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franqueado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimento
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
            {cobrancas.map((cobranca) => (
              <tr key={cobranca.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {cobranca.estabelecimento.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      CNPJ: {cobranca.estabelecimento.cnpj}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {cobranca.franqueado.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      CNPJ: {cobranca.franqueado.cnpj}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cobrancasService.formatCurrency(cobranca.valor)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cobrancasService.getTipoText(cobranca.tipo)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isVencida(cobranca.vencimento) && cobranca.status === 'PENDING' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {cobrancasService.formatDate(cobranca.vencimento)}
                  </div>
                  {isVencida(cobranca.vencimento) && cobranca.status === 'PENDING' && (
                    <div className="text-xs text-red-500">Vencida</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(cobranca.status)}
                    <span className={`ml-2 text-sm ${cobrancasService.getStatusColor(cobranca.status).replace('bg-', 'text-').replace('100', '600')}`}>
                      {cobrancasService.getStatusText(cobranca.status)}
                    </span>
                  </div>
                  {cobranca.paidAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Pago em {cobrancasService.formatDate(cobranca.paidAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {cobranca.urlPagamento && (
                      <button
                        onClick={() => window.open(cobranca.urlPagamento!, '_blank')}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver boleto"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {user?.type === 'FRANQUEADORA' && 
                     cobranca.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkAsPaid(cobranca.id)}
                        disabled={markingAsPaid === cobranca.id}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Marcar como pago"
                      >
                        {markingAsPaid === cobranca.id ? (
                          <FiRefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <FiCheck className="w-3 h-3 mr-1 inline" />
                            Dar Baixa
                          </>
                        )}
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
  )
}
