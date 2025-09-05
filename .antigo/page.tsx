'use client';

import { useState } from 'react';
import { User } from '@/types';
import Login from '@/components/Login';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    // Salva usuário no localStorage para persistir entre páginas
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Redireciona para o dashboard após login
    window.location.href = '/dashboard';
  };

  return <Login onLogin={handleLogin} />;
}
