'use client'

import { apiClient } from '@/lib/api'

export interface EstabelecimentoUserData {
  id: string
  name: string
  email: string
  status: string
  hasPassword: boolean
  lastLogin?: string
  createdAt: string
}

export interface CreatePasswordData {
  password: string
  confirmPassword: string
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

class EstabelecimentoPasswordService {
  private cache = new Map()

  private isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > 5 * 60 * 1000 // 5 minutos
  }

  async getUserInfo(estabelecimentoId: string): Promise<EstabelecimentoUserData | null> {
    try {
      const cacheKey = `estabelecimento:user:${estabelecimentoId}`
      
      // Verificar cache
      const cached = this.cache.get(cacheKey)
      if (cached && !this.isCacheExpired(cached.timestamp)) {
        return cached.data
      }

      const response = await apiClient.get(`/estabelecimentos/${estabelecimentoId}/user`)
      const data = (response.data || response) as EstabelecimentoUserData

      // Armazenar no cache
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error('Erro ao buscar usuário do estabelecimento:', error)
      return null
    }
  }

  async createUser(estabelecimentoId: string, passwordData: CreatePasswordData): Promise<{ user: EstabelecimentoUserData, tempPassword: string }> {
    try {
      if (passwordData.password !== passwordData.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      if (passwordData.password.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres')
      }

      const response = await apiClient.post(`/estabelecimentos/${estabelecimentoId}/user`, {
        password: passwordData.password
      })

      const data = (response.data || response) as { user: EstabelecimentoUserData, tempPassword: string }

      // Limpar cache relacionado
      this.clearUserCache(estabelecimentoId)

      return data

    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro ao criar usuário')
    }
  }

  async updatePassword(estabelecimentoId: string, passwordData: UpdatePasswordData): Promise<void> {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('A nova senha deve ter pelo menos 8 caracteres')
      }

      await apiClient.put(`/estabelecimentos/${estabelecimentoId}/user/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      // Limpar cache relacionado
      this.clearUserCache(estabelecimentoId)

    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro ao atualizar senha')
    }
  }

  async resetPassword(estabelecimentoId: string): Promise<{ temporaryPassword: string }> {
    try {
      const response = await apiClient.post(`/estabelecimentos/${estabelecimentoId}/user/reset-password`)
      const data = (response.data || response) as { temporaryPassword: string }

      // Limpar cache relacionado
      this.clearUserCache(estabelecimentoId)

      return data
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      throw new Error('Erro ao resetar senha')
    }
  }

  private clearUserCache(estabelecimentoId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(
      key => key.includes(`estabelecimento:user`) && key.includes(estabelecimentoId)
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const estabelecimentoPasswordService = new EstabelecimentoPasswordService()
