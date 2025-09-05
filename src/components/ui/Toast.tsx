'use client'

import React, { useEffect } from 'react'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import { ToastData } from '@/hooks/useToast'

interface ToastProps {
  toast: ToastData
  onRemove: (id: string) => void
}

function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onRemove])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-500" />
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getToastStyles()} animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={() => onRemove(toast.id)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
