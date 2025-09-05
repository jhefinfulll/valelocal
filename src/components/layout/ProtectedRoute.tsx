'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'
import { UserType } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserType[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Se não está autenticado, redireciona para login
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      // Se tem roles específicas, verifica se o usuário tem permissão
      if (allowedRoles && user && !allowedRoles.includes(user.type)) {
        // Redireciona para dashboard apropriada se não tem permissão
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
            router.push('/auth/login')
            break
        }
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return <Loading fullScreen text="Verificando autenticação..." />
  }

  // Se não está autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated) {
    return <Loading fullScreen text="Redirecionando..." />
  }

  // Se tem roles específicas e usuário não tem permissão, não renderiza
  if (allowedRoles && user && !allowedRoles.includes(user.type)) {
    return <Loading fullScreen text="Redirecionando..." />
  }

  // Se passou em todas as verificações, renderiza o conteúdo
  return <>{children}</>
}
