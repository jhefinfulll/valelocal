'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transacao, CreateTransacaoData, UpdateTransacaoData } from '@/services/transacoesService';
import { useFranqueados } from '@/hooks/useFranqueados';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';
import { useCartoes } from '@/hooks/useCartoes';

// Schema de validação
const transacaoSchema = z.object({
  cartaoId: z.string().min(1, 'Cartão é obrigatório'),
  estabelecimentoId: z.string().min(1, 'Estabelecimento é obrigatório'),
  franqueadoId: z.string().min(1, 'Franqueado é obrigatório'),
  tipo: z.enum(['RECARGA', 'UTILIZACAO']),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  descricao: z.string().optional(),
  numeroTransacao: z.string().min(1, 'Número da transação é obrigatório'),
  autorizacao: z.string().optional(),
  observacoes: z.string().optional()
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransacaoData | UpdateTransacaoData) => Promise<boolean>;
  transacao?: Transacao;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState<any>(null);
  
  // Hooks para dados relacionados
  const { franqueados, loading: loadingFranqueados } = useFranqueados();
  const { estabelecimentos, loading: loadingEstabelecimentos } = useEstabelecimentos();
  const { cartoes, loading: loadingCartoes } = useCartoes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: transacao ? {
      cartaoId: transacao.cartaoId,
      estabelecimentoId: transacao.estabelecimentoId || '',
      franqueadoId: transacao.cartoes?.franqueados?.id || '',
      tipo: transacao.tipo,
      valor: transacao.valor,
      descricao: '',
      numeroTransacao: transacao.id,
      autorizacao: '',
      observacoes: ''
    } : {}
  });

  const watchCartaoId = watch('cartaoId');
  const watchTipo = watch('tipo');

  // Buscar informações do cartão quando selecionado
  useEffect(() => {
    if (watchCartaoId) {
      const cartao = cartoes.find(c => c.id === watchCartaoId);
      setSelectedCartao(cartao);
      
      if (cartao) {
        setValue('franqueadoId', cartao.franqueadoId);
        if (cartao.estabelecimentoId) {
          setValue('estabelecimentoId', cartao.estabelecimentoId);
        }
      }
    }
  }, [watchCartaoId, cartoes, setValue]);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (transacao) {
        reset({
          cartaoId: transacao.cartaoId,
          estabelecimentoId: transacao.estabelecimentoId,
          franqueadoId: transacao.cartoes?.franqueados?.id || '',
          tipo: transacao.tipo,
          valor: transacao.valor,
          descricao: '',
          numeroTransacao: transacao.id,
          autorizacao: '',
          observacoes: ''
        });
      } else {
        reset({
          tipo: 'RECARGA',
          valor: 0,
          numeroTransacao: `TXN${Date.now()}`
        });
      }
    }
  }, [isOpen, transacao, reset]);

  const handleFormSubmit = async (data: TransacaoFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = mode === 'create' ? {
        ...data,
        dataTransacao: new Date().toISOString()
      } as CreateTransacaoData : data as UpdateTransacaoData;
      
      const success = await onSubmit(formData);
      
      if (success) {
        onClose();
        reset();
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Informações do Cartão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cartão *
              </label>
              <select
                {...register('cartaoId')}
                disabled={isReadonly || loadingCartoes}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecione um cartão</option>
                {cartoes.map(cartao => (
                  <option key={cartao.id} value={cartao.id}>
                    {cartao.codigo} - R$ {cartao.valor}
                  </option>
                ))}
              </select>
              {errors.cartaoId && (
                <p className="mt-1 text-sm text-red-600">{errors.cartaoId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transação *
              </label>
              <select
                {...register('tipo')}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="RECARGA">Recarga</option>
                <option value="UTILIZACAO">Utilização</option>
              </select>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>
          </div>

          {/* Informações do Cartão Selecionado */}
          {selectedCartao && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Informações do Cartão</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Saldo Atual:</span>
                  <span className="ml-2 text-green-600">
                    R$ {selectedCartao.saldo?.toFixed(2) || '0,00'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedCartao.status === 'ATIVO' ? 'bg-green-100 text-green-800' :
                    selectedCartao.status === 'BLOQUEADO' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCartao.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Titular:</span>
                  <span className="ml-2">{selectedCartao.titular}</span>
                </div>
              </div>
            </div>
          )}

          {/* Valor e Número da Transação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('valor', { valueAsNumber: true })}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="0,00"
              />
              {errors.valor && (
                <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Transação *
              </label>
              <input
                type="text"
                {...register('numeroTransacao')}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Número único da transação"
              />
              {errors.numeroTransacao && (
                <p className="mt-1 text-sm text-red-600">{errors.numeroTransacao.message}</p>
              )}
            </div>
          </div>

          {/* Estabelecimento e Franqueado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estabelecimento *
              </label>
              <select
                {...register('estabelecimentoId')}
                disabled={isReadonly || loadingEstabelecimentos}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecione um estabelecimento</option>
                {estabelecimentos.map(estabelecimento => (
                  <option key={estabelecimento.id} value={estabelecimento.id}>
                    {estabelecimento.name} - {estabelecimento.cnpj}
                  </option>
                ))}
              </select>
              {errors.estabelecimentoId && (
                <p className="mt-1 text-sm text-red-600">{errors.estabelecimentoId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Franqueado *
              </label>
              <select
                {...register('franqueadoId')}
                disabled={isReadonly || loadingFranqueados}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecione um franqueado</option>
                {franqueados.map(franqueado => (
                  <option key={franqueado.id} value={franqueado.id}>
                    {franqueado.name} - {franqueado.email}
                  </option>
                ))}
              </select>
              {errors.franqueadoId && (
                <p className="mt-1 text-sm text-red-600">{errors.franqueadoId.message}</p>
              )}
            </div>
          </div>

          {/* Autorização e Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Autorização
              </label>
              <input
                type="text"
                {...register('autorizacao')}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Código de autorização"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                {...register('descricao')}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Descrição da transação"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
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
                    transacao.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                    transacao.status === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transacao.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Data/Hora:</span>
                  <span className="ml-2">
                    {new Date(transacao.createdAt).toLocaleString('pt-BR')}
                  </span>
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

          {/* Validação de Saldo */}
          {watchTipo === 'UTILIZACAO' && selectedCartao && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-700">
                    Saldo disponível: R$ {selectedCartao.saldo?.toFixed(2) || '0,00'}
                  </p>
                  {getValues('valor') > (selectedCartao.saldo || 0) && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Valor da transação excede o saldo disponível
                    </p>
                  )}
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
