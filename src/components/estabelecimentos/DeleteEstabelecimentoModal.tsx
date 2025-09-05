'use client'

import React from 'react'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import type { EstabelecimentoData } from '@/services/estabelecimentosService'

interface DeleteEstabelecimentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  estabelecimento: EstabelecimentoData | null
  loading?: boolean
}

export function DeleteEstabelecimentoModal({
  isOpen,
  onClose,
  onConfirm,
  estabelecimento,
  loading = false
}: DeleteEstabelecimentoModalProps) {
  if (!estabelecimento) return null

  const message = `Tem certeza que deseja excluir o estabelecimento "${estabelecimento.name}"?
  
Esta ação não pode ser desfeita e todos os dados relacionados serão removidos:
• Informações do estabelecimento
• Cartões vinculados
• Histórico de transações
• Comissões relacionadas
• Displays associados

Digite "CONFIRMAR" abaixo para prosseguir com a exclusão.`

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Excluir Estabelecimento"
      message={message}
      confirmText="Excluir"
      cancelText="Cancelar"
      type="danger"
      loading={loading}
    />
  )
}
