'use client';

import React, { useState, useEffect } from 'react';

interface DisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  display?: any;
  mode: 'create' | 'edit' | 'view';
  loading?: boolean;
}

export function DisplayModal({
  isOpen,
  onClose,
  onSubmit,
  display,
  mode = 'create',
  loading = false
}: DisplayModalProps) {
  const [formData, setFormData] = useState({
    franqueadoId: '',
    estabelecimentoId: '',
    tipo: 'BALCAO',
    status: 'DISPONIVEL',
    observacoes: ''
  });
  
  const [diagnostics, setDiagnostics] = useState({
    conexaoInternet: 'pending',
    statusHardware: 'pending',
    versaoSoftware: 'pending',
    ultimoHeartbeat: null as Date | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (display) {
        setFormData({
          franqueadoId: display.franqueadoId || '',
          estabelecimentoId: display.estabelecimentoId || '',
          tipo: display.tipo || 'BALCAO',
          status: display.status || 'DISPONIVEL',
          observacoes: display.observacoes || ''
        });
        
        // Iniciar diagnósticos se for visualização ou edição
        if (mode !== 'create') {
          runDiagnostics();
        }
      } else {
        setFormData({
          franqueadoId: '',
          estabelecimentoId: '',
          tipo: 'BALCAO',
          status: 'DISPONIVEL',
          observacoes: ''
        });
      }
    }
  }, [isOpen, display, mode]);

  // Simular diagnósticos do display
  const runDiagnostics = async () => {
    setDiagnostics({
      conexaoInternet: 'pending',
      statusHardware: 'pending',
      versaoSoftware: 'pending',
      ultimoHeartbeat: null
    });
    
    setShowDiagnostics(true);
    
    // Simular testes com delay
    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, conexaoInternet: 'success' }));
    }, 1000);
    
    setTimeout(() => {
      setDiagnostics(prev => ({ ...prev, statusHardware: 'success' }));
    }, 2000);
    
    setTimeout(() => {
      setDiagnostics(prev => ({ 
        ...prev, 
        versaoSoftware: 'success',
        ultimoHeartbeat: new Date()
      }));
    }, 3000);
  };

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
      console.error('Erro ao salvar display:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      franqueadoId: '',
      estabelecimentoId: '',
      tipo: 'BALCAO',
      status: 'DISPONIVEL',
      observacoes: ''
    });
    setDiagnostics({
      conexaoInternet: 'pending',
      statusHardware: 'pending',
      versaoSoftware: 'pending',
      ultimoHeartbeat: null as Date | null
    });
    setShowDiagnostics(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getDiagnosticIcon = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'pending':
      default:
        return (
          <svg className="w-5 h-5 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  const isReadonly = mode === 'view';
  const isCreating = mode === 'create';
  
  const modalTitle = {
    create: 'Novo Display',
    edit: 'Editar Display',
    view: 'Visualizar Display'
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
          {/* Franqueado e Estabelecimento */}
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
                ID do Estabelecimento
              </label>
              <input
                type="text"
                name="estabelecimentoId"
                value={formData.estabelecimentoId}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="ID do estabelecimento (opcional)"
              />
              <p className="mt-1 text-sm text-gray-600">
                Deixe vazio se ainda não foi instalado
              </p>
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo do Display *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              >
                <option value="BALCAO">Balcão</option>
                <option value="PAREDE">Parede</option>
                <option value="MESA">Mesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="INSTALADO">Instalado</option>
                <option value="MANUTENCAO">Manutenção</option>
              </select>
            </div>
          </div>

          {/* Informações do Tipo de Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Características do Display</h4>
            <div className="text-sm text-blue-600">
              {formData.tipo === 'BALCAO' && (
                <div>
                  <p>• Tamanho: 10" - 15" polegadas</p>
                  <p>• Posição: Sobre o balcão, frente ao cliente</p>
                  <p>• Conectividade: Wi-Fi + Ethernet</p>
                  <p>• Alimentação: 12V DC</p>
                </div>
              )}
              {formData.tipo === 'PAREDE' && (
                <div>
                  <p>• Tamanho: 21" - 32" polegadas</p>
                  <p>• Posição: Fixado na parede, visível ao público</p>
                  <p>• Conectividade: Wi-Fi + Ethernet</p>
                  <p>• Alimentação: 110/220V AC</p>
                </div>
              )}
              {formData.tipo === 'MESA' && (
                <div>
                  <p>• Tamanho: 7" - 10" polegadas</p>
                  <p>• Posição: Sobre mesa, uso individual</p>
                  <p>• Conectividade: Wi-Fi apenas</p>
                  <p>• Alimentação: Bateria + USB-C</p>
                </div>
              )}
            </div>
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
              placeholder="Observações sobre o display..."
            />
          </div>

          {/* Informações do Display Existente */}
          {display && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Informações do Display</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span>
                  <span className="ml-2">{display.id}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    display.status === 'INSTALADO' ? 'bg-green-100 text-green-800' :
                    display.status === 'MANUTENCAO' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {display.status}
                  </span>
                </div>
                {display.dataInstalacao && (
                  <div>
                    <span className="font-medium">Data de Instalação:</span>
                    <span className="ml-2">
                      {new Date(display.dataInstalacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {display.createdAt && (
                  <div>
                    <span className="font-medium">Criado em:</span>
                    <span className="ml-2">
                      {new Date(display.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de Diagnósticos */}
          {display && mode !== 'create' && (
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Diagnósticos</h4>
              <button
                type="button"
                onClick={runDiagnostics}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Executar Diagnósticos
              </button>
            </div>
          )}

          {/* Resultados dos Diagnósticos */}
          {showDiagnostics && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Resultados dos Diagnósticos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conexão com Internet</span>
                  <div className="flex items-center">
                    {getDiagnosticIcon(diagnostics.conexaoInternet)}
                    <span className="ml-2 text-sm">
                      {diagnostics.conexaoInternet === 'success' ? 'OK' : 
                       diagnostics.conexaoInternet === 'error' ? 'Falha' : 'Testando...'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status do Hardware</span>
                  <div className="flex items-center">
                    {getDiagnosticIcon(diagnostics.statusHardware)}
                    <span className="ml-2 text-sm">
                      {diagnostics.statusHardware === 'success' ? 'OK' : 
                       diagnostics.statusHardware === 'error' ? 'Falha' : 'Testando...'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Versão do Software</span>
                  <div className="flex items-center">
                    {getDiagnosticIcon(diagnostics.versaoSoftware)}
                    <span className="ml-2 text-sm">
                      {diagnostics.versaoSoftware === 'success' ? 'v2.1.4' : 
                       diagnostics.versaoSoftware === 'error' ? 'Erro' : 'Verificando...'}
                    </span>
                  </div>
                </div>
                
                {diagnostics.ultimoHeartbeat && (
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Último Heartbeat</span>
                    <span className="text-sm text-green-600">
                      {diagnostics.ultimoHeartbeat?.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações Especiais para Displays Instalados */}
          {display && display.status === 'INSTALADO' && mode === 'edit' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-700 mb-2">Ações do Display</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  onClick={() => console.log('Reiniciar display')}
                >
                  Reiniciar
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => console.log('Atualizar software')}
                >
                  Atualizar Software
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  onClick={() => console.log('Modo manutenção')}
                >
                  Modo Manutenção
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  onClick={() => console.log('Desinstalar')}
                >
                  Desinstalar
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
                {isCreating ? 'Criar Display' : 'Salvar Alterações'}
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
