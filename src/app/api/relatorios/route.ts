import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/relatorios:
 *   get:
 *     tags: [Relatórios]
 *     summary: Listar relatórios
 *     description: Retorna lista paginada de relatórios gerados
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
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [FINANCEIRO, OPERACIONAL, AUDITORIA, VENDAS, COMISSOES, CARTOES]
 *         description: Filtrar por tipo de relatório
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [DIARIO, SEMANAL, MENSAL, ANUAL, PERSONALIZADO]
 *         description: Filtrar por período
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
 *         description: Lista de relatórios
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
    const tipo = searchParams.get('tipo');
    const periodo = searchParams.get('periodo');
    const dataInicio = searchParams.get('dataInicio') || undefined;
    const dataFim = searchParams.get('dataFim') || undefined;

    const skip = (page - 1) * limit;

    // Gerar relatórios dinâmicos baseado no tipo
    let relatorios = [];
    let total = 0;

    if (!tipo || tipo === 'FINANCEIRO') {
      const financeiro = await gerarRelatorioFinanceiro(user, dataInicio, dataFim);
      relatorios.push(financeiro);
    }

    if (!tipo || tipo === 'OPERACIONAL') {
      const operacional = await gerarRelatorioOperacional(user, dataInicio, dataFim);
      relatorios.push(operacional);
    }

    if (!tipo || tipo === 'AUDITORIA') {
      const auditoria = await gerarRelatorioAuditoria(user, dataInicio, dataFim);
      relatorios.push(auditoria);
    }

    if (!tipo || tipo === 'VENDAS') {
      const vendas = await gerarRelatorioVendas(user, dataInicio, dataFim);
      relatorios.push(vendas);
    }

    if (!tipo || tipo === 'COMISSOES') {
      const comissoes = await gerarRelatorioComissoes(user, dataInicio, dataFim);
      relatorios.push(comissoes);
    }

    if (!tipo || tipo === 'CARTOES') {
      const cartoes = await gerarRelatorioCartoes(user, dataInicio, dataFim);
      relatorios.push(cartoes);
    }

    total = relatorios.length;

    // Aplicar paginação
    const paginatedRelatorios = relatorios.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedRelatorios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/relatorios:
 *   post:
 *     tags: [Relatórios]
 *     summary: Gerar novo relatório
 *     description: Gera um novo relatório personalizado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, periodo]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [FINANCEIRO, OPERACIONAL, AUDITORIA, VENDAS, COMISSOES, CARTOES]
 *                 description: Tipo do relatório
 *               periodo:
 *                 type: string
 *                 enum: [DIARIO, SEMANAL, MENSAL, ANUAL, PERSONALIZADO]
 *                 description: Período do relatório
 *               dataInicio:
 *                 type: string
 *                 format: date
 *                 description: Data de início (obrigatório para PERSONALIZADO)
 *               dataFim:
 *                 type: string
 *                 format: date
 *                 description: Data de fim (obrigatório para PERSONALIZADO)
 *               filtros:
 *                 type: object
 *                 description: Filtros específicos do relatório
 *     responses:
 *       201:
 *         description: Relatório gerado com sucesso
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
      tipo: z.enum(['FINANCEIRO', 'OPERACIONAL', 'AUDITORIA', 'VENDAS', 'COMISSOES', 'CARTOES']),
      periodo: z.enum(['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'PERSONALIZADO']),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      filtros: z.record(z.string(), z.any()).optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tipo, periodo, dataInicio, dataFim, filtros } = validation.data;

    // Validar datas para período personalizado
    if (periodo === 'PERSONALIZADO' && (!dataInicio || !dataFim)) {
      return NextResponse.json(
        { error: 'Para período personalizado, dataInicio e dataFim são obrigatórios' },
        { status: 400 }
      );
    }

    // Calcular datas baseado no período
    let startDate: string | undefined, endDate: string | undefined;

    if (periodo !== 'PERSONALIZADO') {
      const dates = calcularDatasPeriodo(periodo);
      startDate = dates.startDate;
      endDate = dates.endDate;
    } else {
      startDate = dataInicio;
      endDate = dataFim;
    }

    // Gerar relatório baseado no tipo
    let relatorio;
    
    switch (tipo) {
      case 'FINANCEIRO':
        relatorio = await gerarRelatorioFinanceiro(user, startDate, endDate, filtros);
        break;
      case 'OPERACIONAL':
        relatorio = await gerarRelatorioOperacional(user, startDate, endDate, filtros);
        break;
      case 'AUDITORIA':
        relatorio = await gerarRelatorioAuditoria(user, startDate, endDate, filtros);
        break;
      case 'VENDAS':
        relatorio = await gerarRelatorioVendas(user, startDate, endDate, filtros);
        break;
      case 'COMISSOES':
        relatorio = await gerarRelatorioComissoes(user, startDate, endDate, filtros);
        break;
      case 'CARTOES':
        relatorio = await gerarRelatorioCartoes(user, startDate, endDate, filtros);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de relatório não suportado' },
          { status: 400 }
        );
    }

    return NextResponse.json(relatorio, { status: 201 });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares para gerar relatórios

async function gerarRelatorioFinanceiro(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where = construirWhereUsuario(user);
  
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [transacoes, comissoes] = await Promise.all([
    prisma.transacoes.aggregate({
      where,
      _sum: { valor: true },
      _count: { id: true }
    }),
    prisma.comissoes.aggregate({
      where: {
        ...where,
        status: 'PAGA'
      },
      _sum: { valor: true },
      _count: { id: true }
    })
  ]);

  return {
    id: `fin_${Date.now()}`,
    tipo: 'FINANCEIRO',
    titulo: 'Relatório Financeiro',
    descricao: 'Resumo financeiro de transações e comissões',
    geradoEm: new Date(),
    dados: {
      transacoes: {
        total: transacoes._count.id || 0,
        volume: transacoes._sum.valor || 0
      },
      comissoes: {
        total: comissoes._count.id || 0,
        volume: comissoes._sum.valor || 0
      },
      lucroLiquido: (transacoes._sum.valor || 0) - (comissoes._sum.valor || 0)
    }
  };
}

async function gerarRelatorioOperacional(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where = construirWhereUsuario(user);
  
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [cartoes, estabelecimentos, displays] = await Promise.all([
    prisma.cartoes.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.estabelecimentos.count({
      where: user.type === 'FRANQUEADO' ? { franqueadoId: user.franqueadoId } : {}
    }),
    prisma.displays.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    })
  ]);

  const statusCartoes = cartoes.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  const statusDisplays = displays.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  return {
    id: `op_${Date.now()}`,
    tipo: 'OPERACIONAL',
    titulo: 'Relatório Operacional',
    descricao: 'Status operacional de cartões, estabelecimentos e displays',
    geradoEm: new Date(),
    dados: {
      cartoes: statusCartoes,
      estabelecimentos: estabelecimentos,
      displays: statusDisplays
    }
  };
}

async function gerarRelatorioAuditoria(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where: any = {};
  
  if (user.type === 'FRANQUEADO' && user.franqueadoId) {
    where.franqueadoId = user.franqueadoId;
  }

  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const logs = await prisma.logs.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      acao: true,
      entidade: true,
      createdAt: true,
      userId: true
    }
  });

  const acoesPorEntidade = logs.reduce((acc, log) => {
    if (!acc[log.entidade]) acc[log.entidade] = {};
    if (!acc[log.entidade][log.acao]) acc[log.entidade][log.acao] = 0;
    acc[log.entidade][log.acao]++;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return {
    id: `aud_${Date.now()}`,
    tipo: 'AUDITORIA',
    titulo: 'Relatório de Auditoria',
    descricao: 'Log de atividades e alterações no sistema',
    geradoEm: new Date(),
    dados: {
      totalLogs: logs.length,
      acoesPorEntidade,
      ultimasAtividades: logs.slice(0, 10)
    }
  };
}

async function gerarRelatorioVendas(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where = construirWhereUsuario(user);
  where.tipo = 'UTILIZACAO'; // Só vendas (utilizações)
  
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const vendas = await prisma.transacoes.aggregate({
    where,
    _sum: { valor: true },
    _count: { id: true },
    _avg: { valor: true }
  });

  return {
    id: `vnd_${Date.now()}`,
    tipo: 'VENDAS',
    titulo: 'Relatório de Vendas',
    descricao: 'Análise de vendas e utilizações de cartões',
    geradoEm: new Date(),
    dados: {
      totalVendas: vendas._count.id || 0,
      volumeVendas: vendas._sum.valor || 0,
      ticketMedio: vendas._avg.valor || 0
    }
  };
}

async function gerarRelatorioComissoes(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where = construirWhereUsuario(user);
  
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const comissoes = await prisma.comissoes.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
    _sum: { valor: true }
  });

  const statusComissoes = comissoes.reduce((acc, item) => {
    acc[item.status] = {
      count: item._count.status,
      valor: item._sum.valor || 0
    };
    return acc;
  }, {} as Record<string, { count: number; valor: number }>);

  return {
    id: `com_${Date.now()}`,
    tipo: 'COMISSOES',
    titulo: 'Relatório de Comissões',
    descricao: 'Status e valores de comissões',
    geradoEm: new Date(),
    dados: {
      porStatus: statusComissoes
    }
  };
}

async function gerarRelatorioCartoes(user: any, dataInicio?: string, dataFim?: string, filtros?: any) {
  const where = construirWhereUsuario(user);
  
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) {
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [cartoes, valorTotal] = await Promise.all([
    prisma.cartoes.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.cartoes.aggregate({
      where,
      _sum: { valor: true }
    })
  ]);

  const statusCartoes = cartoes.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  return {
    id: `crt_${Date.now()}`,
    tipo: 'CARTOES',
    titulo: 'Relatório de Cartões',
    descricao: 'Status e estatísticas de cartões',
    geradoEm: new Date(),
    dados: {
      porStatus: statusCartoes,
      valorTotalEmCirculacao: valorTotal._sum.valor || 0
    }
  };
}

function construirWhereUsuario(user: any): any {
  const where: any = {};
  
  if (user.type === 'FRANQUEADO' && user.franqueadoId) {
    where.cartoes = {
      franqueadoId: user.franqueadoId
    };
  } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
    where.estabelecimentoId = user.estabelecimentoId;
  }
  
  return where;
}

function calcularDatasPeriodo(periodo: string): { startDate: string; endDate: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date, endDate: Date;

  switch (periodo) {
    case 'DIARIO':
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'SEMANAL':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Início da semana (domingo)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'MENSAL':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'ANUAL':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = today;
      endDate = today;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}
