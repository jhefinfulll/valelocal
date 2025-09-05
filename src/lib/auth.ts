import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d' // Token expira em 7 dias

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente')
}

export interface TokenPayload {
  id: string
  email: string
  type: 'FRANQUEADORA' | 'FRANQUEADO' | 'ESTABELECIMENTO' | 'USUARIO'
  franqueadoraId?: string
  franqueadoId?: string
  estabelecimentoId?: string
  iat?: number
  exp?: number
}

/**
 * Gera um token JWT
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

/**
 * Criptografa uma senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extrai o token do header Authorization
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove "Bearer "
}

/**
 * Obtém o usuário autenticado a partir do token na requisição
 */
export function getAuthenticatedUser(request: NextRequest): TokenPayload | null {
  const token = extractTokenFromRequest(request)
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 */
export function hasPermission(
  user: TokenPayload,
  allowedTypes: TokenPayload['type'][],
  resourceOwnerId?: string
): boolean {
  // Verifica se o tipo de usuário está permitido
  if (!allowedTypes.includes(user.type)) {
    return false
  }
  
  // Se há um proprietário do recurso, verifica se o usuário tem acesso
  if (resourceOwnerId) {
    switch (user.type) {
      case 'FRANQUEADORA':
        // Franqueadora tem acesso a tudo
        return true
      case 'FRANQUEADO':
        // Franqueado só tem acesso aos seus próprios recursos ou de seus estabelecimentos
        return user.franqueadoId === resourceOwnerId
      case 'ESTABELECIMENTO':
        // Estabelecimento só tem acesso aos seus próprios recursos
        return user.estabelecimentoId === resourceOwnerId
      case 'USUARIO':
        // Usuário só tem acesso aos seus próprios recursos
        return user.id === resourceOwnerId
      default:
        return false
    }
  }
  
  return true
}

/**
 * Middleware para verificar autenticação em rotas da API
 */
export function requireAuth(allowedTypes?: TokenPayload['type'][]) {
  return (handler: (request: NextRequest, user: TokenPayload) => Promise<Response>) => {
    return async (request: NextRequest): Promise<Response> => {
      const user = getAuthenticatedUser(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Token de autenticação requerido',
            error: 'UNAUTHORIZED'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (allowedTypes && !allowedTypes.includes(user.type)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Acesso negado para este tipo de usuário',
            error: 'FORBIDDEN'
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return handler(request, user)
    }
  }
}
