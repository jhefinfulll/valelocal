'use client';

import React, { useState, useEffect } from 'react';

interface ConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  configuracao?: any;
  mode: 'create' | 'edit' | 'view';
  loading?: boolean;
}

const categorias = {
  SISTEMA: {
    label: 'Sistema',
    description: 'Configurações gerais do sistema',
    configs: [
      { chave: 'app_name', label: 'Nome da Aplicação', tipo: 'TEXTO' },
      { chave: 'maintenance_mode', label: 'Modo Manutenção', tipo: 'BOOLEAN' },
      { chave: 'max_login_attempts', label: 'Máximo Tentativas Login', tipo: 'NUMERO' }
    ]
  },
  TRANSACOES: {
    label: 'Transações',
    description: 'Configurações de transações',
    configs: [
      { chave: 'max_transaction_value', label: 'Valor Máximo Transação', tipo: 'NUMERO' },
      { chave: 'transaction_timeout', label: 'Timeout Transação (seg)', tipo: 'NUMERO' },
      { chave: 'auto_approve_limit', label: 'Limite Auto-Aprovação', tipo: 'NUMERO' }
    ]
  },
  COMISSOES: {
    label: 'Comissões',
    description: 'Configurações de comissões',
    configs: [
      { chave: 'default_commission_rate', label: 'Taxa Padrão (%)', tipo: 'NUMERO' },
      { chave: 'commission_payment_day', label: 'Dia Pagamento', tipo: 'NUMERO' },
      { chave: 'commission_calculation_rules', label: 'Regras de Cálculo', tipo: 'JSON' }
    ]
  },
  NOTIFICACOES: {
    label: 'Notificações',
    description: 'Configurações de notificações',
    configs: [
      { chave: 'email_enabled', label: 'Email Habilitado', tipo: 'BOOLEAN' },
      { chave: 'sms_enabled', label: 'SMS Habilitado', tipo: 'BOOLEAN' },
      { chave: 'notification_templates', label: 'Templates de Notificação', tipo: 'JSON' }
    ]
  },
  SEGURANCA: {
    label: 'Segurança',
    description: 'Configurações de segurança',
    configs: [
      { chave: 'session_timeout', label: 'Timeout Sessão (min)', tipo: 'NUMERO' },
      { chave: 'password_min_length', label: 'Tamanho Mín. Senha', tipo: 'NUMERO' },
      { chave: 'two_factor_enabled', label: '2FA Habilitado', tipo: 'BOOLEAN' }
    ]
  }
};

export function ConfiguracoesModal({
  isOpen,
  onClose,
  onSubmit,
  configuracao,
  mode = 'create',
  loading = false
}: ConfiguracoesModalProps) {
  const [formData, setFormData] = useState({
    chave: '',
    valor: '',
    descricao: '',
    tipo: 'TEXTO',
    categoria: 'SISTEMA'
  });
  
  const [selectedCategory, setSelectedCategory] = useState('SISTEMA');
  const [jsonError, setJsonError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (configuracao) {
        const categoria = Object.keys(categorias).find(cat => 
          categorias[cat as keyof typeof categorias].configs.some(
            config => config.chave === configuracao.chave
          )
        ) || 'SISTEMA';
        
        setFormData({
          chave: configuracao.chave || '',
          valor: configuracao.valor || '',
          descricao: configuracao.descricao || '',
          tipo: configuracao.tipo || 'TEXTO',
          categoria
        });
        setSelectedCategory(categoria);
      } else {
        setFormData({
          chave: '',
          valor: '',
          descricao: '',
          tipo: 'TEXTO',
          categoria: 'SISTEMA'
        });
        setSelectedCategory('SISTEMA');
      }
    }
  }, [isOpen, configuracao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar JSON se necessário
    if (formData.tipo === 'JSON' && formData.valor) {
      try {
        JSON.parse(formData.valor);
        setJsonError('');
      } catch (error) {
        setJsonError('JSON inválido');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await onSubmit(formData);
      
      if (success) {
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'categoria') {
      setSelectedCategory(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro de JSON ao editar
    if (name === 'valor' && formData.tipo === 'JSON') {
      setJsonError('');
    }
  };

  const handleQuickSelect = (chave: string, tipo: string, descricao: string) => {
    setFormData(prev => ({
      ...prev,
      chave,
      tipo,
      descricao: descricao || `Configuração: ${chave}`
    }));
  };

  const resetForm = () => {
    setFormData({
      chave: '',
      valor: '',
      descricao: '',
      tipo: 'TEXTO',
      categoria: 'SISTEMA'
    });
    setSelectedCategory('SISTEMA');
    setJsonError('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const renderValueInput = () => {
    switch (formData.tipo) {
      case 'BOOLEAN':
        return (
          <select
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
          >
            <option value="">Selecione...</option>
            <option value="true">Verdadeiro</option>
            <option value="false">Falso</option>
          </select>
        );
      
      case 'NUMERO':
        return (
          <input
            type="number"
            step="0.01"
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Digite o valor numérico"
            required
          />
        );
      
      case 'JSON':
        return (
          <div>
            <textarea
              name="valor"
              value={formData.valor}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder='{"chave": "valor", "outra_chave": 123}'
              required
            />
            {jsonError && (
              <p className="mt-1 text-sm text-red-600">{jsonError}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              Formato JSON válido é obrigatório
            </p>
          </div>
        );
      
      default: // TEXTO
        return (
          <input
            type="text"
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Digite o valor"
            required
          />
        );
    }
  };

  const isReadonly = mode === 'view';
  const isCreating = mode === 'create';
  
  const modalTitle = {
    create: 'Nova Configuração',
    edit: 'Editar Configuração',
    view: 'Visualizar Configuração'
  }[mode];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <div className="flex">
          {/* Sidebar com Categorias */}
          {isCreating && (
            <div className="w-1/3 bg-gray-50 p-6 border-r">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categorias</h3>
              <div className="space-y-2">
                {Object.entries(categorias).map(([key, categoria]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(key);
                      setFormData(prev => ({ ...prev, categoria: key }));
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{categoria.label}</div>
                    <div className="text-sm text-gray-600">{categoria.description}</div>
                  </button>
                ))}
              </div>

              {/* Configurações Sugeridas */}
              {selectedCategory && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Configurações Sugeridas</h4>
                  <div className="space-y-1">
                    {categorias[selectedCategory as keyof typeof categorias].configs.map((config) => (
                      <button
                        key={config.chave}
                        type="button"
                        onClick={() => handleQuickSelect(config.chave, config.tipo, config.label)}
                        className="w-full text-left p-2 text-sm rounded hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-800">{config.label}</div>
                        <div className="text-gray-600">{config.chave}</div>
                        <div className="text-xs text-blue-600">{config.tipo}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulário */}
          <div className={`${isCreating ? 'w-2/3' : 'w-full'} p-6`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoria e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    disabled={isReadonly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  >
                    {Object.entries(categorias).map(([key, categoria]) => (
                      <option key={key} value={key}>{categoria.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    disabled={isReadonly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  >
                    <option value="TEXTO">Texto</option>
                    <option value="NUMERO">Número</option>
                    <option value="BOOLEAN">Boolean</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>
              </div>

              {/* Chave */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave da Configuração *
                </label>
                <input
                  type="text"
                  name="chave"
                  value={formData.chave}
                  onChange={handleInputChange}
                  disabled={isReadonly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="ex: max_transaction_value"
                  required
                />
                <p className="mt-1 text-sm text-gray-600">
                  Use snake_case (ex: max_transaction_value)
                </p>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                {renderValueInput()}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  disabled={isReadonly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Descrição da configuração..."
                />
              </div>

              {/* Preview do Valor */}
              {formData.valor && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Preview do Valor</h4>
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <span className="ml-2">{formData.tipo}</span>
                      </div>
                      <div>
                        <span className="font-medium">Valor Atual:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                          {formData.tipo === 'JSON' ? (
                            <pre className="text-xs">{JSON.stringify(JSON.parse(formData.valor || '{}'), null, 2)}</pre>
                          ) : (
                            formData.valor
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações da Configuração Existente */}
              {configuracao && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Informações da Configuração</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID:</span>
                      <span className="ml-2">{configuracao.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Chave:</span>
                      <span className="ml-2 font-mono">{configuracao.chave}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <span className="ml-2">{configuracao.tipo}</span>
                    </div>
                    {configuracao.updatedAt && (
                      <div>
                        <span className="font-medium">Atualizada em:</span>
                        <span className="ml-2">
                          {new Date(configuracao.updatedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exemplos por Tipo */}
              {isCreating && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Exemplos de Valores</h4>
                  <div className="text-sm text-blue-600 space-y-2">
                    <div>
                      <span className="font-medium">TEXTO:</span>
                      <span className="ml-2">"Sistema Vale Local", "admin@example.com"</span>
                    </div>
                    <div>
                      <span className="font-medium">NUMERO:</span>
                      <span className="ml-2">1000, 5.5, 30</span>
                    </div>
                    <div>
                      <span className="font-medium">BOOLEAN:</span>
                      <span className="ml-2">true, false</span>
                    </div>
                    <div>
                      <span className="font-medium">JSON:</span>
                      <span className="ml-2 font-mono">{"{"}"rates": [3, 5, 7], "enabled": true{"}"}</span>
                    </div>
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
                    disabled={loading || isSubmitting || !!jsonError}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isCreating ? 'Criar Configuração' : 'Salvar Alterações'}
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
      </div>
    </div>
  );
}
