import React from 'react';
import { X, Copy, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react';

interface LoginCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    tempPassword: string;
    message: string;
  };
  franqueadoName: string;
}

export default function LoginCredentialsModal({
  isOpen,
  onClose,
  credentials,
  franqueadoName
}: LoginCredentialsModalProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Franqueado Criado!
            </h2>
            <p className="text-gray-600">
              <strong>{franqueadoName}</strong> foi cadastrado com sucesso
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={20} />
            <div>
              <h3 className="font-semibold text-green-800">
                Usuário criado automaticamente
              </h3>
              <p className="text-green-600 text-sm mt-1">
                {credentials.message}
              </p>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Mail className="text-blue-600 mr-3" size={20} />
            <div>
              <h4 className="font-semibold text-blue-800">Email Enviado</h4>
              <p className="text-blue-600 text-sm mt-1">
                As credenciais foram enviadas para o email do franqueado com instruções completas.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-gray-900">
            🔐 Credenciais de Acesso
          </h3>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Login
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                {credentials.email}
              </div>
              <button
                onClick={() => copyToClipboard(credentials.email, 'email')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Copiar email"
              >
                {copiedField === 'email' ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Temporária
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                {showPassword ? credentials.tempPassword : '••••••••••••'}
              </div>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.tempPassword, 'password')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Copiar senha"
              >
                {copiedField === 'password' ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Esta é uma senha temporária</li>
            <li>• O franqueado deve alterá-la no primeiro acesso</li>
            <li>• Certifique-se de que ele recebeu o email</li>
            <li>• Mantenha essas informações seguras</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              const credentials_text = `Email: ${credentials.email}\nSenha: ${credentials.tempPassword}`;
              copyToClipboard(credentials_text, 'all');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Copy size={16} />
            <span>Copiar Tudo</span>
          </button>
        </div>

        {/* Copy Success Feedback */}
        {copiedField && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
            ✓ Copiado!
          </div>
        )}
      </div>
    </div>
  );
}
