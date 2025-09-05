import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/configuracoes:
 *   get:
 *     tags: [Configurações]
 *     summary: Listar configurações do sistema
 *     description: Retorna lista de configurações do sistema
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
 *         description: Buscar por chave ou descrição
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [TEXTO, NUMERO, BOOLEAN, JSON]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: modulo
 *         schema:
 *           type: string
 *         description: Filtrar por módulo
 *     responses:
 *       200:
 *         description: Lista de configurações
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
 *                     porTipo:
 *                       type: object
 *                     porModulo:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔧 API: Iniciando busca de configurações...')

    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Apenas franqueadoras podem acessar configurações
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para acessar configurações' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const skip = (page - 1) * limit;

    console.log('📊 Parâmetros:', { page, limit, skip })

    // Buscar configurações
    console.log('🔍 Buscando configurações no banco...')
    
    const [configuracoes, total] = await Promise.all([
      prisma.configuracoes.findMany({
        orderBy: { chave: 'asc' },
        skip,
        take: limit
      }),
      prisma.configuracoes.count()
    ]);

    console.log('✅ Configurações encontradas:', configuracoes.length, 'Total:', total)

    return NextResponse.json({
      data: configuracoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/configuracoes:
 *   post:
 *     tags: [Configurações]
 *     summary: Criar nova configuração
 *     description: Cria uma nova configuração do sistema (apenas franqueadoras)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chave, valor, tipo]
 *             properties:
 *               chave:
 *                 type: string
 *                 description: Chave única da configuração (ex: sistema.nome_empresa)
 *               valor:
 *                 type: string
 *                 description: Valor da configuração
 *               tipo:
 *                 type: string
 *                 enum: [TEXTO, NUMERO, BOOLEAN, JSON]
 *                 description: Tipo da configuração
 *               descricao:
 *                 type: string
 *                 description: Descrição da configuração
 *     responses:
 *       201:
 *         description: Configuração criada com sucesso
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

    // Apenas franqueadoras podem criar configurações
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para criar configurações' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      chave: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.]+$/, 'Chave deve conter apenas letras, números, pontos e underscores'),
      valor: z.string().min(0),
      tipo: z.enum(['TEXTO', 'NUMERO', 'BOOLEAN', 'JSON']),
      descricao: z.string().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { chave, valor, tipo, descricao } = validation.data;

    // Validar valor baseado no tipo
    if (tipo === 'NUMERO' && isNaN(Number(valor))) {
      return NextResponse.json(
        { error: 'Valor deve ser um número válido para tipo NUMERO' },
        { status: 400 }
      );
    }

    if (tipo === 'BOOLEAN' && !['true', 'false'].includes(valor.toLowerCase())) {
      return NextResponse.json(
        { error: 'Valor deve ser "true" ou "false" para tipo BOOLEAN' },
        { status: 400 }
      );
    }

    if (tipo === 'JSON') {
      try {
        JSON.parse(valor);
      } catch {
        return NextResponse.json(
          { error: 'Valor deve ser um JSON válido para tipo JSON' },
          { status: 400 }
        );
      }
    }

    // Verificar se a chave já existe
    const configExistente = await prisma.configuracoes.findUnique({
      where: { chave }
    });

    if (configExistente) {
      // Se existe, atualizar ao invés de criar
      const configAtualizada = await prisma.configuracoes.update({
        where: { chave },
        data: {
          valor,
          tipo,
          descricao,
          updatedAt: new Date()
        }
      });

      // Criar log da atualização
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.logs.create({
        data: {
          id: logId,
          acao: 'UPDATE',
          entidade: 'configuracoes',
          entidadeId: configExistente.id,
          dadosAnteriores: {
            valor: configExistente.valor,
            tipo: configExistente.tipo,
            descricao: configExistente.descricao
          },
          dadosNovos: {
            valor,
            tipo,
            descricao
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          userId: user.id
        }
      });

      return NextResponse.json(configAtualizada, { status: 200 });
    }

    // Gerar ID único
    const configId = `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar configuração
    const novaConfig = await prisma.configuracoes.create({
      data: {
        id: configId,
        chave,
        valor,
        tipo,
        descricao,
        updatedAt: new Date()
      }
    });

    // Criar log da criação
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'CREATE',
        entidade: 'configuracoes',
        entidadeId: configId,
        dadosAnteriores: {},
        dadosNovos: {
          chave,
          valor,
          tipo,
          descricao
        },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id
      }
    });

    return NextResponse.json(novaConfig, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
