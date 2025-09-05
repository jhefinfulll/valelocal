import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Wrapper para validação de requests com Zod
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return handler(validatedData, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Erro de validação Zod:', error.issues)
        return NextResponse.json(
          { 
            error: 'Dados inválidos',
            details: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`)
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Response padronizado de sucesso
 */
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    message: message || 'Operação realizada com sucesso',
    data
  })
}

/**
 * Response padronizado de erro
 */
export function errorResponse(message: string, details?: any, status = 400) {
  return NextResponse.json({
    error: message,
    details
  }, { status })
}

/**
 * Response de erro não autorizado
 */
export function unauthorizedResponse(message = 'Token inválido ou expirado') {
  return NextResponse.json({
    error: message
  }, { status: 401 })
}

/**
 * Response de erro de permissão
 */
export function forbiddenResponse(message = 'Você não tem permissão para acessar este recurso') {
  return NextResponse.json({
    error: message
  }, { status: 403 })
}

/**
 * Response de recurso não encontrado
 */
export function notFoundResponse(message = 'Recurso não encontrado') {
  return NextResponse.json({
    error: message
  }, { status: 404 })
}

/**
 * Extrai query parameters com validação
 */
export function getQueryParams(request: NextRequest, validKeys: string[]) {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  
  validKeys.forEach(key => {
    const value = url.searchParams.get(key)
    if (value !== null) {
      params[key] = value
    }
  })
  
  return params
}

/**
 * Converte string para número com validação
 */
export function parseNumber(value: string | null, defaultValue = 0): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
