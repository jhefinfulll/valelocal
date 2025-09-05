'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function RealLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithCredentials(email, password);
      
      if (result.success) {
        // Login bem-sucedido, redirecionar será feito pelo useAuth
        window.location.reload(); // Força recarregamento para atualizar estado
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setLoading(true);

    try {
      const result = await loginWithCredentials(testEmail, testPassword);
      
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-yellow-500 mb-6">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema Vale Local
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {/* Usuários de teste */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usuários de Teste</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleTestLogin('franqueadora@valelocal.com', 'senha123')}
              disabled={loading}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-purple-900">👑 Franqueadora</div>
              <div className="text-sm text-purple-700">franqueadora@valelocal.com</div>
              <div className="text-xs text-purple-600">Acesso total ao sistema</div>
            </button>

            <button
              onClick={() => handleTestLogin('franqueado@valelocal.com', 'senha123')}
              disabled={loading}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-blue-900">🏢 Franqueado</div>
              <div className="text-sm text-blue-700">franqueado@valelocal.com</div>
              <div className="text-xs text-blue-600">Gestão de estabelecimentos</div>
            </button>

            <button
              onClick={() => handleTestLogin('estabelecimento@valelocal.com', 'senha123')}
              disabled={loading}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-green-900">🏪 Estabelecimento</div>
              <div className="text-sm text-green-700">estabelecimento@valelocal.com</div>
              <div className="text-xs text-green-600">Operações comerciais</div>
            </button>

            <button
              onClick={() => handleTestLogin('usuario@valelocal.com', 'senha123')}
              disabled={loading}
              className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-gray-900">👤 Usuário</div>
              <div className="text-sm text-gray-700">usuario@valelocal.com</div>
              <div className="text-xs text-gray-600">Uso de cartões</div>
            </button>
          </div>
        </div>

        {/* Links úteis */}
        <div className="text-center space-y-2">
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-green-600 hover:text-green-500"
          >
            📚 Documentação da API
          </a>
          <br />
          <button
            onClick={() => window.location.href = '/demo-login'}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            🎭 Ver Login de Demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
