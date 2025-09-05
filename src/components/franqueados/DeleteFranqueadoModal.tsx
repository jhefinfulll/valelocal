'use client'

import React from 'react'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import type { FranqueadoData } from '@/services/franqueadosService'

interface DeleteFranqueadoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  franqueado: FranqueadoData | null
  loading?: boolean
}

export function DeleteFranqueadoModal({
  isOpen,
  onClose,
  onConfirm,
  franqueado,
  loading = false
}: DeleteFranqueadoModalProps) {
  if (!franqueado) return null

  const message = `Tem certeza que deseja excluir o franqueado "${franqueado.name}"?
  
Esta ação não pode ser desfeita e todos os dados relacionados serão removidos:
• Informações do franqueado
• Estabelecimentos vinculados
• Histórico de comissões
• Relatórios associados

Digite "CONFIRMAR" abaixo para prosseguir com a exclusão.`

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Excluir Franqueado"
      message={message}
      confirmText="Excluir"
      cancelText="Cancelar"
      type="danger"
      loading={loading}
    />
  )
}
