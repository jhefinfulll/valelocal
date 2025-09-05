import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    
    // Auto fechar
    const timer2 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Tempo para animação de saída
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const bgColor = type === 'success' 
    ? 'bg-green-50 border-green-200' 
    : 'bg-red-50 border-red-200';
  
  const textColor = type === 'success' 
    ? 'text-green-800' 
    : 'text-red-800';
    
  const iconColor = type === 'success' 
    ? 'text-green-400' 
    : 'text-red-400';

  const Icon = type === 'success' ? FiCheckCircle : FiXCircle;

  return (
    <div
      className={`
        flex items-center p-4 mb-3 rounded-lg border shadow-md transition-all duration-300 ease-in-out
        ${bgColor} ${textColor}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        max-w-sm w-full
      `}
    >
      <Icon className={`w-5 h-5 mr-3 ${iconColor}`} />
      
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      
      <button
        onClick={handleClose}
        className={`ml-3 p-1 rounded-md hover:bg-opacity-20 transition-colors ${
          type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600'
        }`}
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface ToastManagerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error';
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastManagerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onRemove}
        />
      ))}
    </div>
  );
}
