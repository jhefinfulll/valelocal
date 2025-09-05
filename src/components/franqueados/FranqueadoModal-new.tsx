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
    } else if (!validatePhone(formData.phone)) {
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
      
      // Para criação, se senha estiver vazia, definir uma senha padrão ou exigir
      if (mode === 'create' && (!formData.password || formData.password.trim() === '')) {
        // Você pode definir uma senha padrão ou exigir que o usuário informe
        dataToSave.password = 'senha123' // Senha padrão temporária
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
        title={getModalTitle()}
        size="lg"
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Info Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</label>
              <div className="text-gray-900 font-medium">{franqueado.name}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CNPJ</label>
              <div className="text-gray-900">{maskCNPJ(franqueado.cnpj)}</div>
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <FiMail className="w-3 h-3 mr-1" />
                Email
              </label>
              <div className="text-gray-900 break-all">{franqueado.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <FiPhone className="w-3 h-3 mr-1" />
                Telefone
              </label>
              <div className="text-gray-900">{maskPhone(franqueado.phone)}</div>
            </div>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <FiHome className="w-3 h-3 mr-1" />
                Endereço
              </label>
              <div className="text-gray-900">{franqueado.address}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <FiMapPin className="w-3 h-3 mr-1" />
                Região
              </label>
              <div className="text-gray-900">{franqueado.region}</div>
            </div>
          </div>

          {/* Status e Comissão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                franqueado.status === 'ATIVO' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {franqueado.status}
              </span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <FiDollarSign className="w-3 h-3 mr-1" />
                Taxa de Comissão
              </label>
              <div className="text-gray-900 font-medium">{franqueado.comissionRate}%</div>
            </div>
          </div>

          {/* Estatísticas */}
          {franqueado._count && (
            <div className="border-t pt-4 sm:pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Estatísticas</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{franqueado._count.estabelecimentos}</div>
                  <div className="text-xs text-blue-600">Estabelecimentos</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{franqueado._count.cartoes || 0}</div>
                  <div className="text-xs text-green-600">Cartões</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2 sm:col-span-1">
                  <div className="text-lg font-bold text-purple-600">{franqueado._count.comissoes || 0}</div>
                  <div className="text-xs text-purple-600">Comissões</div>
                </div>
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Criado em</label>
                <div className="text-gray-900">{formatDate(franqueado.createdAt)}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Atualizado em</label>
                <div className="text-gray-900">{formatDate(franqueado.updatedAt)}</div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
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
                placeholder="Senha para acesso do franqueado"
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
