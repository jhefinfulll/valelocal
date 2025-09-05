import React, { useState } from 'react';
import { Franqueado } from '@/services/franqueadosService';
import { FranqueadoCreateResponse } from '@/types';
import { FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiPercent } from 'react-icons/fi';
import { useMask } from '@/hooks/useMask';
import LoginCredentialsModal from './LoginCredentialsModal';

interface FranqueadoModalProps {
  franqueado: Franqueado | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  onSave?: (data: any) => Promise<FranqueadoCreateResponse | Franqueado>;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export default function FranqueadoModal({ franqueado, isOpen, onClose, mode, onSave, onShowToast }: FranqueadoModalProps) {
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    tempPassword: string;
    message: string;
  } | null>(null);
  const [createdFranqueadoName, setCreatedFranqueadoName] = useState('');

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleSaveWithCredentials = async (data: any) => {
    if (onSave) {
      const result = await onSave(data);
      
      // Se for criação e tiver credenciais de login, mostrar modal
      if (isCreateMode && 'loginInfo' in result && result.loginInfo) {
        setCreatedCredentials(result.loginInfo);
        setCreatedFranqueadoName(data.name);
        setShowCredentialsModal(true);
      }
      
      return result;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isViewMode && 'Detalhes do Franqueado'}
              {isEditMode && 'Editar Franqueado'}
              {isCreateMode && 'Novo Franqueado'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isViewMode && franqueado && (
              <ViewMode franqueado={franqueado} />
            )}
            {(isEditMode || isCreateMode) && (
              <FormMode 
                franqueado={franqueado} 
                isEdit={isEditMode}
                onSave={handleSaveWithCredentials}
                onCancel={onClose}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Credenciais */}
      {showCredentialsModal && createdCredentials && (
        <LoginCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setCreatedCredentials(null);
            setCreatedFranqueadoName('');
            onClose(); // Fechar também o modal principal
          }}
          credentials={createdCredentials}
          franqueadoName={createdFranqueadoName}
        />
      )}
    </>
  );
}

function ViewMode({ franqueado }: { franqueado: Franqueado }) {
  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <p className="mt-1 text-sm text-gray-900">{franqueado.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ</label>
            <p className="mt-1 text-sm text-gray-900">{franqueado.cnpj}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center mt-1">
              <FiMail className="w-4 h-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{franqueado.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <div className="flex items-center mt-1">
              <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{franqueado.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Região</label>
            <div className="flex items-center mt-1">
              <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{franqueado.region}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <p className="mt-1 text-sm text-gray-900">{franqueado.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taxa de Comissão</label>
            <div className="flex items-center mt-1">
              <FiPercent className="w-4 h-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{franqueado.comissionRate}%</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              franqueado.status === 'ativo' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {franqueado.status}
            </span>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {franqueado._count && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{franqueado._count.estabelecimentos}</p>
              <p className="text-sm text-blue-600">Estabelecimentos</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{franqueado._count.cartoes}</p>
              <p className="text-sm text-green-600">Cartões</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{franqueado._count.comissoes}</p>
              <p className="text-sm text-purple-600">Comissões</p>
            </div>
          </div>
        </div>
      )}

      {/* Informações de usuário */}
      {franqueado.users && franqueado.users.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Usuário do Sistema</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{franqueado.users[0].email}</p>
                <p className="text-sm text-blue-600">Tipo: {franqueado.users[0].type}</p>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                franqueado.users[0].status === 'ATIVO'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {franqueado.users[0].status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Informações de data */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>Criado em: {new Date(franqueado.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>Atualizado em: {new Date(franqueado.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormMode({ franqueado, isEdit, onSave, onCancel }: { 
  franqueado: Franqueado | null; 
  isEdit: boolean; 
  onSave?: (data: any) => Promise<any>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: franqueado?.name || '',
    cnpj: franqueado?.cnpj || '',
    email: franqueado?.email || '',
    phone: franqueado?.phone || '',
    address: franqueado?.address || '',
    region: franqueado?.region || '',
    comissionRate: franqueado?.comissionRate || 15,
    status: franqueado?.status || 'ativo',
    franqueadoraId: franqueado?.franqueadoraId || '1' // ID padrão da franqueadora do seed
  });

  const [loading, setLoading] = useState(false);

  // Hooks para máscaras
  const cnpjMask = useMask({
    mask: 'cnpj',
    initialValue: formData.cnpj,
    onChange: (masked, unmasked) => {
      setFormData(prev => ({ ...prev, cnpj: unmasked }));
    }
  });

  const phoneMask = useMask({
    mask: 'phone',
    initialValue: formData.phone,
    onChange: (masked, unmasked) => {
      setFormData(prev => ({ ...prev, phone: unmasked }));
    }
  });

  const percentageMask = useMask({
    mask: 'percentage',
    initialValue: formData.comissionRate.toString(),
    onChange: (masked, unmasked) => {
      const value = parseFloat(unmasked.replace(',', '.')) || 0;
      setFormData(prev => ({ ...prev, comissionRate: value }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (onSave) {
        console.log('Dados sendo enviados:', formData); // Debug
        console.log('CNPJ limpo:', cnpjMask.unmaskedValue); // Debug
        console.log('Telefone limpo:', phoneMask.unmaskedValue); // Debug
        
        // Garantir que os dados estão no formato correto
        const dataToSend = {
          ...formData,
          cnpj: cnpjMask.unmaskedValue || formData.cnpj,
          phone: phoneMask.unmaskedValue || formData.phone
        };
        
        console.log('Dados finais a enviar:', dataToSend); // Debug
        
        await onSave(dataToSend);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Nome do franqueado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
          <input
            {...cnpjMask.inputProps}
            disabled={isEdit}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone *</label>
          <input
            {...phoneMask.inputProps}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Região *</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: São Paulo - SP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Taxa de Comissão *</label>
          <input
            {...percentageMask.inputProps}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="15,00%"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Endereço *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          minLength={10}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Rua, número, bairro, cidade - UF (mín. 10 caracteres)"
        />
        <p className="mt-1 text-xs text-gray-500">
          Informe um endereço completo com pelo menos 10 caracteres
        </p>
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">🎯 Criação Automática de Usuário</h4>
          <p className="text-yellow-700 text-sm">
            Ao criar este franqueado, um usuário será automaticamente criado no sistema com as credenciais de acesso. 
            As informações de login serão enviadas por email e exibidas na tela.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Franqueado + Usuário')}
        </button>
      </div>
    </form>
  );
}
