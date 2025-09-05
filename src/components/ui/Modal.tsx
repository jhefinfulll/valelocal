'use client'

import React from 'react'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm sm:max-w-md w-full mx-2 sm:mx-4'
      case 'md':
        return 'max-w-md sm:max-w-lg w-full mx-2 sm:mx-4'
      case 'lg':
        return 'max-w-lg sm:max-w-2xl w-full mx-2 sm:mx-4'
      case 'xl':
        return 'max-w-xl sm:max-w-4xl w-full mx-2 sm:mx-4'
      default:
        return 'max-w-md sm:max-w-lg w-full mx-2 sm:mx-4'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-2 sm:p-4 text-center sm:items-center">
        <div 
          className="fixed inset-0 transition-opacity"
          onClick={onClose}
          style={{ backgroundColor: 'lab(48 -0.39 -10.03 / 0.7)' }}
        />
        
        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full ${getSizeClasses()}`}>
          <div className="bg-white px-3 sm:px-6 pb-4 pt-4 sm:pt-5 sm:pb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900 truncate pr-2">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  type="button"
                  className="flex-shrink-0 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1.5 sm:p-1"
                  onClick={onClose}
                >
                  <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
