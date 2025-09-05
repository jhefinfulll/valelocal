import { apiClient } from '@/lib/api'

// Tipos baseados no schema
export interface EstabelecimentoStats {
  total: number
  ativos: number
  inativos: number
  pendentes: number
  categorias: Array<{
    category: string
    count: number
    percentage: number
  }>
  franqueados: number
  crescimentoMensal: number
  tendencias: {
    estabelecimentos: 'up' | 'down' | 'stable'
    ativacao: 'up' | 'down' | 'stable'
  }
}

export interface EstabelecimentoData {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  category: string
  status: 'RASCUNHO' | 'PENDENTE_PAGAMENTO' | 'ATIVO' | 'INATIVO'
  franqueadoId: string
  asaasId?: string | null
  logo?: string
  coordinates?: {
    lat: number
    lng: number
  }
  createdAt: string
  updatedAt: string
  franqueados?: {
    id: string
    name: string
    region: string
  }
  _count?: {
    cartoes: number
    transacoes: number
    displays: number
  }
}

export interface CreateEstabelecimentoData {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  category: string
  franqueadoId: string
  logo?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface UpdateEstabelecimentoData extends Partial<CreateEstabelecimentoData> {}

export interface EstabelecimentosListResponse {
  estabelecimentos: EstabelecimentoData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class EstabelecimentosService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutos

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.cacheTimeout
  }

  private getFromCache<T>(key: string): T | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private clearCache(): void {
    this.cache.clear()
  }

  async getStats(): Promise<EstabelecimentoStats> {
    const cacheKey = 'estabelecimentos-stats'
    const cached = this.getFromCache<EstabelecimentoStats>(cacheKey)
    if (cached) return cached

    try {
      console.log('📊 Buscando estatísticas de estabelecimentos...')
      const response = await apiClient.get('/estabelecimentos/stats')
      const stats = (response.data || response) as EstabelecimentoStats
      this.setCache(cacheKey, stats)
      console.log('✅ Estatísticas carregadas:', stats)
      return stats
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de estabelecimentos:', error)
      throw error
    }
  }

  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
    franqueadoId?: string
  }): Promise<EstabelecimentosListResponse> {
    try {
      console.log('📋 Buscando estabelecimentos...')
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.limit) queryParams.set('limit', params.limit.toString())
      if (params?.search) queryParams.set('search', params.search)
      if (params?.status) queryParams.set('status', params.status)
      if (params?.category) queryParams.set('category', params.category)
      if (params?.franqueadoId) queryParams.set('franqueadoId', params.franqueadoId)

      const url = `/estabelecimentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      const data = (response.data || response) as EstabelecimentosListResponse
      console.log(`✅ ${data.estabelecimentos.length} estabelecimentos carregados`)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimentos:', error)
      throw error
    }
  }

  async getById(id: string): Promise<EstabelecimentoData> {
    try {
      console.log(`🔍 Buscando estabelecimento ${id}...`)
      const response = await apiClient.get(`/estabelecimentos/${id}`)
      const estabelecimento = (response.data || response) as EstabelecimentoData
      console.log('✅ Estabelecimento encontrado:', estabelecimento.name)
      return estabelecimento
    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimento:', error)
      throw error
    }
  }

  async create(data: CreateEstabelecimentoData): Promise<EstabelecimentoData> {
    try {
      console.log('➕ Criando estabelecimento:', data.name)
      const response = await apiClient.post('/estabelecimentos', data)
      this.clearCache()
      const estabelecimento = (response.data || response) as EstabelecimentoData
      console.log('✅ Estabelecimento criado:', estabelecimento.id)
      return estabelecimento
    } catch (error) {
      console.error('❌ Erro ao criar estabelecimento:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateEstabelecimentoData): Promise<EstabelecimentoData> {
    try {
      console.log(`✏️ Atualizando estabelecimento ${id}...`)
      const response = await apiClient.put(`/estabelecimentos/${id}`, data)
      this.clearCache()
      const estabelecimento = (response.data || response) as EstabelecimentoData
      console.log('✅ Estabelecimento atualizado:', estabelecimento.name)
      return estabelecimento
    } catch (error) {
      console.error('❌ Erro ao atualizar estabelecimento:', error)
      throw error
    }
  }

  async approve(id: string): Promise<EstabelecimentoData> {
    try {
      console.log(`✅ Aprovando/Desaprovando estabelecimento ${id}...`)
      const response = await apiClient.patch(`/estabelecimentos/${id}/approve`)
      this.clearCache()
      const estabelecimento = (response.data as any).estabelecimento as EstabelecimentoData
      console.log('✅ Status do estabelecimento alterado:', estabelecimento.name, '- Status:', estabelecimento.status)
      return estabelecimento
    } catch (error) {
      console.error('❌ Erro ao alterar status do estabelecimento:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Removendo estabelecimento ${id}...`)
      await apiClient.delete(`/estabelecimentos/${id}`)
      this.clearCache()
      console.log('✅ Estabelecimento removido')
    } catch (error) {
      console.error('❌ Erro ao remover estabelecimento:', error)
      throw error
    }
  }

  // Métodos auxiliares
  getStatusColor(status: string): string {
    switch (status) {
      case 'ATIVO': return 'bg-green-100 text-green-800'
      case 'INATIVO': return 'bg-red-100 text-red-800'
      case 'PENDENTE_PAGAMENTO': return 'bg-yellow-100 text-yellow-800'
      case 'RASCUNHO': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ATIVO': return 'Ativo'
      case 'INATIVO': return 'Inativo'
      case 'PENDENTE_PAGAMENTO': return 'Pagamento Pendente'
      case 'RASCUNHO': return 'Rascunho'
      default: return 'Desconhecido'
    }
  }
}

export const estabelecimentosService = new EstabelecimentosService()
