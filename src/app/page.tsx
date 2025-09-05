'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirecionar para dashboard apropriada
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
      } else {
        // Não autenticado, redirecionar para login
        router.push('/auth/login')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  return <Loading fullScreen text="Carregando..." />
}
