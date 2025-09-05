import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/displays:
 *   get:
 *     tags: [Displays]
 *     summary: Listar displays
 *     description: Retorna lista paginada de displays
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
 *           enum: [DISPONIVEL, INSTALADO, MANUTENCAO]
 *         description: Filtrar por status
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [BALCAO, PAREDE, MESA]
 *         description: Filtrar por tipo
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
 *         description: Lista de displays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Display'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porStatus:
 *                       type: object
 *                     porTipo:
 *                       type: object
 *                     porLocal:
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
    if (tipo) where.tipo = tipo;
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

    // Buscar displays
    const [displays, total] = await Promise.all([
      prisma.displays.findMany({
        where,
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
      prisma.displays.count({ where })
    ]);

    // Calcular estatísticas
    const summary = await prisma.displays.aggregate({
      where,
      _count: { id: true }
    });

    // Estatísticas por status
    const statusStats = await prisma.displays.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    const porStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Estatísticas por tipo
    const tipoStats = await prisma.displays.groupBy({
      by: ['tipo'],
      where,
      _count: { tipo: true }
    });

    const porTipo = tipoStats.reduce((acc, stat) => {
      acc[stat.tipo] = stat._count.tipo;
      return acc;
    }, {} as Record<string, number>);

    // Estatísticas por local (estabelecimento)
    const localStats = await prisma.displays.groupBy({
      by: ['estabelecimentoId'],
      where: {
        ...where,
        estabelecimentoId: { not: null }
      },
      _count: { estabelecimentoId: true }
    });

    return NextResponse.json({
      data: displays,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total: summary._count.id || 0,
        porStatus,
        porTipo,
        totalInstalados: localStats.reduce((acc, stat) => acc + stat._count.estabelecimentoId, 0),
        totalDisponiveis: porStatus['DISPONIVEL'] || 0,
        totalManutencao: porStatus['MANUTENCAO'] || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar displays:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/displays:
 *   post:
 *     tags: [Displays]
 *     summary: Criar novo display
 *     description: Cria um novo display no sistema
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, franqueadoId]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [BALCAO, PAREDE, MESA]
 *                 description: Tipo do display
 *               franqueadoId:
 *                 type: string
 *                 description: ID do franqueado responsável
 *               estabelecimentoId:
 *                 type: string
 *                 description: ID do estabelecimento (se já instalado)
 *               dataInstalacao:
 *                 type: string
 *                 format: date-time
 *                 description: Data de instalação (se aplicável)
 *     responses:
 *       201:
 *         description: Display criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Display'
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
      tipo: z.enum(['BALCAO', 'PAREDE', 'MESA']),
      franqueadoId: z.string().min(1),
      estabelecimentoId: z.string().optional(),
      dataInstalacao: z.string().datetime().optional()
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
        { error: 'Sem permissão para criar display para este franqueado' },
        { status: 403 }
      );
    }

    if (user.type === 'ESTABELECIMENTO') {
      return NextResponse.json(
        { error: 'Estabelecimentos não podem criar displays' },
        { status: 403 }
      );
    }

    // Verificar se o franqueado existe
    const franqueado = await prisma.franqueados.findUnique({
      where: { id: data.franqueadoId }
    });

    if (!franqueado) {
      return NextResponse.json(
        { error: 'Franqueado não encontrado' },
        { status: 404 }
      );
    }

    // Se especificou estabelecimento, verificar se existe e pertence ao franqueado
    if (data.estabelecimentoId) {
      const estabelecimento = await prisma.estabelecimentos.findUnique({
        where: { id: data.estabelecimentoId }
      });

      if (!estabelecimento) {
        return NextResponse.json(
          { error: 'Estabelecimento não encontrado' },
          { status: 404 }
        );
      }

      if (estabelecimento.franqueadoId !== data.franqueadoId) {
        return NextResponse.json(
          { error: 'Estabelecimento não pertence ao franqueado informado' },
          { status: 400 }
        );
      }
    }

    // Gerar ID único
    const displayId = `dsp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determinar status baseado nos dados fornecidos
    let status: 'DISPONIVEL' | 'INSTALADO' = 'DISPONIVEL';
    if (data.estabelecimentoId || data.dataInstalacao) {
      status = 'INSTALADO';
    }

    // Converter data se fornecida
    const dataInstalacao = data.dataInstalacao ? new Date(data.dataInstalacao) : null;

    // Criar display
    const novoDisplay = await prisma.displays.create({
      data: {
        id: displayId,
        tipo: data.tipo,
        franqueadoId: data.franqueadoId,
        estabelecimentoId: data.estabelecimentoId || null,
        status,
        dataInstalacao,
        updatedAt: new Date()
      },
      include: {
        estabelecimentos: data.estabelecimentoId ? {
          select: {
            id: true,
            name: true,
            category: true,
            address: true
          }
        } : undefined,
        franqueados: {
          select: {
            id: true,
            name: true,
            region: true
          }
        }
      }
    });

    return NextResponse.json(novoDisplay, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar display:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
