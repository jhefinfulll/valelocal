'use client';

import Login from '@/components/Login';
import { useAuth } from '@/hooks/useAuth';

export default function DemoLoginPage() {
  const { login } = useAuth();

  const handleLogin = async (userData: any) => {
    // Simular login para demo
    console.log('Demo login:', userData);
    // Aqui você poderia redirecionar ou fazer algo específico para demo
  };

  return <Login onLogin={handleLogin} />;
}
