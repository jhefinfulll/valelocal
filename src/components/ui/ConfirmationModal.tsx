'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FiAlertTriangle } from 'react-icons/fi'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false
}: ConfirmationModalProps) {
  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger' as const
      case 'warning':
        return 'warning' as const
      case 'info':
        return 'primary' as const
      default:
        return 'danger' as const
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-red-600'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10`}>
          <FiAlertTriangle className={`h-6 w-6 ${getIconColor()}`} />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <div className="mt-2">
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <Button
          variant={getConfirmButtonVariant()}
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  )
}
