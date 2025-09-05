'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FiMail, FiPhone, FiMapPin, FiDollarSign, FiHome, FiUser, FiFileText, FiEye, FiEyeOff } from 'react-icons/fi'
import { maskCNPJ, maskPhone, validateCNPJ, validateEmail, validatePhone, formatDate, cnpjToDatabase, phoneToDatabase } from '@/utils/masks'
import type { FranqueadoData } from '@/services/franqueadosService'

interface FormData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  region: string
  comissionRate: number
  status: 'ATIVO' | 'INATIVO'
  password?: string
}

interface FormErrors {
  [key: string]: string
}

interface FranqueadoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  franqueado: FranqueadoData | null
  mode: 'view' | 'edit' | 'create'
  loading: boolean
}

export function FranqueadoModal({
  isOpen,
  onClose,
  onSave,
  franqueado,
  mode,
  loading
}: FranqueadoModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    comissionRate: 0,
    status: 'ATIVO',
    password: ''
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (franqueado && (mode === 'edit' || mode === 'view')) {
        setFormData({
          name: franqueado.name || '',
          cnpj: maskCNPJ(franqueado.cnpj || ''),
          email: franqueado.email || '',
          phone: maskPhone(franqueado.phone || ''),
          address: franqueado.address || '',
          region: franqueado.region || '',
          comissionRate: franqueado.comissionRate || 0,
          status: franqueado.status || 'ATIVO',
          password: ''
        })
      } else {
        setFormData({
          name: '',
          cnpj: '',
          email: '',
          phone: '',
          address: '',
          region: '',
          comissionRate: 0,
          status: 'ATIVO',
          password: ''
        })
      }
      setFormErrors({})
    }
  }, [isOpen, franqueado, mode])

  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) errors.name = 'Nome é obrigatório'
    
    if (!formData.cnpj.trim()) {
      errors.cnpj = 'CNPJ é obrigatório'
    } else if (!validateCNPJ(cnpjToDatabase(formData.cnpj))) {
      errors.cnpj = 'CNPJ inválido. Verifique os dígitos verificadores.'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email inválido'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório'
    } else if (!validatePhone(phoneToDatabase(formData.phone))) {
      errors.phone = 'Telefone inválido'
    }
    
    if (!formData.address.trim()) errors.address = 'Endereço é obrigatório'
    if (!formData.region.trim()) errors.region = 'Região é obrigatória'
    if (formData.comissionRate < 0 || formData.comissionRate > 100) {
      errors.comissionRate = 'Taxa de comissão deve estar entre 0 e 100'
    }

    if (mode === 'create' && !formData.password?.trim()) {
      errors.password = 'Senha é obrigatória para novos franqueados'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const dataToSave = {
        ...formData,
        cnpj: cnpjToDatabase(formData.cnpj),
        phone: phoneToDatabase(formData.phone)
      }
      
      // Para edição, não enviar senha se estiver vazia
      if (mode === 'edit' && (!formData.password || formData.password.trim() === '')) {
        delete dataToSave.password
      }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar franqueado:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Franqueado'
      case 'edit': return 'Editar Franqueado'
      case 'view': return 'Detalhes do Franqueado'
      default: return 'Franqueado'
    }
  }

  if (mode === 'view' && franqueado) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title=""
        size="lg"
      >
        <div className="p-6">
          {/* Cartão do Franqueado */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl mb-6">
            {/* Logo/Ícone do Sistema */}
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
            
            {/* Header do Cartão */}
            <div className="mb-6">
              <h3 className="text-sm font-medium opacity-90 mb-1">VALE CARTÃO - FRANQUEADO</h3>
              <h2 className="text-2xl font-bold">{franqueado.name}</h2>
            </div>
            
            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm opacity-75 mb-1">CNPJ</p>
                <p className="font-mono text-lg">{maskCNPJ(franqueado.cnpj)}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">REGIÃO</p>
                <p className="font-semibold text-lg">{franqueado.region}</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  franqueado.status === 'ATIVO' 
                    ? 'bg-green-400 text-green-900' 
                    : 'bg-red-400 text-red-900'
                }`}>
                  {franqueado.status}
                </span>
                <span className="text-sm opacity-90">
                  Comissão: {franqueado.comissionRate}%
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Membro desde</p>
                <p className="text-sm font-medium">{new Date(franqueado.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiPhone className="w-5 h-5 mr-2 text-blue-600" />
              Informações de Contato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{franqueado.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{maskPhone(franqueado.phone)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:col-span-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="font-medium text-gray-900">{franqueado.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          {franqueado._count && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiDollarSign className="w-5 h-5 mr-2 text-green-600" />
                Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-t from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiHome className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{franqueado._count.estabelecimentos}</div>
                  <div className="text-sm text-blue-600 font-medium">Estabelecimentos</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-t from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{franqueado._count.cartoes || 0}</div>
                  <div className="text-sm text-green-600 font-medium">Cartões Ativos</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-t from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{franqueado._count.comissoes || 0}</div>
                  <div className="text-sm text-purple-600 font-medium">Comissões</div>
                </div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Criado em:</span>
                <p className="font-medium text-gray-900">{formatDate(franqueado.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Última atualização:</span>
                <p className="font-medium text-gray-900">{formatDate(franqueado.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Nome e CNPJ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline w-4 h-4 mr-1" />
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do franqueado"
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFileText className="inline w-4 h-4 mr-1" />
              CNPJ *
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', maskCNPJ(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.cnpj ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            {formErrors.cnpj && <p className="text-red-500 text-xs mt-1">{formErrors.cnpj}</p>}
          </div>
        </div>

        {/* Email e Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiMail className="inline w-4 h-4 mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiPhone className="inline w-4 h-4 mr-1" />
              Telefone *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', maskPhone(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FiHome className="inline w-4 h-4 mr-1" />
            Endereço *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Endereço completo"
          />
          {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
        </div>

        {/* Região e Taxa de Comissão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiMapPin className="inline w-4 h-4 mr-1" />
              Região *
            </label>
            <select
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.region ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione uma região</option>
              <option value="Norte">Norte</option>
              <option value="Nordeste">Nordeste</option>
              <option value="Centro-Oeste">Centro-Oeste</option>
              <option value="Sudeste">Sudeste</option>
              <option value="Sul">Sul</option>
            </select>
            {formErrors.region && <p className="text-red-500 text-xs mt-1">{formErrors.region}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiDollarSign className="inline w-4 h-4 mr-1" />
              Taxa de Comissão (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.comissionRate}
              onChange={(e) => handleInputChange('comissionRate', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.comissionRate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {formErrors.comissionRate && <p className="text-red-500 text-xs mt-1">{formErrors.comissionRate}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as 'ATIVO' | 'INATIVO')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        {/* Senha (apenas na criação) */}
        {mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={mode !== 'create' ? 'Deixe vazio para não alterar a senha' : 'Senha para acesso do franqueado'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {mode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
