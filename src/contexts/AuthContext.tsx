'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContextType, User, LoginCredentials, LoginResponse } from '@/types/auth'
import { apiClient, ApiError } from '@/lib/api'
import { getSecureItem, setSecureItem, clearAuthData } from '@/lib/crypto'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Carregar dados do usuário do localStorage criptografado na inicialização
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = getSecureItem<string>('auth_token')
        const storedUser = getSecureItem<User>('auth_user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser)
          apiClient.setToken(storedToken)
          
          // Verificar se o token ainda é válido
          try {
            await refreshUser()
          } catch (error) {
            // Se o token for inválido, fazer logout
            console.warn('Token inválido, fazendo logout automático')
            logout()
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error)
        // Limpar dados corrompidos
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.post<LoginResponse['data']>('/api/auth/login', credentials)
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data
        
        // Salvar no estado
        setToken(newToken)
        setUser(userData)
        
        // Salvar no localStorage criptografado
        setSecureItem('auth_token', newToken)
        setSecureItem('auth_user', userData)
        
        // Configurar token no cliente API
        apiClient.setToken(newToken)
        
        // Redirecionar para dashboard apropriada
        redirectToDashboard(userData)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Limpar estado
    setUser(null)
    setToken(null)
    
    // Limpar localStorage criptografado
    clearAuthData()
    
    // Limpar token do cliente API
    apiClient.setToken(null)
    
    // Redirecionar para login
    router.push('/auth/login')
  }

  const refreshUser = async () => {
    try {
      if (!token) return
      
      const response = await apiClient.get<User>('/api/auth/me')
      
      if (response.success && response.data) {
        setUser(response.data)
        setSecureItem('auth_user', response.data)
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error)
      // Se o token for inválido, fazer logout
      if (error instanceof ApiError && error.status === 401) {
        logout()
      }
      throw error
    }
  }

  const redirectToDashboard = (userData: User) => {
    switch (userData.type) {
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
