'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'
import { ApiError } from '@/lib/api'
import { FiEye, FiEyeOff, FiUser, FiLock, FiHome } from 'react-icons/fi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()



  // Se já está autenticado, redirecionar para dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.type) {
        case 'FRANQUEADORA':
          router.push('/dashboard/franqueadora')
          break
        case 'FRANQUEADO':
          router.push('/dashboard/franqueado')
          break
        case 'ESTABELECIMENTO':
          router.push('/dashboard/estabelecimento')
          break
        case 'USUARIO':
          router.push('/dashboard/usuario')
          break
        default:
          router.push('/dashboard')
          break
      }
    }
  }, [isLoading, isAuthenticated, user, router])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading se está verificando autenticação
  if (isLoading) {
    return <Loading fullScreen text="Verificando autenticação..." />
  }

  // Se já está autenticado, mostrar loading enquanto redireciona
  if (isAuthenticated) {
    return <Loading fullScreen text="Redirecionando..." />
  }

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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isSubmitting}
                  required
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
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
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
              disabled={isSubmitting || !email || !password}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
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
  )
}
