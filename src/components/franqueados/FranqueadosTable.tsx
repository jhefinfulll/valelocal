'use client'

import React, { useState } from 'react'
import { 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { FranqueadoData } from '@/services/franqueadosService'
import { maskCNPJ, maskPhone, formatDate } from '@/utils/masks'

interface FranqueadosTableProps {
  franqueados: FranqueadoData[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onView: (franqueado: FranqueadoData) => void
  onEdit: (franqueado: FranqueadoData) => void
  onDelete: (franqueado: FranqueadoData) => void
  onPageChange?: (page: number) => void
  searchTerm?: string
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="animate-pulse h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Franqueado', 'Região', 'Estabelecimentos', 'Comissão', 'Status', 'Ações'].map((header, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const StatusBadge: React.FC<{ status: 'ATIVO' | 'INATIVO' }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'ATIVO' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {status === 'ATIVO' ? (
      <FiCheckCircle className="w-3 h-3 mr-1" />
    ) : (
      <FiAlertCircle className="w-3 h-3 mr-1" />
    )}
    {status}
  </span>
)

const ActionButton: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  title: string
  color: 'blue' | 'green' | 'red'
  disabled?: boolean
}> = ({ onClick, icon, title, color, disabled = false }) => {
  const colorClasses = {
    blue: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
    green: 'text-green-600 hover:text-green-900 hover:bg-green-50',
    red: 'text-red-600 hover:text-red-900 hover:bg-red-50'
  }

  return (
    <button 
      onClick={onClick}
      className={`p-1 rounded transition-colors ${colorClasses[color]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={title}
      disabled={disabled}
    >
      {icon}
    </button>
  )
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const highlightText = (text: string, searchTerm?: string): React.ReactNode => {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : part
  )
}

export const FranqueadosTable: React.FC<FranqueadosTableProps> = ({
  franqueados,
  loading,
  pagination,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  searchTerm
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (loading) {
    return <LoadingSkeleton />
  }

  const handleDelete = async (franqueado: FranqueadoData) => {
    setDeletingId(franqueado.id)
    try {
      await onDelete(franqueado)
    } finally {
      setDeletingId(null)
    }
  }

  const EmptyState = () => (
    <div className="text-center py-12">
      <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">
        {searchTerm ? 'Nenhum franqueado encontrado' : 'Nenhum franqueado cadastrado'}
      </p>
      <p className="text-gray-400">
        {searchTerm 
          ? 'Tente ajustar os filtros de busca' 
          : 'Comece criando seu primeiro franqueado'
        }
      </p>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Franqueados Cadastrados
          </h3>
          {pagination && (
            <span className="text-sm text-gray-500">
              {pagination.total} franqueado{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {franqueados.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Franqueado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Região
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estabelecimentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão
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
                {franqueados.map((franqueado) => (
                  <tr key={franqueado.id} className="hover:bg-gray-50 transition-colors">
                    {/* Franqueado Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(franqueado.name)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {highlightText(franqueado.name, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FiMail className="w-3 h-3 mr-1" />
                            {highlightText(franqueado.email, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiPhone className="w-3 h-3 mr-1" />
                            {maskPhone(franqueado.phone)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Região */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {highlightText(franqueado.region, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[150px]">
                            {franqueado.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Estabelecimentos */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {franqueado._count?.estabelecimentos || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        unidades
                      </div>
                    </td>

                    {/* Comissão */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {franqueado.comissionRate.toFixed(1)}%
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={franqueado.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <ActionButton
                          onClick={() => onView(franqueado)}
                          icon={<FiEye className="w-4 h-4" />}
                          title="Visualizar"
                          color="blue"
                        />
                        <ActionButton
                          onClick={() => onEdit(franqueado)}
                          icon={<FiEdit2 className="w-4 h-4" />}
                          title="Editar"
                          color="green"
                        />
                        <ActionButton
                          onClick={() => handleDelete(franqueado)}
                          icon={<FiTrash2 className="w-4 h-4" />}
                          title="Excluir"
                          color="red"
                          disabled={deletingId === franqueado.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && onPageChange && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>{' '}
                  até{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  resultados
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FiChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  
                  <div className="flex space-x-1">
                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1
                      const isCurrentPage = page === pagination.page
                      
                      // Show first, last, current, and pages around current
                      const showPage = page === 1 || 
                                      page === pagination.pages || 
                                      Math.abs(page - pagination.page) <= 1
                      
                      if (!showPage) {
                        // Show ellipsis
                        if (page === 2 && pagination.page > 4) {
                          return <span key={page} className="px-2 text-gray-500">...</span>
                        }
                        if (page === pagination.pages - 1 && pagination.page < pagination.pages - 3) {
                          return <span key={page} className="px-2 text-gray-500">...</span>
                        }
                        return null
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            isCurrentPage
                              ? 'bg-blue-600 text-white border border-blue-600'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Próximo
                    <FiChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
