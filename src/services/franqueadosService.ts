'use client'

import { apiClient } from '@/lib/api'

export interface FranqueadoData {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  region: string
  comissionRate: number
  status: 'ATIVO' | 'INATIVO'
  asaasCustomerId?: string | null
  logo?: string
  createdAt: string
  updatedAt: string
  franqueadoras?: {
    id: string
    name: string
  }
  _count?: {
    estabelecimentos: number
    cartoes: number
    comissoes: number
  }
}

export interface FranqueadoStats {
  total: number
  ativos: number
  inativos: number
  estabelecimentos: number
  comissaoMedia: number
  regioes: number
  crescimentoMensal: number
  tendencias: {
    franqueados: 'up' | 'down' | 'stable'
    ativacao: 'up' | 'down'
  }
}

export interface RegionDistribution {
  region: string
  count: number
  ativos: number
  inativos: number
  estabelecimentos: number
  percentage: number
}

export interface PerformanceData {
  novosFranqueados: {
    atual: number
    anterior: number
    crescimento: number
    tendencia: 'up' | 'down' | 'stable'
  }
  taxaAtivacao: {
    percentual: number
    ativos: number
    total: number
    tendencia: 'up' | 'down'
  }
  estabelecimentosRecentes: {
    total: number
    periodo: string
    crescimento: number
  }
  cartoesAtivados: {
    total: number
    periodo: string
    crescimento: number
  }
}

export interface CreateFranqueadoData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  region: string
  comissionRate: number
  asaasCustomerId?: string
  logo?: string
}

export interface UpdateFranqueadoData extends Partial<CreateFranqueadoData> {
  status?: 'ATIVO' | 'INATIVO'
}

export interface FranqueadosResponse {
  franqueados: FranqueadoData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface GetFranqueadosParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  region?: string
  comissionMin?: number
  comissionMax?: number
}

class FranqueadosService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  private setCache<T>(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  private clearCache() {
    this.cache.clear()
  }

  async getFranqueados(params: GetFranqueadosParams = {}): Promise<FranqueadosResponse> {
    try {
      console.log('🔍 getFranqueados() - params:', params)
      const response = await apiClient.get('/franqueados', params)
      console.log('📡 Resposta getFranqueados:', response)
      return (response.data || response) as FranqueadosResponse
    } catch (error) {
      console.error('❌ Erro em getFranqueados:', error)
      throw error
    }
  }

  async getStats(): Promise<FranqueadoStats> {
    try {
      console.log('🔍 getStats() - iniciando...')
      const cacheKey = 'franqueados_stats'
      const cached = this.getFromCache<FranqueadoStats>(cacheKey)
      
      if (cached) {
        console.log('📦 Cache encontrado:', cached)
        return cached
      }

      console.log('🌐 Fazendo requisição para /franqueados/stats')
      const response = await apiClient.get('/franqueados/stats')
      console.log('📡 Resposta completa da API:', response)
      
      const result = (response.data || response) as FranqueadoStats
      console.log('📊 Dados extraídos:', result)
      
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('❌ Erro em getStats():', error)
      throw error
    }
  }

  async getRegionDistribution(): Promise<RegionDistribution[]> {
    try {
      console.log('🔍 getRegionDistribution() - iniciando...')
      const cacheKey = 'franqueados_region_distribution'
      const cached = this.getFromCache<RegionDistribution[]>(cacheKey)
      
      if (cached) {
        console.log('📦 Cache regiões encontrado:', cached)
        return cached
      }

      console.log('🌐 Fazendo requisição para /franqueados/region-distribution')
      const response = await apiClient.get('/franqueados/region-distribution')
      console.log('📡 Resposta regiões:', response)
      
      const result = (response.data || response) as RegionDistribution[]
      console.log('📊 Dados regiões extraídos:', result)
      
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('❌ Erro em getRegionDistribution:', error)
      throw error
    }
  }

  async getPerformanceData(): Promise<PerformanceData> {
    try {
      console.log('🔍 getPerformanceData() - iniciando...')
      const cacheKey = 'franqueados_performance'
      const cached = this.getFromCache<PerformanceData>(cacheKey)
      
      if (cached) {
        console.log('📦 Cache performance encontrado:', cached)
        return cached
      }

      console.log('🌐 Fazendo requisição para /franqueados/performance')
      const response = await apiClient.get('/franqueados/performance')
      console.log('📡 Resposta performance:', response)
      
      const result = (response.data || response) as PerformanceData
      console.log('📊 Dados performance extraídos:', result)
      
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('❌ Erro em getPerformanceData:', error)
      throw error
    }
  }

  async createFranqueado(data: CreateFranqueadoData): Promise<FranqueadoData> {
    try {
      const response = await apiClient.post('/franqueados', data)
      this.clearCache()
      return (response.data || response) as FranqueadoData
    } catch (error) {
      console.error('Erro ao criar franqueado:', error)
      throw error
    }
  }

  async updateFranqueado(id: string, data: UpdateFranqueadoData): Promise<FranqueadoData> {
    try {
      const response = await apiClient.put(`/franqueados/${id}`, data)
      this.clearCache()
      return (response.data || response) as FranqueadoData
    } catch (error) {
      console.error('Erro ao atualizar franqueado:', error)
      throw error
    }
  }

  async deleteFranqueado(id: string): Promise<void> {
    try {
      await apiClient.delete(`/franqueados/${id}`)
      this.clearCache()
    } catch (error) {
      console.error('Erro ao deletar franqueado:', error)
      throw error
    }
  }
}

export const franqueadosService = new FranqueadosService()
