'use client';

import React, { useState, useEffect } from 'react';

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  transacao?: any;
  mode: 'create' | 'edit' | 'view';
  loading?: boolean;
}

export function TransacaoModal({
  isOpen,
  onClose,
  onSubmit,
  transacao,
  mode = 'create',
  loading = false
}: TransacaoModalProps) {
  const [formData, setFormData] = useState({
    cartaoId: '',
    estabelecimentoId: '',
    tipo: 'RECARGA',
    valor: 0,
    descricao: '',
    numeroTransacao: '',
    autorizacao: '',
    observacoes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (transacao) {
        setFormData({
          cartaoId: transacao.cartaoId || '',
          estabelecimentoId: transacao.estabelecimentoId || '',
          tipo: transacao.tipo || 'RECARGA',
          valor: transacao.valor || 0,
          descricao: '',
          numeroTransacao: transacao.id || '',
          autorizacao: '',
          observacoes: ''
        });
      } else {
        setFormData({
          cartaoId: '',
          estabelecimentoId: '',
          tipo: 'RECARGA',
          valor: 0,
          descricao: '',
          numeroTransacao: `TXN${Date.now()}`,
          autorizacao: '',
          observacoes: ''
        });
      }
    }
  }, [isOpen, transacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const success = await onSubmit({
        ...formData,
        dataTransacao: new Date().toISOString()
      });
      
      if (success) {
        onClose();
        setFormData({
          cartaoId: '',
          estabelecimentoId: '',
          tipo: 'RECARGA',
          valor: 0,
          descricao: '',
          numeroTransacao: '',
          autorizacao: '',
          observacoes: ''
        });
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCancel = () => {
    setFormData({
      cartaoId: '',
      estabelecimentoId: '',
      tipo: 'RECARGA',
      valor: 0,
      descricao: '',
      numeroTransacao: '',
      autorizacao: '',
      observacoes: ''
    });
    onClose();
  };

  const isReadonly = mode === 'view';
  const isCreating = mode === 'create';
  
  const modalTitle = {
    create: 'Nova Transação',
    edit: 'Editar Transação',
    view: 'Visualizar Transação'
  }[mode];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading || isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Transação e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transação *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              >
                <option value="RECARGA">Recarga</option>
                <option value="UTILIZACAO">Utilização</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Cartão e Estabelecimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Cartão *
              </label>
              <input
                type="text"
                name="cartaoId"
                value={formData.cartaoId}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="ID do cartão"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Estabelecimento *
              </label>
              <input
                type="text"
                name="estabelecimentoId"
                value={formData.estabelecimentoId}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="ID do estabelecimento"
                required
              />
            </div>
          </div>

          {/* Número da Transação e Autorização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Transação *
              </label>
              <input
                type="text"
                name="numeroTransacao"
                value={formData.numeroTransacao}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Número único da transação"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Autorização
              </label>
              <input
                type="text"
                name="autorizacao"
                value={formData.autorizacao}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Código de autorização"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Descrição da transação"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              disabled={isReadonly}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Informações adicionais para visualização/edição */}
          {transacao && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Informações da Transação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    transacao.status === 'concluida' ? 'bg-green-100 text-green-800' :
                    transacao.status === 'cancelada' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transacao.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">ID:</span>
                  <span className="ml-2">{transacao.id}</span>
                </div>
                {transacao.createdAt && (
                  <div>
                    <span className="font-medium">Criada em:</span>
                    <span className="ml-2">
                      {new Date(transacao.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
                {transacao.updatedAt && (
                  <div>
                    <span className="font-medium">Atualizada em:</span>
                    <span className="ml-2">
                      {new Date(transacao.updatedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          {!isReadonly && (
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCreating ? 'Criar Transação' : 'Salvar Alterações'}
              </button>
            </div>
          )}

          {isReadonly && (
            <div className="flex justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
