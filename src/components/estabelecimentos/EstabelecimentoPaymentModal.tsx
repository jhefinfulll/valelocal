import React, { useState, useEffect } from 'react'
import { FiCreditCard, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiCopy, FiExternalLink } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { cobrancasService, CobrancaData } from '@/services/cobrancasService'

interface EstabelecimentoPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  estabelecimentoId: string
  estabelecimentoNome: string
}

export function EstabelecimentoPaymentModal({
  isOpen,
  onClose,
  estabelecimentoId,
  estabelecimentoNome
}: EstabelecimentoPaymentModalProps) {
  const { showSuccess, showError, showInfo } = useToast()
  const [cobrancas, setCobrancas] = useState<CobrancaData[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Buscar cobranças do estabelecimento
  useEffect(() => {
    if (isOpen && estabelecimentoId) {
      loadCobrancas()
    }
  }, [isOpen, estabelecimentoId])

  const loadCobrancas = async () => {
    try {
      setLoading(true)
      const response = await cobrancasService.listCobrancas()
      console.log('Resposta cobranças modal:', response)
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && response.data && response.data.cobrancas) {
        // Filtrar cobranças do estabelecimento específico
        const cobrancasEstabelecimento = response.data.cobrancas.filter(
          cobranca => cobranca.estabelecimento.id === estabelecimentoId
        )
        setCobrancas(cobrancasEstabelecimento)
      } else if (response && (response as any).cobrancas) {
        // Fallback para estrutura direta (compatibilidade)
        const cobrancasEstabelecimento = (response as any).cobrancas.filter(
          (cobranca: any) => cobranca.estabelecimento.id === estabelecimentoId
        )
        setCobrancas(cobrancasEstabelecimento)
      } else {
        console.warn('Resposta da API não tem a estrutura esperada:', response)
        setCobrancas([])
      }
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error)
      showError('Erro ao carregar informações de pagamento')
      setCobrancas([])
    } finally {
      setLoading(false)
    }
  }

  const generateNewCharge = async () => {
    try {
      setGenerating(true)
      const response = await cobrancasService.generateCobranca({
        estabelecimentoId
      })
      
      showSuccess('Nova cobrança gerada com sucesso!')
      await loadCobrancas() // Recarregar cobranças
    } catch (error) {
      console.error('Erro ao gerar cobrança:', error)
      showError('Erro ao gerar nova cobrança')
    } finally {
      setGenerating(false)
    }
  }

  const copyPixCode = (pixCode: string) => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
      showSuccess('Código PIX copiado!')
    }
  }

  const openPaymentUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'EXPIRED':
        return 'text-red-600 bg-red-100'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <FiCheckCircle className="w-5 h-5" />
      case 'PENDING':
        return <FiClock className="w-5 h-5" />
      case 'EXPIRED':
        return <FiAlertCircle className="w-5 h-5" />
      default:
        return <FiCreditCard className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pago'
      case 'PENDING':
        return 'Pendente'
      case 'EXPIRED':
        return 'Vencido'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  // Encontrar a cobrança mais recente
  const cobrancaAtual = cobrancas.length > 0 ? cobrancas[0] : null
  const temCobrancaPaga = cobrancas.some(c => c.status === 'PAID')

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Carregando..." size="lg">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Pagamento" size="lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6 sr-only">Gerenciar Pagamento</h2>
        
        {/* Status do Estabelecimento */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">{estabelecimentoNome}</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${temCobrancaPaga ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>
            {temCobrancaPaga ? <FiCheckCircle className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
            <span className="ml-2">{temCobrancaPaga ? 'Taxa Paga - Ativo' : 'Taxa Pendente'}</span>
          </div>
        </div>

        {/* Se tem cobrança paga */}
        {temCobrancaPaga && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Taxa Paga</h4>
                <p className="text-green-700 text-sm">
                  A taxa de ativação foi paga e o estabelecimento está ativo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Se há cobrança pendente */}
        {cobrancaAtual && cobrancaAtual.status === 'PENDING' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FiClock className="w-5 h-5 text-yellow-600 mr-3" />
                <h4 className="font-medium text-yellow-800">Taxa de Ativação Pendente</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-700 font-medium">Valor:</span>
                  <span className="ml-2">{cobrancasService.formatCurrency(cobrancaAtual.valor)}</span>
                </div>
                <div>
                  <span className="text-yellow-700 font-medium">Vencimento:</span>
                  <span className="ml-2">{cobrancasService.formatDate(cobrancaAtual.vencimento)}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-yellow-700 font-medium text-sm mb-2">Instruções:</p>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Taxa de R$ 500,00 para ativação do estabelecimento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pagamento via boleto bancário</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Após o pagamento, o estabelecimento será ativado automaticamente</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Botão de Pagamento */}
            {cobrancaAtual.urlPagamento && (
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => openPaymentUrl(cobrancaAtual.urlPagamento!)}
                  className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4 mr-2" />
                  Abrir Boleto para Pagamento
                </button>
              </div>
            )}
          </div>
        )}

        {/* Se cobrança expirada */}
        {cobrancaAtual && cobrancaAtual.status === 'EXPIRED' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h4 className="font-medium text-red-800">Cobrança Vencida</h4>
                  <p className="text-red-700 text-sm">
                    A cobrança venceu em {cobrancasService.formatDate(cobrancaAtual.vencimento)}.
                    É necessário gerar uma nova cobrança.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={generateNewCharge}
              disabled={generating}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Nova Cobrança...
                </>
              ) : (
                <>
                  <FiCreditCard className="w-4 h-4 mr-2" />
                  Gerar Nova Cobrança
                </>
              )}
            </button>
          </div>
        )}

        {/* Se não há cobranças */}
        {cobrancas.length === 0 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiClock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800">Taxa de Ativação</h4>
                  <p className="text-yellow-700 text-sm">
                    Para ativar este estabelecimento, é necessário gerar uma cobrança de R$ 500,00.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={generateNewCharge}
              disabled={generating}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Cobrança...
                </>
              ) : (
                <>
                  <FiCreditCard className="w-4 h-4 mr-2" />
                  Gerar Cobrança de Ativação
                </>
              )}
            </button>
          </div>
        )}

        {/* Histórico de Cobranças */}
        {cobrancas.length > 1 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Histórico de Cobranças</h4>
            <div className="space-y-2">
              {cobrancas.slice(1).map((cobranca) => (
                <div key={cobranca.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(cobranca.status)}
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        {cobrancasService.formatCurrency(cobranca.valor)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        - {cobrancasService.formatDate(cobranca.vencimento)}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cobranca.status)}`}>
                    {getStatusText(cobranca.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            onClick={loadCobrancas}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
