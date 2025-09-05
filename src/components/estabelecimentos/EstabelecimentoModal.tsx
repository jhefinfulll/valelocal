import React, { useState, useEffect } from 'react'
import { FiX, FiHome, FiMail, FiPhone, FiMapPin, FiUser, FiTag, FiGlobe, FiEye, FiEyeOff } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { EstabelecimentoData, CreateEstabelecimentoData, UpdateEstabelecimentoData } from '@/services/estabelecimentosService'
import { FranqueadoData } from '@/services/franqueadosService'
import { maskCNPJ, maskPhone, cnpjToDatabase, phoneToDatabase, validateCNPJ, validateEmail, validatePhone } from '@/utils/masks'

interface EstabelecimentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateEstabelecimentoData | UpdateEstabelecimentoData) => Promise<void>
  mode: 'create' | 'edit' | 'view'
  estabelecimento?: EstabelecimentoData | null
  franqueados: FranqueadoData[]
  currentUser?: {
    type: string
    franqueadoId?: string
  }
}

interface FormData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  category: string
  franqueadoId: string
  logo: string
  password?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface FormErrors {
  name?: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  category?: string
  franqueadoId?: string
  logo?: string
  password?: string
}

const initialFormData: FormData = {
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  category: '',
  franqueadoId: '',
  logo: '',
  password: ''
}

const CATEGORIAS = [
  'Alimentação',
  'Vestuário',
  'Calçados',
  'Beleza e Cosméticos',
  'Casa e Decoração',
  'Eletrônicos',
  'Farmácia',
  'Livraria',
  'Pet Shop',
  'Serviços',
  'Outros'
]

export const EstabelecimentoModal: React.FC<EstabelecimentoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  estabelecimento,
  franqueados,
  currentUser
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (estabelecimento && (mode === 'edit' || mode === 'view')) {
        setFormData({
          name: estabelecimento.name || '',
          cnpj: maskCNPJ(estabelecimento.cnpj || ''),
          email: estabelecimento.email || '',
          phone: maskPhone(estabelecimento.phone || ''),
          address: estabelecimento.address || '',
          category: estabelecimento.category || '',
          franqueadoId: estabelecimento.franqueadoId || '',
          logo: estabelecimento.logo || '',
          password: '', // Não preencher senha em edição
          coordinates: estabelecimento.coordinates
        })
      } else {
        // Para criação: se usuário for FRANQUEADO, pré-selecionar automaticamente
        const franqueadoId = mode === 'create' && currentUser?.type === 'FRANQUEADO' 
          ? currentUser.franqueadoId || '' 
          : ''
        
        setFormData({
          ...initialFormData,
          franqueadoId
        })
      }
      setFormErrors({})
    }
  }, [isOpen, estabelecimento, mode, currentUser])

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

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

    if (!formData.address.trim()) {
      errors.address = 'Endereço é obrigatório'
    } else if (formData.address.length < 10) {
      errors.address = 'Endereço deve ser mais detalhado'
    }

    if (!formData.category.trim()) {
      errors.category = 'Categoria é obrigatória'
    }

    if (!formData.franqueadoId.trim()) {
      errors.franqueadoId = 'Franqueado é obrigatório'
    }

    if (formData.logo && formData.logo.trim()) {
      try {
        new URL(formData.logo)
      } catch {
        errors.logo = 'Logo deve ser uma URL válida'
      }
    }

    // Validação de senha apenas para criação
    if (mode === 'create' && !formData.password?.trim()) {
      errors.password = 'Senha é obrigatória para novos estabelecimentos'
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres'
    }

    return errors
  }

  type FormField = Exclude<keyof FormData, 'coordinates'>;
  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const dataToSave: any = {
        ...formData,
        cnpj: cnpjToDatabase(formData.cnpj),
        phone: phoneToDatabase(formData.phone),
        logo: formData.logo.trim() || undefined
      }
      
      // Para edição, não enviar senha se estiver vazia
      if (mode === 'edit' && (!formData.password || formData.password.trim() === '')) {
        delete dataToSave.password
      }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Estabelecimento'
      case 'edit': return 'Editar Estabelecimento'
      case 'view': return 'Visualizar Estabelecimento'
      default: return 'Estabelecimento'
    }
  }

  const isReadOnly = mode === 'view'

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'view' ? "" : getTitle()} size="xl">
      {mode === 'view' ? (
        // Modo visualização com design de cartão
        <div className="p-6">
          {/* Cartão do Estabelecimento */}
          <div className="relative bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-2xl mb-6">
            {/* Logo do Estabelecimento */}
            <div className="absolute top-6 right-6">
              {estabelecimento?.logo ? (
                <img 
                  src={estabelecimento.logo} 
                  alt="Logo" 
                  className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FiHome className="w-8 h-8" />
                </div>
              )}
            </div>
            
            {/* Header do Cartão */}
            <div className="mb-6">
              <h3 className="text-sm font-medium opacity-90 mb-1">VALE CARTÃO - ESTABELECIMENTO</h3>
              <h2 className="text-2xl font-bold mb-2">{estabelecimento?.name}</h2>
              <p className="text-lg opacity-90">{estabelecimento?.category}</p>
            </div>
            
            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm opacity-75 mb-1">CNPJ</p>
                <p className="font-mono text-lg">{maskCNPJ(estabelecimento?.cnpj || '')}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">STATUS</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  estabelecimento?.status === 'ATIVO' 
                    ? 'bg-green-400 text-green-900' 
                    : estabelecimento?.status === 'PENDENTE_PAGAMENTO'
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-red-400 text-red-900'
                }`}>
                  {estabelecimento?.status === 'PENDENTE_PAGAMENTO' ? 'PAGAMENTO PENDENTE' : estabelecimento?.status}
                </span>
              </div>
            </div>
            
            {/* Franqueado */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm opacity-75 mb-1">FRANQUEADO</p>
              <p className="font-semibold text-lg">
                {estabelecimento?.franqueados?.name || 
                 franqueados.find(f => f.id === estabelecimento?.franqueadoId)?.name || 
                 'Não informado'}
              </p>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiPhone className="w-5 h-5 mr-2 text-green-600" />
              Informações de Contato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{estabelecimento?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{maskPhone(estabelecimento?.phone || '')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:col-span-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="font-medium text-gray-900">{estabelecimento?.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          {estabelecimento?._count && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiTag className="w-5 h-5 mr-2 text-orange-600" />
                Atividade do Estabelecimento
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-t from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiTag className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{estabelecimento._count.cartoes || 0}</div>
                  <div className="text-sm text-blue-600 font-medium">Cartões</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-t from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiGlobe className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{estabelecimento._count.transacoes || 0}</div>
                  <div className="text-sm text-green-600 font-medium">Transações</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-t from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FiEye className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{estabelecimento._count.displays || 0}</div>
                  <div className="text-sm text-purple-600 font-medium">Displays</div>
                </div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Criado em:</span>
                <p className="font-medium text-gray-900">{new Date(estabelecimento?.createdAt || '').toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-gray-500">Última atualização:</span>
                <p className="font-medium text-gray-900">{new Date(estabelecimento?.updatedAt || '').toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-8 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : (
              // Modo criação/edição
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiHome className="inline h-4 w-4 mr-2" />
                      Nome do Estabelecimento *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome do estabelecimento"
                      disabled={isReadOnly}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiTag className="inline h-4 w-4 mr-2" />
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
                      disabled={isReadOnly}
                    />
                    {formErrors.cnpj && <p className="text-red-500 text-xs mt-1">{formErrors.cnpj}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiMail className="inline h-4 w-4 mr-2" />
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
                      disabled={isReadOnly}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiPhone className="inline h-4 w-4 mr-2" />
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
                      disabled={isReadOnly}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiMapPin className="inline h-4 w-4 mr-2" />
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
                      disabled={isReadOnly}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiTag className="inline h-4 w-4 mr-2" />
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isReadOnly}
                    >
                      <option value="">Selecione uma categoria</option>
                      {CATEGORIAS.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                  </div>

                  {/* Campo de senha - apenas para criação */}
                  {mode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha de Acesso *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password || ''}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                            formErrors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Digite a senha para acesso"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        Senha para o estabelecimento acessar o sistema. Mínimo 8 caracteres.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiUser className="inline h-4 w-4 mr-2" />
                      Franqueado *
                    </label>
                    {currentUser?.type === 'FRANQUEADO' ? (
                      // Para franqueados: mostrar apenas o próprio franqueado (não editável)
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                        {(() => {
                          const franqueado = franqueados.find(f => f.id === currentUser.franqueadoId)
                          if (franqueado) {
                            return `${franqueado.name} - ${franqueado.region}`
                          }
                          // Fallback: se não encontrar o franqueado na lista, mostrar um indicador
                          return currentUser.franqueadoId ? 'Carregando dados do franqueado...' : 'Franqueado não encontrado'
                        })()}
                      </div>
                    ) : (
                      // Para franqueadoras: permitir seleção de todos os franqueados
                      <select
                        value={formData.franqueadoId}
                        onChange={(e) => handleInputChange('franqueadoId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.franqueadoId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isReadOnly}
                      >
                        <option value="">Selecione um franqueado</option>
                        {franqueados.map(franqueado => (
                          <option key={franqueado.id} value={franqueado.id}>
                            {franqueado.name} - {franqueado.region}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.franqueadoId && <p className="text-red-500 text-xs mt-1">{formErrors.franqueadoId}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiGlobe className="inline h-4 w-4 mr-2" />
                      Logo (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => handleInputChange('logo', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.logo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://exemplo.com/logo.jpg"
                      disabled={isReadOnly}
                    />
                    {formErrors.logo && <p className="text-red-500 text-xs mt-1">{formErrors.logo}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
    </Modal>
  )
}
