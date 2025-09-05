import React from 'react'
import { FiEdit, FiEye, FiTrash2, FiCheckCircle, FiClock, FiHome, FiLock, FiCreditCard, FiX } from 'react-icons/fi'
import { EstabelecimentoData, estabelecimentosService } from '@/services/estabelecimentosService'
import { maskCNPJ, maskPhone, formatDate } from '@/utils/masks'

interface EstabelecimentosTableProps {
  data: EstabelecimentoData[]
  loading: boolean
  onEdit: (item: EstabelecimentoData) => void
  onDelete: (item: EstabelecimentoData) => void
  onView: (item: EstabelecimentoData) => void
  onApprove?: (id: string) => void
  onManagePassword?: (item: EstabelecimentoData) => void
  onManagePayment?: (item: EstabelecimentoData) => void
  userType?: string
}

const TableSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Nome', 'CNPJ', 'Franqueado', 'Categoria', 'Status', 'Ações'].map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const EmptyTableState: React.FC = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="text-center py-12">
      <FiHome className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum estabelecimento encontrado</h3>
      <p className="text-sm text-gray-500">Comece criando um novo estabelecimento.</p>
    </div>
  </div>
)

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorClass = estabelecimentosService.getStatusColor(status)
  const text = estabelecimentosService.getStatusText(status)
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status === 'ATIVO' && <FiCheckCircle className="w-3 h-3 mr-1" />}
      {status === 'PENDENTE_PAGAMENTO' && <FiClock className="w-3 h-3 mr-1" />}
      {text}
    </span>
  )
}

const ActionButton: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  tooltip: string
  color?: string
}> = ({ onClick, icon, tooltip, color = 'text-gray-400 hover:text-gray-600' }) => (
  <button
    onClick={onClick}
    className={`${color} transition-colors duration-200`}
    title={tooltip}
  >
    {icon}
  </button>
)

export const EstabelecimentosTable: React.FC<EstabelecimentosTableProps> = ({ 
  data, loading, onEdit, onDelete, onView, onApprove, onManagePassword, onManagePayment, userType 
}) => {
  if (loading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return <EmptyTableState />
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franqueado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((estabelecimento) => (
              <tr key={estabelecimento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {estabelecimento.logo ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={estabelecimento.logo} 
                          alt={estabelecimento.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${estabelecimento.logo ? 'hidden' : ''}`}>
                        <FiHome className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {estabelecimento.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {estabelecimento.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {maskCNPJ(estabelecimento.cnpj)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{estabelecimento.franqueados?.name || 'N/A'}</div>
                    <div className="text-gray-500">{estabelecimento.franqueados?.region || ''}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {estabelecimento.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={estabelecimento.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(estabelecimento.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <ActionButton
                      onClick={() => onView(estabelecimento)}
                      icon={<FiEye className="h-4 w-4" />}
                      tooltip="Visualizar"
                      color="text-blue-400 hover:text-blue-600"
                    />
                    
                    <ActionButton
                      onClick={() => onEdit(estabelecimento)}
                      icon={<FiEdit className="h-4 w-4" />}
                      tooltip="Editar"
                      color="text-green-400 hover:text-green-600"
                    />

                    {onManagePassword && (
                      <ActionButton
                        onClick={() => onManagePassword(estabelecimento)}
                        icon={<FiLock className="h-4 w-4" />}
                        tooltip="Gerenciar Senha"
                        color="text-purple-400 hover:text-purple-600"
                      />
                    )}

                    {onManagePayment && estabelecimento.status === 'PENDENTE_PAGAMENTO' && (
                      <ActionButton
                        onClick={() => onManagePayment(estabelecimento)}
                        icon={<FiCreditCard className="h-4 w-4" />}
                        tooltip="Gerenciar Pagamento"
                        color="text-orange-400 hover:text-orange-600"
                      />
                    )}
                    
                    {onApprove && (estabelecimento.status === 'PENDENTE_PAGAMENTO' || estabelecimento.status === 'ATIVO') && (
                      <ActionButton
                        onClick={() => onApprove(estabelecimento.id)}
                        icon={estabelecimento.status === 'PENDENTE_PAGAMENTO' ? 
                          <FiCheckCircle className="h-4 w-4" /> : 
                          <FiX className="h-4 w-4" />
                        }
                        tooltip={estabelecimento.status === 'PENDENTE_PAGAMENTO' ? "Aprovar" : "Desaprovar"}
                        color={estabelecimento.status === 'PENDENTE_PAGAMENTO' ? "text-green-400 hover:text-green-600" : "text-red-400 hover:text-red-600"}
                      />
                    )}
                    
                    {(userType === 'FRANQUEADORA' || (userType === 'FRANQUEADO' && estabelecimento.status === 'PENDENTE_PAGAMENTO')) && (
                      <ActionButton
                        onClick={() => onDelete(estabelecimento)}
                        icon={<FiTrash2 className="h-4 w-4" />}
                        tooltip="Excluir"
                        color="text-red-400 hover:text-red-600"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
