// src/components/estabelecimentos/PaymentStatus.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Copy, ExternalLink, RefreshCw } from 'lucide-react'

interface PaymentStatusProps {
  estabelecimento: {
    id: string
    name: string
    status: string
    cobrancas?: Array<{
      id: string
      valor: number
      vencimento: string
      urlPagamento: string
      pixQrCode: string
      status: string
    }>
  }
  pagamento?: {
    status: string
    valor: number
    vencimento: string
    urlPagamento: string
    pixQrCode: string
    instrucoes: string[]
  }
  onRefresh?: () => void
}

export default function PaymentStatus({ 
  estabelecimento, 
  pagamento, 
  onRefresh 
}: PaymentStatusProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  // Dados da cobrança (prioriza prop pagamento, senão pega da última cobrança)
  const cobrancaData = pagamento || (estabelecimento.cobrancas?.[0] ? {
    status: estabelecimento.cobrancas[0].status,
    valor: estabelecimento.cobrancas[0].valor,
    vencimento: estabelecimento.cobrancas[0].vencimento,
    urlPagamento: estabelecimento.cobrancas[0].urlPagamento,
    pixQrCode: estabelecimento.cobrancas[0].pixQrCode,
    instrucoes: [
      '1. Realize o pagamento da taxa de ativação',
      '2. O estabelecimento será ativado automaticamente',
      '3. Você receberá um email de confirmação'
    ]
  } : null)

  // Calcular tempo restante
  useEffect(() => {
    if (!cobrancaData?.vencimento) return

    const interval = setInterval(() => {
      const now = new Date()
      const expiry = new Date(cobrancaData.vencimento)
      const diff = expiry.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Vencido')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [cobrancaData?.vencimento])

  // Copiar código PIX
  const copyPixCode = async () => {
    if (!cobrancaData?.pixQrCode) return

    try {
      await navigator.clipboard.writeText(cobrancaData.pixQrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  // Status do estabelecimento
  const getStatusInfo = () => {
    switch (estabelecimento.status) {
      case 'ATIVO':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          title: 'Estabelecimento Ativo',
          message: 'O estabelecimento foi ativado com sucesso!'
        }
      case 'PENDENTE_PAGAMENTO':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Clock,
          title: 'Aguardando Pagamento',
          message: 'Realize o pagamento para ativar o estabelecimento'
        }
      case 'RASCUNHO':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
          title: 'Rascunho',
          message: 'Estabelecimento cadastrado mas não finalizado'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
          title: 'Status Desconhecido',
          message: 'Entre em contato com o suporte'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {estabelecimento.name}
          </h3>
          <p className="text-sm text-gray-500">ID: {estabelecimento.id}</p>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Atualizar status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-lg border-2 ${statusInfo.bgColor} ${statusInfo.borderColor} mb-6`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          <div>
            <h4 className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h4>
            <p className={`text-sm ${statusInfo.color}`}>
              {statusInfo.message}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {cobrancaData && estabelecimento.status === 'PENDENTE_PAGAMENTO' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Valor:</span>
            <span className="text-lg font-bold text-gray-900">
              R$ {Number(cobrancaData.valor).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Vencimento:</span>
            <div className="text-right">
              <div className="text-gray-900">
                {new Date(cobrancaData.vencimento).toLocaleDateString('pt-BR')}
              </div>
              {timeLeft && (
                <div className="text-xs text-gray-500">
                  {timeLeft === 'Vencido' ? '⚠️ Vencido' : `⏱️ ${timeLeft}`}
                </div>
              )}
            </div>
          </div>

          {/* PIX QR Code */}
          {cobrancaData.pixQrCode && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h5 className="font-medium text-gray-700 mb-2">Código PIX:</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cobrancaData.pixQrCode}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-white font-mono"
                />
                <button
                  onClick={copyPixCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <a
              href={cobrancaData.urlPagamento}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Pagar Agora
            </a>
          </div>

          {/* Instructions */}
          {cobrancaData.instrucoes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h5 className="font-medium text-blue-800 mb-2">Instruções:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {cobrancaData.instrucoes.map((instrucao, index) => (
                  <li key={index}>• {instrucao}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {estabelecimento.status === 'ATIVO' && (
        <div className="text-center py-4">
          <div className="text-green-600 text-4xl mb-2">🎉</div>
          <p className="text-green-700 font-medium">
            Pagamento confirmado! O estabelecimento está ativo.
          </p>
        </div>
      )}
    </div>
  )
}
