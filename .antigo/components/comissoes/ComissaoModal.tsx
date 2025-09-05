'use client';

import React, { useState, useEffect } from 'react';

interface ComissaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  comissao?: any;
  mode: 'create' | 'edit' | 'view';
  loading?: boolean;
}

export function ComissaoModal({
  isOpen,
  onClose,
  onSubmit,
  comissao,
  mode = 'create',
  loading = false
}: ComissaoModalProps) {
  const [formData, setFormData] = useState({
    franqueadoId: '',
    periodo: '',
    tipo: 'PERCENTUAL',
    percentual: 0,
    valorFixo: 0,
    observacoes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (comissao) {
        setFormData({
          franqueadoId: comissao.franqueadoId || '',
          periodo: comissao.periodo || '',
          tipo: comissao.tipo || 'PERCENTUAL',
          percentual: comissao.percentual || 0,
          valorFixo: comissao.valorFixo || 0,
          observacoes: comissao.observacoes || ''
        });
      } else {
        // Gerar período atual (YYYY-MM)
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        setFormData({
          franqueadoId: '',
          periodo: currentPeriod,
          tipo: 'PERCENTUAL',
          percentual: 5.0, // 5% padrão
          valorFixo: 0,
          observacoes: ''
        });
      }
    }
  }, [isOpen, comissao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const success = await onSubmit(formData);
      
      if (success) {
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar comissão:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['percentual', 'valorFixo'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const resetForm = () => {
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    setFormData({
      franqueadoId: '',
      periodo: currentPeriod,
      tipo: 'PERCENTUAL',
      percentual: 5.0,
      valorFixo: 0,
      observacoes: ''
    });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Cálculo automático de comissão simulado
  const calcularComissaoEstimada = () => {
    // Simulação de cálculo baseado no tipo
    if (formData.tipo === 'PERCENTUAL' && formData.percentual > 0) {
      // Simula um volume de transações de R$ 10.000
      const volumeSimulado = 10000;
      return (volumeSimulado * formData.percentual) / 100;
    } else if (formData.tipo === 'VALOR_FIXO') {
      return formData.valorFixo;
    }
    return 0;
  };

  const isReadonly = mode === 'view';
  const isCreating = mode === 'create';
  
  const modalTitle = {
    create: 'Nova Comissão',
    edit: 'Editar Comissão',
    view: 'Visualizar Comissão'
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
          {/* Franqueado e Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Franqueado *
              </label>
              <input
                type="text"
                name="franqueadoId"
                value={formData.franqueadoId}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="ID do franqueado"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período (YYYY-MM) *
              </label>
              <input
                type="text"
                name="periodo"
                value={formData.periodo}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="2025-01"
                pattern="[0-9]{4}-[0-9]{2}"
                required
              />
            </div>
          </div>

          {/* Tipo de Comissão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Comissão *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="PERCENTUAL">Percentual sobre Volume</option>
              <option value="VALOR_FIXO">Valor Fixo</option>
              <option value="ESCALONADA">Escalonada por Volume</option>
            </select>
          </div>

          {/* Configurações por Tipo */}
          {formData.tipo === 'PERCENTUAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentual (%) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="percentual"
                value={formData.percentual}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="5.00"
                required
              />
              <p className="mt-1 text-sm text-gray-600">
                Percentual aplicado sobre o volume total de transações
              </p>
            </div>
          )}

          {formData.tipo === 'VALOR_FIXO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Fixo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="valorFixo"
                value={formData.valorFixo}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="1000.00"
                required
              />
              <p className="mt-1 text-sm text-gray-600">
                Valor fixo mensal independente do volume
              </p>
            </div>
          )}

          {formData.tipo === 'ESCALONADA' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Comissão Escalonada</h4>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• Até R$ 10.000: 3%</p>
                <p>• R$ 10.001 - R$ 50.000: 5%</p>
                <p>• Acima de R$ 50.000: 7%</p>
              </div>
              <p className="text-xs text-blue-500 mt-2">
                A comissão será calculada automaticamente baseada no volume de transações
              </p>
            </div>
          )}

          {/* Estimativa de Comissão */}
          {!isReadonly && formData.franqueadoId && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">Estimativa de Comissão</h4>
              <div className="text-sm text-green-600">
                <p>Volume estimado: R$ 10.000,00</p>
                <p className="font-medium">
                  Comissão estimada: R$ {calcularComissaoEstimada().toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-green-500 mt-2">
                *Baseado no volume médio de transações
              </p>
            </div>
          )}

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
              placeholder="Observações sobre a comissão..."
            />
          </div>

          {/* Informações adicionais para visualização/edição */}
          {comissao && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Informações da Comissão</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    comissao.status === 'PAGA' ? 'bg-green-100 text-green-800' :
                    comissao.status === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comissao.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Valor Calculado:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    R$ {comissao.valorCalculado?.toFixed(2) || '0,00'}
                  </span>
                </div>
                {comissao.totalTransacoes && (
                  <div>
                    <span className="font-medium">Total de Transações:</span>
                    <span className="ml-2">{comissao.totalTransacoes}</span>
                  </div>
                )}
                {comissao.totalVolume && (
                  <div>
                    <span className="font-medium">Volume Total:</span>
                    <span className="ml-2">R$ {comissao.totalVolume.toFixed(2)}</span>
                  </div>
                )}
                {comissao.dataPagamento && (
                  <div>
                    <span className="font-medium">Data do Pagamento:</span>
                    <span className="ml-2">
                      {new Date(comissao.dataPagamento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {comissao.createdAt && (
                  <div>
                    <span className="font-medium">Criada em:</span>
                    <span className="ml-2">
                      {new Date(comissao.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações especiais para comissões existentes */}
          {comissao && mode === 'edit' && comissao.status === 'CALCULADA' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-700 mb-2">Ações Disponíveis</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  onClick={() => {
                    // Implementar lógica de marcar como paga
                    console.log('Marcar como paga');
                  }}
                >
                  Marcar como Paga
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => {
                    // Implementar lógica de recalcular
                    console.log('Recalcular comissão');
                  }}
                >
                  Recalcular
                </button>
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
                {isCreating ? 'Criar Comissão' : 'Salvar Alterações'}
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
