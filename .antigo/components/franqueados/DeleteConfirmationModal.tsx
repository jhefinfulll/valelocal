import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { Franqueado } from '@/services/franqueadosService';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  franqueado: Franqueado | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  franqueado, 
  onConfirm, 
  onCancel, 
  loading = false 
}: DeleteConfirmationModalProps) {
  if (!isOpen || !franqueado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja excluir o franqueado?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gray-900">{franqueado.name}</p>
              <p className="text-sm text-gray-600">{franqueado.cnpj}</p>
              <p className="text-sm text-gray-600">{franqueado.email}</p>
              {franqueado._count && (
                <div className="mt-2 text-xs text-gray-500">
                  {franqueado._count.estabelecimentos} estabelecimentos • {franqueado._count.cartoes} cartões
                </div>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Atenção: Esta ação não pode ser desfeita
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Todos os dados do franqueado serão removidos</li>
                    <li>• Estabelecimentos vinculados podem ser afetados</li>
                    <li>• Histórico de comissões será mantido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
