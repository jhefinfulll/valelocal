import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Listar logs do sistema
 *     description: Retorna lista paginada de logs de auditoria
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
 *         description: Buscar por ação ou entidade
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *         description: Filtrar por ação
 *       - in: query
 *         name: entidade
 *         schema:
 *           type: string
 *           enum: [franqueados, estabelecimentos, cartoes, transacoes, comissoes, displays, users]
 *         description: Filtrar por entidade
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
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
 *         description: Lista de logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porAcao:
 *                       type: object
 *                     porEntidade:
 *                       type: object
 *                     porUsuario:
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
    const acao = searchParams.get('acao');
    const entidade = searchParams.get('entidade');
    const userId = searchParams.get('userId');
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
          acao: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          entidade: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Filtros específicos
    if (acao) where.acao = acao;
    if (entidade) where.entidade = entidade;
    if (userId) where.userId = userId;

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

    // Buscar logs
    const [logs, total] = await Promise.all([
      prisma.logs.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.logs.count({ where })
    ]);

    // Calcular estatísticas
    const [acaoStats, entidadeStats, usuarioStats] = await Promise.all([
      prisma.logs.groupBy({
        by: ['acao'],
        where,
        _count: { acao: true }
      }),
      prisma.logs.groupBy({
        by: ['entidade'],
        where,
        _count: { entidade: true }
      }),
      prisma.logs.groupBy({
        by: ['userId'],
        where: {
          ...where,
          userId: { not: null }
        },
        _count: { userId: true }
      })
    ]);

    const porAcao = acaoStats.reduce((acc, stat) => {
      acc[stat.acao] = stat._count.acao;
      return acc;
    }, {} as Record<string, number>);

    const porEntidade = entidadeStats.reduce((acc, stat) => {
      acc[stat.entidade] = stat._count.entidade;
      return acc;
    }, {} as Record<string, number>);

    const porUsuario = usuarioStats.reduce((acc, stat) => {
      if (stat.userId) {
        acc[stat.userId] = stat._count.userId;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total,
        porAcao,
        porEntidade,
        porUsuario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/logs:
 *   delete:
 *     tags: [Logs]
 *     summary: Limpar logs antigos
 *     description: Remove logs mais antigos que um período especificado (apenas franqueadoras)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diasAntigos]
 *             properties:
 *               diasAntigos:
 *                 type: integer
 *                 minimum: 7
 *                 maximum: 365
 *                 description: Remover logs mais antigos que X dias
 *               confirmar:
 *                 type: boolean
 *                 description: Confirmação de que deseja remover os logs
 *     responses:
 *       200:
 *         description: Logs removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 removidos:
 *                   type: integer
 *       403:
 *         description: Sem permissão para limpar logs
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Apenas franqueadoras podem limpar logs
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para limpar logs' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      diasAntigos: z.number().int().min(7).max(365),
      confirmar: z.boolean()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { diasAntigos, confirmar } = validation.data;

    if (!confirmar) {
      return NextResponse.json(
        { error: 'É necessário confirmar a operação' },
        { status: 400 }
      );
    }

    // Calcular data limite
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasAntigos);

    // Contar quantos logs serão removidos
    const totalParaRemover = await prisma.logs.count({
      where: {
        createdAt: {
          lt: dataLimite
        }
      }
    });

    // Remover logs antigos
    const resultado = await prisma.logs.deleteMany({
      where: {
        createdAt: {
          lt: dataLimite
        }
      }
    });

    // Criar log da operação de limpeza
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'CLEANUP',
        entidade: 'logs',
        entidadeId: 'system',
        dadosAnteriores: {
          totalRemovidos: resultado.count,
          diasAntigos,
          dataLimite: dataLimite.toISOString()
        },
        dadosNovos: {},
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `${resultado.count} logs foram removidos com sucesso`,
      removidos: resultado.count,
      totalEsperado: totalParaRemover
    });

  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
