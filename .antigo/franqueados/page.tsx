'use client';

import { useState } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiMapPin,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useFranqueados } from '@/hooks/useFranqueados';
import { Franqueado } from '@/services/franqueadosService';
import FranqueadoModal from '@/components/franqueados/FranqueadoModal';
import FranqueadoFilters, { FilterState } from '@/components/franqueados/FranqueadoFilters';
import DeleteConfirmationModal from '@/components/franqueados/DeleteConfirmationModal';
import { franqueadoExportService } from '@/services/franqueadoExportService';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function FranqueadosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFranqueado, setSelectedFranqueado] = useState<Franqueado | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    region: '',
    comissionMin: '',
    comissionMax: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Hook para toasts
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Usar dados reais da API
  const { 
    franqueados, 
    loading, 
    error, 
    createFranqueado, 
    updateFranqueado, 
    deleteFranqueado,
    refetch 
  } = useFranqueados();

  // Aplicar filtros
  const applyFilters = (franqueadosList: Franqueado[]) => {
    return franqueadosList.filter(franqueado => {
      // Busca por texto
      const searchMatch = !filters.search || 
        franqueado.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        franqueado.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        franqueado.cnpj.includes(filters.search) ||
        franqueado.region.toLowerCase().includes(filters.search.toLowerCase());

      // Filtro por status
      const statusMatch = !filters.status || franqueado.status === filters.status;

      // Filtro por região
      const regionMatch = !filters.region || franqueado.region === filters.region;

      // Filtro por comissão
      const comissionMin = filters.comissionMin ? parseFloat(filters.comissionMin) : 0;
      const comissionMax = filters.comissionMax ? parseFloat(filters.comissionMax) : 100;
      const comissionMatch = franqueado.comissionRate >= comissionMin && franqueado.comissionRate <= comissionMax;

      return searchMatch && statusMatch && regionMatch && comissionMatch;
    });
  };

  const filteredFranqueados: Franqueado[] = applyFilters((franqueados || []).filter((franqueado: Franqueado) =>
    franqueado.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franqueado.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franqueado.region.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Obter regiões únicas para filtros
  const uniqueRegions = Array.from(new Set((franqueados || []).map(f => f.region)));

  // Handlers para modais
  const handleViewFranqueado = (franqueado: Franqueado) => {
    setSelectedFranqueado(franqueado);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditFranqueado = (franqueado: Franqueado) => {
    setSelectedFranqueado(franqueado);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreateFranqueado = () => {
    setSelectedFranqueado(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleDeleteFranqueado = (franqueado: Franqueado) => {
    setSelectedFranqueado(franqueado);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!selectedFranqueado) return;

    setDeleteLoading(true);
    try {
      await deleteFranqueado(selectedFranqueado.id);
      setShowDeleteConfirmation(false);
      setSelectedFranqueado(null);
      showSuccess(`Franqueado "${selectedFranqueado.name}" excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao deletar franqueado:', error);
      showError('Erro ao excluir franqueado. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveFranqueado = async (data: any) => {
    try {
      if (modalMode === 'create') {
        const result = await createFranqueado(data);
        setShowModal(false);
        setSelectedFranqueado(null);
        showSuccess('Franqueado criado com sucesso!');
        return result;
      } else if (modalMode === 'edit' && selectedFranqueado) {
        const result = await updateFranqueado(selectedFranqueado.id, data);
        setShowModal(false);
        setSelectedFranqueado(null);
        showSuccess('Franqueado atualizado com sucesso!');
        return result;
      }
      throw new Error('Modo inválido ou franqueado não selecionado');
    } catch (error) {
      console.error('Erro ao salvar franqueado:', error);
      const errorMessage = modalMode === 'create' 
        ? 'Erro ao criar franqueado. Tente novamente.'
        : 'Erro ao atualizar franqueado. Tente novamente.';
      showError(errorMessage);
      throw error;
    }
  };

  // Handlers para filtros
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      region: '',
      comissionMin: '',
      comissionMax: ''
    });
  };

  // Handlers para exportação
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = filteredFranqueados;
    
    if (dataToExport.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    
    switch (format) {
      case 'csv':
        franqueadoExportService.exportToCSV(dataToExport, `franqueados_${timestamp}.csv`);
        break;
      case 'excel':
        franqueadoExportService.exportToExcel(dataToExport, `franqueados_${timestamp}.xlsx`);
        break;
      case 'pdf':
        franqueadoExportService.exportToPDF(dataToExport, `franqueados_${timestamp}.pdf`);
        break;
    }
  };

  // TODO: Implementar busca de estabelecimentos por franqueado via API
  const getEstabelecimentosByFranqueado = (franqueadoId: string) => {
    return []; // Por enquanto retorna array vazio - implementar API call
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status.toLowerCase() === 'ativo' 
        ? 'bg-green-100 text-green-600' 
        : 'bg-red-100 text-red-600'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['franqueadora']}>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando franqueados...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute allowedRoles={['franqueadora']}>
        <Layout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar franqueados</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['franqueadora']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestão de Franqueados</h1>
              <p className="text-gray-600">Gerencie todos os franqueados da rede</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <div className="relative">
                <button 
                  onClick={() => handleExport('csv')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Exportar
                </button>
                
                {/* Dropdown de exportação */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCreateFranqueado}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Novo Franqueado
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Franqueados</p>
                  <p className="text-2xl font-bold text-gray-900">{franqueados?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiEye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(franqueados || []).filter(f => f.status === 'ativo').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Regiões</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set((franqueados || []).map(f => f.region)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estabelecimentos</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        {/* Modais */}
        <FranqueadoModal
          franqueado={selectedFranqueado}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedFranqueado(null);
          }}
          mode={modalMode}
          onSave={handleSaveFranqueado}
          onShowToast={(message, type) => {
            if (type === 'success') showSuccess(message);
            else showError(message);
          }}
        />

        <FranqueadoFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          regions={uniqueRegions}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          franqueado={selectedFranqueado}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirmation(false);
            setSelectedFranqueado(null);
          }}
          loading={deleteLoading}
        />
      </div>          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou região..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiFilter className="w-4 h-4 mr-2" />
                  Filtros
                  {Object.values(filters).some(value => value !== '') && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                      Ativos
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Franqueados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Franqueados Cadastrados</h3>
            </div>
            
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
                  {filteredFranqueados.map((franqueado) => {
                    const estabelecimentos = getEstabelecimentosByFranqueado(franqueado.id);
                    
                    return (
                      <tr key={franqueado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {franqueado.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{franqueado.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiMail className="w-3 h-3 mr-1" />
                                {franqueado.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiPhone className="w-3 h-3 mr-1" />
                                {franqueado.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{franqueado.region}</div>
                          <div className="text-sm text-gray-500">{franqueado.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{estabelecimentos.length}</div>
                          <div className="text-sm text-gray-500">estabelecimentos</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{franqueado.comissionRate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={franqueado.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleViewFranqueado(franqueado)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Visualizar"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditFranqueado(franqueado)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFranqueado(franqueado)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Excluir"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Região */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Região</h3>
              <div className="space-y-4">
                {Array.from(new Set((franqueados || []).map(f => f.region))).map((region: string) => {
                  const franqueadosDaRegiao = (franqueados || []).filter(f => f.region === region);
                  // TODO: Implementar busca de estabelecimentos por região via API
                  const estabelecimentosDaRegiao: any[] = []; // Por enquanto vazio
                  
                  return (
                    <div key={region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{region}</p>
                        <p className="text-sm text-gray-500">
                          {franqueadosDaRegiao.length} franqueado(s) • {estabelecimentosDaRegiao.length} estabelecimentos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          Comissão média: {franqueadosDaRegiao.length > 0 ? (franqueadosDaRegiao.reduce((acc, f) => acc + f.comissionRate, 0) / franqueadosDaRegiao.length).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas Gerais</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de Franqueados</span>
                  <span className="font-semibold">{franqueados?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Franqueados Ativos</span>
                  <span className="font-semibold text-green-600">
                    {(franqueados || []).filter(f => f.status === 'ativo').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Ativação</span>
                  <span className="font-semibold">
                    {(franqueados?.length || 0) > 0 ? (((franqueados || []).filter(f => f.status === 'ativo').length / (franqueados?.length || 1)) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comissão Média</span>
                  <span className="font-semibold">
                    {(franqueados?.length || 0) > 0 ? ((franqueados || []).reduce((acc, f) => acc + f.comissionRate, 0) / (franqueados?.length || 1)).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </ProtectedRoute>
  );
}
