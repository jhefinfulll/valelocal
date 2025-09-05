import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse } from '@/types/api'
import { getSecureItem, setSecureItem, removeSecureItem } from './crypto'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiClient {
  private axiosInstance: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    // Criar instância do axios
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Recuperar token criptografado do localStorage se disponível
    if (typeof window !== 'undefined') {
      this.token = getSecureItem<string>('auth_token')
      if (this.token) {
        this.setAuthHeader(this.token)
      }
    }

    // Interceptor para requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Adicionar timestamp para evitar cache
        config.params = {
          ...config.params,
          _t: Date.now(),
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para responses
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        // Se receber 401, limpar autenticação
        if (error.response?.status === 401) {
          this.clearAuth()
          // Redirecionar para login se não estiver na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private setAuthHeader(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  private clearAuth() {
    this.token = null
    delete this.axiosInstance.defaults.headers.common['Authorization']
    removeSecureItem('auth_token')
    removeSecureItem('auth_user')
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        setSecureItem('auth_token', token)
        this.setAuthHeader(token)
      } else {
        this.clearAuth()
      }
    }
  }

  private async handleRequest<T>(request: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await request
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse<any>>
        
        // Se há resposta do servidor, usar ela
        if (axiosError.response?.data) {
          throw new ApiError(
            axiosError.response.data.message || 'Erro na requisição',
            axiosError.response.status,
            axiosError.response.data.error
          )
        }
        
        // Erros de rede ou timeout
        if (axiosError.code === 'ECONNABORTED') {
          throw new ApiError('Timeout na requisição', 0)
        }
        
        if (axiosError.code === 'ERR_NETWORK') {
          throw new ApiError('Erro de conexão com o servidor', 0)
        }
        
        throw new ApiError(axiosError.message, axiosError.response?.status)
      }
      
      // Outros tipos de erro
      throw new ApiError(
        error instanceof Error ? error.message : 'Erro desconhecido',
        0
      )
    }
  }

  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(
      this.axiosInstance.get(endpoint, { params })
    )
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(
      this.axiosInstance.post(endpoint, data)
    )
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(
      this.axiosInstance.put(endpoint, data)
    )
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(
      this.axiosInstance.delete(endpoint)
    )
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(
      this.axiosInstance.patch(endpoint, data)
    )
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = new ApiClient()
