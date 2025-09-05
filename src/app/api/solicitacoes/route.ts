import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/solicitacoes:
 *   get:
 *     tags: [Solicitações]
 *     summary: Listar solicitações
 *     description: Retorna lista paginada de solicitações de cartões
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
 *         description: Buscar por nome do estabelecimento ou franqueado
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, APROVADA, NEGADA, ENVIADA, ENTREGUE]
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
 *         description: Lista de solicitações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Solicitacao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalQuantidade:
 *                       type: integer
 *                     porStatus:
 *                       type: object
 *                     tempoMedio:
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
          estabelecimentos: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          franqueados: {
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

    // Buscar solicitações
    const [solicitacoes, total] = await Promise.all([
      prisma.solicitacoes_cartao.findMany({
        where,
        include: {
          estabelecimentos: {
            select: {
              id: true,
              name: true,
              cnpj: true,
              category: true,
              address: true
            }
          },
          franqueados: {
            select: {
              id: true,
              name: true,
              region: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.solicitacoes_cartao.count({ where })
    ]);

    // Calcular estatísticas
    const summary = await prisma.solicitacoes_cartao.aggregate({
      where,
      _count: { id: true },
      _sum: { quantidade: true }
    });

    // Estatísticas por status
    const statusStats = await prisma.solicitacoes_cartao.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { quantidade: true }
    });

    const porStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        quantidade: stat._sum.quantidade || 0
      };
      return acc;
    }, {} as Record<string, { count: number; quantidade: number }>);

    // Calcular tempo médio (aproximado) entre criação e entrega
    const solicitacoesEntregues = await prisma.solicitacoes_cartao.findMany({
      where: {
        ...where,
        status: 'ENTREGUE',
        dataEntrega: { not: null }
      },
      select: {
        createdAt: true,
        dataEntrega: true
      }
    });

    let tempoMedio = 0;
    if (solicitacoesEntregues.length > 0) {
      const totalDias = solicitacoesEntregues.reduce((acc, sol) => {
        if (sol.dataEntrega) {
          const diffTime = sol.dataEntrega.getTime() - sol.createdAt.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          return acc + diffDays;
        }
        return acc;
      }, 0);
      tempoMedio = totalDias / solicitacoesEntregues.length;
    }

    return NextResponse.json({
      data: solicitacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total: summary._count.id || 0,
        totalQuantidade: summary._sum.quantidade || 0,
        porStatus,
        tempoMedio: Math.round(tempoMedio * 10) / 10 // Arredondar para 1 casa decimal
      }
    });

  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/solicitacoes:
 *   post:
 *     tags: [Solicitações]
 *     summary: Criar nova solicitação
 *     description: Cria uma nova solicitação de cartões
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantidade, estabelecimentoId, franqueadoId]
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 description: Quantidade de cartões solicitados
 *               estabelecimentoId:
 *                 type: string
 *                 description: ID do estabelecimento
 *               franqueadoId:
 *                 type: string
 *                 description: ID do franqueado
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre a solicitação
 *     responses:
 *       201:
 *         description: Solicitação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Solicitacao'
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
      quantidade: z.number().int().min(1).max(1000),
      estabelecimentoId: z.string().min(1),
      franqueadoId: z.string().min(1),
      observacoes: z.string().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar permissões baseadas no tipo de usuário
    if (user.type === 'FRANQUEADO' && user.franqueadoId !== data.franqueadoId) {
      return NextResponse.json(
        { error: 'Sem permissão para criar solicitação para este franqueado' },
        { status: 403 }
      );
    }

    if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId !== data.estabelecimentoId) {
      return NextResponse.json(
        { error: 'Sem permissão para criar solicitação para este estabelecimento' },
        { status: 403 }
      );
    }

    // Verificar se o estabelecimento e franqueado existem
    const [estabelecimento, franqueado] = await Promise.all([
      prisma.estabelecimentos.findUnique({ where: { id: data.estabelecimentoId } }),
      prisma.franqueados.findUnique({ where: { id: data.franqueadoId } })
    ]);

    if (!estabelecimento || !franqueado) {
      return NextResponse.json(
        { error: 'Estabelecimento ou franqueado não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o estabelecimento pertence ao franqueado
    if (estabelecimento.franqueadoId !== data.franqueadoId) {
      return NextResponse.json(
        { error: 'Estabelecimento não pertence ao franqueado informado' },
        { status: 400 }
      );
    }

    // Gerar ID único
    const solicitacaoId = `sol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar solicitação
    const novaSolicitacao = await prisma.solicitacoes_cartao.create({
      data: {
        id: solicitacaoId,
        quantidade: data.quantidade,
        estabelecimentoId: data.estabelecimentoId,
        franqueadoId: data.franqueadoId,
        observacoes: data.observacoes,
        status: 'PENDENTE',
        updatedAt: new Date()
      },
      include: {
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true
          }
        },
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        }
      }
    });

    return NextResponse.json(novaSolicitacao, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
