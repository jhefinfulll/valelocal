// src/components/estabelecimentos/EstabelecimentoPaymentModal.tsx
'use client'

import React from 'react'
import { FiX } from 'react-icons/fi'
import PaymentStatus from './PaymentStatus'

interface EstabelecimentoPaymentModalProps {
  isOpen: boolean
  onClose: () => void
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
  onRefresh?: () => void
}

export default function EstabelecimentoPaymentModal({ 
  isOpen, 
  onClose, 
  estabelecimento, 
  onRefresh 
}: EstabelecimentoPaymentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Status de Pagamento - {estabelecimento.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <PaymentStatus 
            estabelecimento={estabelecimento}
            onRefresh={onRefresh}
          />
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
