import { useState } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

interface FilterState {
  search: string;
  status: string;
  region: string;
  comissionMin: string;
  comissionMax: string;
}

interface FranqueadoFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
  regions: string[];
}

export default function FranqueadoFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  onClearFilters, 
  regions 
}: FranqueadoFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    region: '',
    comissionMin: '',
    comissionMax: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters = {
      search: '',
      status: '',
      region: '',
      comissionMin: '',
      comissionMax: ''
    };
    setFilters(emptyFilters);
    onClearFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FiFilter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros Avançados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nome, CNPJ ou email
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Digite sua busca..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos os status</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          {/* Região */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Região</label>
            <select
              name="region"
              value={filters.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todas as regiões</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Faixa de Comissão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Comissão (%)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  name="comissionMin"
                  value={filters.comissionMin}
                  onChange={handleChange}
                  placeholder="Mín"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="comissionMax"
                  value={filters.comissionMax}
                  onChange={handleChange}
                  placeholder="Máx"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Limpar Filtros
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FilterState };
