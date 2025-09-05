'use client';

import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { User } from '@/types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Usuários de teste
  const testUsers = [
    {
      email: 'admin@franqueadora.com',
      password: '123456',
      type: 'FRANQUEADORA',
      description: 'Acesso completo ao sistema'
    },
    {
      email: 'gestor@franqueadosp.com',
      password: '123456',
      type: 'FRANQUEADO',
      description: 'Gestão regional e estabelecimentos'
    },
    {
      email: 'contato@padariacentral.com',
      password: '123456',
      type: 'ESTABELECIMENTO',
      description: 'Painel básico de vendas'
    },
    {
      email: 'joao.silva@email.com',
      password: '123456',
      type: 'USUARIO',
      description: 'Uso de cartões'
    }
  ];

  const handleTestUserClick = (testUser: any) => {
    setEmail(testUser.email);
    setPassword(testUser.password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onLogin(data.data.user);
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl mb-6">
            <FiHome className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ValeLocal</h1>
          <p className="text-xl text-gray-600">Sistema de Gestão de Vales Locais</p>
          <p className="text-sm text-gray-500 mt-2">Faça login para acessar o sistema</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        {/* Usuários de Teste */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🔑 Usuários para Teste</h3>
          <div className="space-y-3">
            {testUsers.map((testUser, index) => (
              <button
                key={index}
                onClick={() => handleTestUserClick(testUser)}
                disabled={loading}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">{testUser.type}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        testUser.type === 'FRANQUEADORA' ? 'bg-green-100 text-green-800' :
                        testUser.type === 'FRANQUEADO' ? 'bg-blue-100 text-blue-800' :
                        testUser.type === 'ESTABELECIMENTO' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {testUser.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{testUser.email}</div>
                    <div className="text-xs text-gray-500">{testUser.description}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    Clique para preencher
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sistema ValeLocal</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Acesse sua conta para gerenciar vales locais, estabelecimentos e transações 
              de forma segura e eficiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
