import { NextRequest } from 'next/server'
import { CreateCartaoSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, getQueryParams, parseNumber } from '@/app/utils/validation'
import { getAuthenticatedUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/cartoes:
 *   get:
 *     tags:
 *       - Cartões
 *     summary: Listar cartões
 *     description: Lista cartões com paginação e filtros baseado nas permissões do usuário
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por código ou QR Code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DISPONIVEL, ATIVO, UTILIZADO, EXPIRADO]
 *       - in: query
 *         name: franqueadoId
 *         schema:
 *           type: string
 *         description: Filtrar por franqueado
 *       - in: query
 *         name: estabelecimentoId
 *         schema:
 *           type: string
 *         description: Filtrar por estabelecimento
 *     responses:
 *       200:
 *         description: Lista de cartões
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Cartões
 *     summary: Criar cartão
 *     description: Cria um novo cartão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCartao'
 *     responses:
 *       201:
 *         description: Cartão criado com sucesso
 */

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const params = getQueryParams(request, [
      'page', 'limit', 'search', 'status', 'franqueadoId', 'estabelecimentoId'
    ])
    const page = parseNumber(params.page, 1)
    const limit = Math.min(parseNumber(params.limit, 10), 100)
    const offset = (page - 1) * limit

    // Construir filtros baseado no tipo de usuário
    const where: any = {}

    // Filtros por permissão
    if (user.type === 'FRANQUEADO') {
      where.franqueadoId = user.franqueadoId
    } else if (user.type === 'ESTABELECIMENTO') {
      where.estabelecimentoId = user.estabelecimentoId
    } else if (user.type === 'FRANQUEADORA') {
      // FRANQUEADORA pode ver todos
      if (params.franqueadoId) {
        where.franqueadoId = params.franqueadoId
      }
    }

    // Filtros gerais
    if (params.search) {
      where.OR = [
        { codigo: { contains: params.search, mode: 'insensitive' } },
        { qrCode: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.estabelecimentoId) {
      where.estabelecimentoId = params.estabelecimentoId
    }

    // Buscar cartões
    const [cartoes, total] = await Promise.all([
      prisma.cartoes.findMany({
        where,
        select: {
          id: true,
          codigo: true,
          qrCode: true,
          valor: true,
          status: true,
          dataAtivacao: true,
          dataUtilizacao: true,
          franqueadoId: true,
          estabelecimentoId: true,
          createdAt: true,
          updatedAt: true,
          usuarioId: true,
          franqueados: {
            select: {
              id: true,
              name: true,
              region: true
            }
          },
          estabelecimentos: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          _count: {
            select: {
              transacoes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.cartoes.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return successResponse({
      cartoes,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    }, 'Cartões listados com sucesso')

  } catch (error) {
    console.error('Erro ao listar cartões:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

async function createCartaoHandler(data: any, request: NextRequest) {
  console.log('🔵 createCartaoHandler - Dados recebidos:', data);
  
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  // Verificar permissões
  if (user.type === 'ESTABELECIMENTO') {
    return forbiddenResponse('Estabelecimentos não podem criar cartões')
  }

  if (user.type === 'FRANQUEADO' && data.franqueadoId !== user.franqueadoId) {
    return forbiddenResponse('Você só pode criar cartões para sua própria franquia')
  }

  try {
    // Verificar se código já existe
    const existingCodigo = await prisma.cartoes.findUnique({
      where: { codigo: data.codigo }
    })

    if (existingCodigo) {
      return errorResponse('Código de cartão já existe', null, 400)
    }

    // Verificar se QR Code já existe
    const existingQrCode = await prisma.cartoes.findUnique({
      where: { qrCode: data.qrCode }
    })

    if (existingQrCode) {
      return errorResponse('QR Code já existe', null, 400)
    }

    // Verificar se o franqueado existe
    const franqueado = await prisma.franqueados.findUnique({
      where: { id: data.franqueadoId }
    })

    if (!franqueado) {
      return errorResponse('Franqueado não encontrado', null, 404)
    }

    // Verificar se o estabelecimento existe (se fornecido)
    if (data.estabelecimentoId) {
      const estabelecimento = await prisma.estabelecimentos.findUnique({
        where: { id: data.estabelecimentoId }
      })

      if (!estabelecimento) {
        return errorResponse('Estabelecimento não encontrado', null, 404)
      }

      // Verificar se o estabelecimento pertence ao franqueado
      if (estabelecimento.franqueadoId !== data.franqueadoId) {
        return errorResponse('Estabelecimento não pertence ao franqueado especificado', null, 400)
      }
    }

    // Criar cartão
    const cartao = await prisma.cartoes.create({
      data: {
        id: crypto.randomUUID(),
        codigo: data.codigo,
        qrCode: data.qrCode,
        valor: data.valor || 0,
        status: data.valor && data.valor > 0 ? 'ATIVO' : 'DISPONIVEL',
        franqueadoId: data.franqueadoId,
        estabelecimentoId: data.estabelecimentoId || null,
        dataAtivacao: data.valor && data.valor > 0 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        codigo: true,
        qrCode: true,
        valor: true,
        status: true,
        dataAtivacao: true,
        createdAt: true,
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    return successResponse(cartao, 'Cartão criado com sucesso')

  } catch (error) {
    console.error('Erro ao criar cartão:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = withValidation(CreateCartaoSchema, createCartaoHandler)
