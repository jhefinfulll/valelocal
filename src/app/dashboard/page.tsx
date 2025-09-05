'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirecionar para o dashboard específico do tipo de usuário
      switch (user.type) {
        case 'FRANQUEADORA':
          router.replace('/dashboard/franqueadora')
          break
        case 'FRANQUEADO':
          router.replace('/dashboard/franqueado')
          break
        case 'ESTABELECIMENTO':
          router.replace('/dashboard/estabelecimento')
          break
        case 'USUARIO':
          router.replace('/dashboard/usuario')
          break
        default:
          router.replace('/dashboard/usuario')
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando para sua dashboard...</p>
      </div>
    </div>
  )
}
