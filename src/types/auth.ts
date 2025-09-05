export type UserType = 'FRANQUEADORA' | 'FRANQUEADO' | 'ESTABELECIMENTO' | 'USUARIO'
export type Status = 'ATIVO' | 'INATIVO'

export interface User {
  id: string
  name: string
  email: string
  type: UserType
  status: Status
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
  franqueadoraId?: string | null
  franqueadoId?: string | null
  estabelecimentoId?: string | null
  franqueadora?: {
    id: string
    name: string
    cnpj: string
    email: string
    phone: string
    address: string
    logo?: string | null
    status: Status
  }
  franqueado?: {
    id: string
    name: string
    cnpj: string
    email: string
    phone: string
    address: string
    region: string
    comissionRate: number
    logo?: string | null
    status: Status
  }
  estabelecimento?: {
    id: string
    name: string
    cnpj: string
    email: string
    phone: string
    address: string
    category: string
    logo?: string | null
    status: 'RASCUNHO' | 'PENDENTE_PAGAMENTO' | 'ATIVO' | 'SUSPENSO' | 'CANCELADO'
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}
