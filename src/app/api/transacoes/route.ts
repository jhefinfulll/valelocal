import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/transacoes:
 *   get:
 *     tags: [Transações]
 *     summary: Listar transações
 *     description: Retorna lista paginada de transações com filtros
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Limite por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por código do cartão, valor ou nome do usuário
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, CONCLUIDA, CANCELADA]
 *         description: Filtrar por status
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [RECARGA, UTILIZACAO]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: cartaoId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do cartão
 *       - in: query
 *         name: estabelecimentoId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do estabelecimento
 *       - in: query
 *         name: valorMin
 *         schema:
 *           type: number
 *         description: Valor mínimo
 *       - in: query
 *         name: valorMax
 *         schema:
 *           type: number
 *         description: Valor máximo
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de transações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transacao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     volume:
 *                       type: number
 *                     ticketMedio:
 *                       type: number
 *                     porStatus:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const tipo = searchParams.get('tipo');
    const cartaoId = searchParams.get('cartaoId');
    const estabelecimentoId = searchParams.get('estabelecimentoId');
    const valorMin = searchParams.get('valorMin') ? parseFloat(searchParams.get('valorMin')!) : undefined;
    const valorMax = searchParams.get('valorMax') ? parseFloat(searchParams.get('valorMax')!) : undefined;
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const skip = (page - 1) * limit;

    // Construir where baseado no tipo de usuário
    const where: any = {};

    // Aplicar filtros baseados no tipo de usuário
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.cartoes = {
        franqueadoId: user.franqueadoId
      };
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    // Aplicar filtros de busca
    if (search) {
      where.OR = [
        {
          cartoes: {
            codigo: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          usuarioNome: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          usuarioTelefone: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Filtros específicos
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (cartaoId) where.cartaoId = cartaoId;
    if (estabelecimentoId) where.estabelecimentoId = estabelecimentoId;

    // Filtro de valor
    if (valorMin || valorMax) {
      where.valor = {};
      if (valorMin) where.valor.gte = valorMin;
      if (valorMax) where.valor.lte = valorMax;
    }

    // Filtro de data
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) {
        const endDate = new Date(dataFim);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Buscar transações
    const [transacoes, total] = await Promise.all([
      prisma.transacoes.findMany({
        where,
        include: {
          cartoes: {
            select: {
              id: true,
              codigo: true,
              status: true,
              franqueados: {
                select: {
                  id: true,
                  name: true,
                  region: true
                }
              }
            }
          },
          estabelecimentos: {
            select: {
              id: true,
              name: true,
              category: true,
              address: true
            }
          },
          comissoes: {
            select: {
              id: true,
              valor: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transacoes.count({ where })
    ]);

    // Calcular estatísticas
    const summary = await prisma.transacoes.aggregate({
      where,
      _count: { id: true },
      _sum: { valor: true },
      _avg: { valor: true }
    });

    // Estatísticas por status
    const statusStats = await prisma.transacoes.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { valor: true }
    });

    const porStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        volume: stat._sum.valor || 0
      };
      return acc;
    }, {} as Record<string, { count: number; volume: number }>);

    return NextResponse.json({
      data: transacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total: summary._count.id || 0,
        volume: summary._sum.valor || 0,
        ticketMedio: summary._avg.valor || 0,
        porStatus
      }
    });

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transacoes:
 *   post:
 *     tags: [Transações]
 *     summary: Criar nova transação
 *     description: Cria uma nova transação no sistema
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, valor, cartaoId, estabelecimentoId]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [RECARGA, UTILIZACAO]
 *                 description: Tipo da transação
 *               valor:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Valor da transação
 *               cartaoId:
 *                 type: string
 *                 description: ID do cartão
 *               estabelecimentoId:
 *                 type: string
 *                 description: ID do estabelecimento
 *               usuarioNome:
 *                 type: string
 *                 description: Nome do usuário (opcional)
 *               usuarioTelefone:
 *                 type: string
 *                 description: Telefone do usuário (opcional)
 *               comprovante:
 *                 type: string
 *                 description: URL do comprovante (opcional)
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transacao'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      tipo: z.enum(['RECARGA', 'UTILIZACAO']),
      valor: z.number().min(0.01),
      cartaoId: z.string().min(1),
      estabelecimentoId: z.string().min(1),
      usuarioNome: z.string().optional(),
      usuarioTelefone: z.string().optional(),
      comprovante: z.string().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se o cartão existe e está ativo
    const cartao = await prisma.cartoes.findUnique({
      where: { id: data.cartaoId },
      include: {
        franqueados: {
          select: { comissionRate: true }
        }
      }
    });

    if (!cartao) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões baseadas no tipo de usuário
    if (user.type === 'FRANQUEADO' && user.franqueadoId !== cartao.franqueadoId) {
      return NextResponse.json(
        { error: 'Sem permissão para este cartão' },
        { status: 403 }
      );
    }

    if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId !== data.estabelecimentoId) {
      return NextResponse.json(
        { error: 'Sem permissão para este estabelecimento' },
        { status: 403 }
      );
    }

    // Verificar se o estabelecimento existe
    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id: data.estabelecimentoId }
    });

    if (!estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    // Gerar ID único
    const transacaoId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar transação usando transação do banco
    const result = await prisma.$transaction(async (tx) => {
      // Criar a transação
      const novaTransacao = await tx.transacoes.create({
        data: {
          id: transacaoId,
          ...data,
          status: 'PENDENTE',
          updatedAt: new Date()
        },
        include: {
          cartoes: {
            select: {
              id: true,
              codigo: true,
              franqueados: {
                select: {
                  id: true,
                  name: true
                }
              }
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
      });

      // Se for utilização, verificar e debitar do cartão
      if (data.tipo === 'UTILIZACAO') {
        if (cartao.valor < data.valor) {
          throw new Error('Saldo insuficiente no cartão');
        }

        await tx.cartoes.update({
          where: { id: data.cartaoId },
          data: {
            valor: { decrement: data.valor },
            status: 'ATIVO',
            dataUtilizacao: new Date()
          }
        });

        // Criar comissão para o franqueado
        const valorComissao = data.valor * (cartao.franqueados.comissionRate / 100);
        const comissaoId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await tx.comissoes.create({
          data: {
            id: comissaoId,
            valor: valorComissao,
            percentual: cartao.franqueados.comissionRate,
            franqueadoId: cartao.franqueadoId,
            estabelecimentoId: data.estabelecimentoId,
            transacaoId: transacaoId,
            status: 'PENDENTE',
            updatedAt: new Date()
          }
        });
      }

      // Se for recarga, creditar no cartão
      if (data.tipo === 'RECARGA') {
        await tx.cartoes.update({
          where: { id: data.cartaoId },
          data: {
            valor: { increment: data.valor },
            status: 'ATIVO',
            dataAtivacao: cartao.dataAtivacao || new Date()
          }
        });
      }

      // Atualizar status da transação para CONCLUIDA
      const transacaoFinal = await tx.transacoes.update({
        where: { id: transacaoId },
        data: { status: 'CONCLUIDA' },
        include: {
          cartoes: {
            select: {
              id: true,
              codigo: true,
              valor: true,
              status: true,
              franqueados: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          estabelecimentos: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          comissoes: {
            select: {
              id: true,
              valor: true,
              status: true
            }
          }
        }
      });

      return transacaoFinal;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar transação:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: message },
      { status: message === 'Saldo insuficiente no cartão' ? 400 : 500 }
    );
  }
}
