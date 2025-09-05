import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/comissoes:
 *   get:
 *     tags: [Comissões]
 *     summary: Listar comissões
 *     description: Retorna lista paginada de comissões com filtros
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
 *         description: Buscar por nome do franqueado ou estabelecimento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, PAGA, CANCELADA]
 *         description: Filtrar por status
 *       - in: query
 *         name: franqueadoId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do franqueado
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
 *         description: Lista de comissões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comissao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPendentes:
 *                       type: number
 *                     totalPagas:
 *                       type: number
 *                     valorMedio:
 *                       type: number
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
    const franqueadoId = searchParams.get('franqueadoId');
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
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    // Aplicar filtros de busca
    if (search) {
      where.OR = [
        {
          franqueados: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          estabelecimentos: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Filtros específicos
    if (status) where.status = status;
    if (franqueadoId) where.franqueadoId = franqueadoId;
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

    // Buscar comissões
    const [comissoes, total] = await Promise.all([
      prisma.comissoes.findMany({
        where,
        include: {
          franqueados: {
            select: {
              id: true,
              name: true,
              region: true,
              email: true,
              phone: true
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
          transacoes: {
            select: {
              id: true,
              tipo: true,
              valor: true,
              status: true,
              createdAt: true,
              cartoes: {
                select: {
                  codigo: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comissoes.count({ where })
    ]);

    // Calcular estatísticas
    const summary = await prisma.comissoes.aggregate({
      where,
      _count: { id: true },
      _sum: { valor: true },
      _avg: { valor: true }
    });

    // Estatísticas específicas
    const [pendentesStats, pagasStats] = await Promise.all([
      prisma.comissoes.aggregate({
        where: { ...where, status: 'PENDENTE' },
        _count: { id: true },
        _sum: { valor: true }
      }),
      prisma.comissoes.aggregate({
        where: { ...where, status: 'PAGA' },
        _count: { id: true },
        _sum: { valor: true }
      })
    ]);

    return NextResponse.json({
      data: comissoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total: summary._count.id || 0,
        totalPendentes: pendentesStats._sum.valor || 0,
        totalPagas: pagasStats._sum.valor || 0,
        valorMedio: summary._avg.valor || 0,
        countPendentes: pendentesStats._count.id || 0,
        countPagas: pagasStats._count.id || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar comissões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/comissoes:
 *   post:
 *     tags: [Comissões]
 *     summary: Criar nova comissão
 *     description: Cria uma nova comissão manualmente (geralmente são criadas automaticamente via transações)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [valor, percentual, franqueadoId, estabelecimentoId, transacaoId]
 *             properties:
 *               valor:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Valor da comissão
 *               percentual:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Percentual aplicado
 *               franqueadoId:
 *                 type: string
 *                 description: ID do franqueado
 *               estabelecimentoId:
 *                 type: string
 *                 description: ID do estabelecimento
 *               transacaoId:
 *                 type: string
 *                 description: ID da transação relacionada
 *     responses:
 *       201:
 *         description: Comissão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comissao'
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

    // Apenas franqueadoras podem criar comissões manualmente
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para criar comissões' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      valor: z.number().min(0.01),
      percentual: z.number().min(0).max(100),
      franqueadoId: z.string().min(1),
      estabelecimentoId: z.string().min(1),
      transacaoId: z.string().min(1)
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se a transação existe
    const transacao = await prisma.transacoes.findUnique({
      where: { id: data.transacaoId }
    });

    if (!transacao) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe comissão para esta transação
    const comissaoExistente = await prisma.comissoes.findFirst({
      where: { transacaoId: data.transacaoId }
    });

    if (comissaoExistente) {
      return NextResponse.json(
        { error: 'Já existe uma comissão para esta transação' },
        { status: 400 }
      );
    }

    // Verificar se o franqueado e estabelecimento existem
    const [franqueado, estabelecimento] = await Promise.all([
      prisma.franqueados.findUnique({ where: { id: data.franqueadoId } }),
      prisma.estabelecimentos.findUnique({ where: { id: data.estabelecimentoId } })
    ]);

    if (!franqueado || !estabelecimento) {
      return NextResponse.json(
        { error: 'Franqueado ou estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    // Gerar ID único
    const comissaoId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar comissão
    const novaComissao = await prisma.comissoes.create({
      data: {
        id: comissaoId,
        ...data,
        status: 'PENDENTE',
        updatedAt: new Date()
      },
      include: {
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
        transacoes: {
          select: {
            id: true,
            tipo: true,
            valor: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(novaComissao, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar comissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
