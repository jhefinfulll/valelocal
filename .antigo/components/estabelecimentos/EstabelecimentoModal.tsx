import { useState } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe } from 'react-icons/fi';
import { CreateEstabelecimentoData, UpdateEstabelecimentoData, Estabelecimento } from '@/services/estabelecimentosService';
import { useFranqueados } from '@/hooks/useFranqueados';
import { masks } from '@/lib/masks';

interface EstabelecimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEstabelecimentoData | UpdateEstabelecimentoData) => Promise<void>;
  estabelecimento?: Estabelecimento;
  loading?: boolean;
}

export default function EstabelecimentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  estabelecimento, 
  loading = false 
}: EstabelecimentoModalProps) {
  const { franqueados } = useFranqueados();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: estabelecimento?.name || '',
    cnpj: estabelecimento?.cnpj || '',
    email: estabelecimento?.email || '',
    phone: estabelecimento?.phone || '',
    address: estabelecimento?.address || '',
    category: estabelecimento?.category || '',
    franqueadoId: estabelecimento?.franqueadoId || '',
    logo: estabelecimento?.logo || '',
    coordinates: {
      lat: estabelecimento?.estabelecimento_coords?.lat || 0,
      lng: estabelecimento?.estabelecimento_coords?.lng || 0,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para validar URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value;
    
    // Aplicar máscaras
    if (field === 'cnpj') {
      maskedValue = masks.cnpj(value);
    } else if (field === 'phone') {
      maskedValue = masks.phone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: maskedValue
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: numericValue
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.franqueadoId) {
      newErrors.franqueadoId = 'Franqueado é obrigatório';
    }

    // Validar logo apenas se não estiver vazio
    if (formData.logo.trim() && !isValidUrl(formData.logo)) {
      newErrors.logo = 'Logo deve ser uma URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Previne duplo envio
    }

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, ''), // Enviar apenas números
      phone: formData.phone.replace(/\D/g, ''), // Enviar apenas números
      logo: formData.logo.trim() || undefined, // Remover se vazio
      coordinates: formData.coordinates.lat && formData.coordinates.lng ? formData.coordinates : undefined
    };

    try {
      setIsSubmitting(true);
      await onSave(submitData);
      // Não fechar aqui - deixar o componente pai controlar
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      // O erro já será tratado pelo hook e mostrará o toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      franqueadoId: '',
      logo: '',
      coordinates: { lat: 0, lng: 0 }
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    'Alimentação',
    'Varejo',
    'Serviços',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Tecnologia',
    'Outros'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {estabelecimento ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiHome className="inline w-4 h-4 mr-1" />
              Nome do Estabelecimento
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o nome do estabelecimento"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* CNPJ e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline w-4 h-4 mr-1" />
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.cnpj ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00.000.000/0000-00"
                disabled={loading}
                maxLength={18}
              />
              {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Telefone e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline w-4 h-4 mr-1" />
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                disabled={loading}
                maxLength={15}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiHome className="inline w-4 h-4 mr-1" />
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline w-4 h-4 mr-1" />
              Endereço
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Endereço completo"
              disabled={loading}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Franqueado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline w-4 h-4 mr-1" />
              Franqueado Responsável
            </label>
            <select
              value={formData.franqueadoId}
              onChange={(e) => handleInputChange('franqueadoId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.franqueadoId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Selecione um franqueado</option>
              {franqueados.map(franqueado => (
                <option key={franqueado.id} value={franqueado.id}>
                  {franqueado.name} - {franqueado.region}
                </option>
              ))}
            </select>
            {errors.franqueadoId && <p className="text-red-500 text-sm mt-1">{errors.franqueadoId}</p>}
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiGlobe className="inline w-4 h-4 mr-1" />
              Logo (URL) - Opcional
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.logo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://exemplo.com/logo.png (deixe em branco se não tiver logo)"
              disabled={loading}
            />
            {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco se não tiver logo ou digite uma URL válida
            </p>
          </div>

          {/* Coordenadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline w-4 h-4 mr-1" />
              Coordenadas (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={(e) => handleCoordinatesChange('lat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Latitude"
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={(e) => handleCoordinatesChange('lng', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Longitude"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {(loading || isSubmitting) ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
