'use client'

import { apiClient } from '@/lib/api'

export interface CobrancaData {
  id: string
  valor: number
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  tipo: 'ATIVACAO_ESTABELECIMENTO' | 'REPOSICAO_CARTOES' | 'TAXA_ESTABELECIMENTO'
  vencimento: string
  urlPagamento?: string | null
  pixQrCode?: string | null
  createdAt: string
  updatedAt: string
  paidAt?: string | null
  asaasChargeId?: string | null
  estabelecimento: {
    id: string
    name: string
    cnpj: string
  }
  franqueado: {
    id: string
    name: string
    cnpj: string
  }
}

export interface CobrancasResponse {
  success: boolean
  data: {
    cobrancas: CobrancaData[]
  }
  message: string
}

export interface GenerateCobrancaRequest {
  estabelecimentoId: string
}

export interface GenerateCobrancaResponse {
  success: boolean
  data: {
    cobranca: CobrancaData
    message: string
  }
  message: string
}

export interface MarkAsPaidResponse {
  success: boolean
  data: {
    cobranca: CobrancaData
  }
  message: string
}

class CobrancasService {
  async listCobrancas(): Promise<CobrancasResponse> {
    const response = await apiClient.get('/cobrancas')
    return response.data as CobrancasResponse
  }

  async generateCobranca(data: GenerateCobrancaRequest): Promise<GenerateCobrancaResponse> {
    const response = await apiClient.post('/cobrancas', data)
    return response.data as GenerateCobrancaResponse
  }

  async markAsPaid(cobrancaId: string): Promise<MarkAsPaidResponse> {
    const response = await apiClient.patch(`/cobrancas/${cobrancaId}/pay`)
    return response.data as MarkAsPaidResponse
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  getStatusColor(status: CobrancaData['status']): string {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'EXPIRED':
        return 'text-red-600 bg-red-100'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  getStatusText(status: CobrancaData['status']): string {
    switch (status) {
      case 'PAID':
        return 'Pago'
      case 'PENDING':
        return 'Pendente'
      case 'EXPIRED':
        return 'Vencido'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  getTipoText(tipo: CobrancaData['tipo']): string {
    switch (tipo) {
      case 'TAXA_ESTABELECIMENTO':
        return 'Taxa de Estabelecimento'
      case 'ATIVACAO_ESTABELECIMENTO':
        return 'Ativação de Estabelecimento'
      case 'REPOSICAO_CARTOES':
        return 'Reposição de Cartões'
      default:
        return 'Outros'
    }
  }
}

export const cobrancasService = new CobrancasService()
