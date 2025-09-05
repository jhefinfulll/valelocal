'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  fallback = <div>Carregando...</div> 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  if (loading) {
    return fallback;
  }

  if (!user) {
    return null;
  }

  // Se há roles especificadas, verifica se o usuário tem permissão
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.type.toLowerCase())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
