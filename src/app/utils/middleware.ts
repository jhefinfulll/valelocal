import { NextRequest } from 'next/server'
import { getAuthenticatedUser, TokenPayload } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse } from './validation'
import prisma from '@/lib/prisma'

export type UserRole = 'FRANQUEADORA' | 'FRANQUEADO' | 'ESTABELECIMENTO' | 'USUARIO'

/**
 * Interface para middleware de autorização
 */
export interface AuthMiddlewareOptions {
  requiredRoles?: UserRole[]
  requireActiveUser?: boolean
  allowSelfAccess?: boolean
}

/**
 * Middleware de autenticação
 */
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ user: TokenPayload; error?: never } | { user?: never; error: Response }> {
  const {
    requiredRoles = [],
    requireActiveUser = true,
    allowSelfAccess = false
  } = options

  // Extrair e validar token
  const user = getAuthenticatedUser(request)
  
  if (!user) {
    return { error: unauthorizedResponse() }
  }

  // Verificar se o usuário está ativo no banco
  if (requireActiveUser) {
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
      select: { status: true }
    })

    if (!dbUser || dbUser.status !== 'ATIVO') {
      return { error: unauthorizedResponse('Usuário inativo ou não encontrado') }
    }
  }

  // Verificar permissões por role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.type)) {
    return { error: forbiddenResponse() }
  }

  return { user }
}

/**
 * Middleware específico para franqueadora
 */
export async function requireFranqueadora(request: NextRequest) {
  return authMiddleware(request, {
    requiredRoles: ['FRANQUEADORA'],
    requireActiveUser: true
  })
}

/**
 * Middleware específico para franqueado ou franqueadora
 */
export async function requireFranqueadoOrAbove(request: NextRequest) {
  return authMiddleware(request, {
    requiredRoles: ['FRANQUEADORA', 'FRANQUEADO'],
    requireActiveUser: true
  })
}

/**
 * Middleware específico para estabelecimento ou acima
 */
export async function requireEstabelecimentoOrAbove(request: NextRequest) {
  return authMiddleware(request, {
    requiredRoles: ['FRANQUEADORA', 'FRANQUEADO', 'ESTABELECIMENTO'],
    requireActiveUser: true
  })
}

/**
 * Verifica se o usuário tem acesso ao recurso específico
 */
export async function checkResourceAccess(
  user: TokenPayload,
  resourceType: 'estabelecimento' | 'franqueado' | 'franqueadora',
  resourceId: string
): Promise<boolean> {
  switch (user.type) {
    case 'FRANQUEADORA':
      // Franqueadora tem acesso a tudo
      return true

    case 'FRANQUEADO':
      if (resourceType === 'franqueado' && user.franqueadoId === resourceId) {
        return true
      }
      if (resourceType === 'estabelecimento') {
        // Verificar se o estabelecimento pertence ao franqueado
        const estabelecimento = await prisma.estabelecimentos.findUnique({
          where: { id: resourceId },
          select: { franqueadoId: true }
        })
        return estabelecimento?.franqueadoId === user.franqueadoId
      }
      return false

    case 'ESTABELECIMENTO':
      if (resourceType === 'estabelecimento' && user.estabelecimentoId === resourceId) {
        return true
      }
      return false

    default:
      return false
  }
}

/**
 * Middleware para verificar acesso a recurso específico
 */
export async function requireResourceAccess(
  request: NextRequest,
  resourceType: 'estabelecimento' | 'franqueado' | 'franqueadora',
  resourceId: string
) {
  const authResult = await authMiddleware(request)
  
  if (authResult.error) {
    return authResult
  }

  const hasAccess = await checkResourceAccess(authResult.user, resourceType, resourceId)
  
  if (!hasAccess) {
    return { error: forbiddenResponse('Você não tem acesso a este recurso') }
  }

  return authResult
}

/**
 * Aplica filtros baseados no tipo de usuário para queries
 */
export function applyUserFilters(user: TokenPayload, baseWhere: any = {}) {
  switch (user.type) {
    case 'FRANQUEADORA':
      // Franqueadora vê tudo
      return baseWhere

    case 'FRANQUEADO':
      // Franqueado vê apenas seus dados
      return {
        ...baseWhere,
        franqueadoId: user.franqueadoId
      }

    case 'ESTABELECIMENTO':
      // Estabelecimento vê apenas seus dados
      return {
        ...baseWhere,
        estabelecimentoId: user.estabelecimentoId
      }

    default:
      // Usuário comum não tem acesso a dados administrativos
      return {
        ...baseWhere,
        id: 'never-match' // Força resultado vazio
      }
  }
}

/**
 * Aplica filtros para estabelecimentos baseados no usuário
 */
export function applyEstabelecimentoFilters(user: TokenPayload, baseWhere: any = {}) {
  switch (user.type) {
    case 'FRANQUEADORA':
      return baseWhere

    case 'FRANQUEADO':
      return {
        ...baseWhere,
        franqueadoId: user.franqueadoId
      }

    case 'ESTABELECIMENTO':
      return {
        ...baseWhere,
        id: user.estabelecimentoId
      }

    default:
      return {
        ...baseWhere,
        id: 'never-match'
      }
  }
}
