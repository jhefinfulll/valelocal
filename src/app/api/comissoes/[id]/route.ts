import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/comissoes/{id}:
 *   get:
 *     tags: [Comissões]
 *     summary: Obter comissão por ID
 *     description: Retorna dados detalhados de uma comissão específica
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da comissão
 *     responses:
 *       200:
 *         description: Dados da comissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comissao'
 *       404:
 *         description: Comissão não encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { id } = await params;

    // Construir where baseado no tipo de usuário
    const where: any = { id };

    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const comissao = await prisma.comissoes.findFirst({
      where,
      include: {
        franqueados: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            region: true,
            comissionRate: true,
            status: true
          }
        },
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            category: true,
            status: true
          }
        },
        transacoes: {
          select: {
            id: true,
            tipo: true,
            valor: true,
            status: true,
            usuarioNome: true,
            usuarioTelefone: true,
            createdAt: true,
            updatedAt: true,
            cartoes: {
              select: {
                id: true,
                codigo: true,
                valor: true,
                status: true
              }
            }
          }
        },
        logs: {
          select: {
            id: true,
            acao: true,
            dadosAnteriores: true,
            dadosNovos: true,
            createdAt: true,
            ip: true,
            userAgent: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!comissao) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(comissao);

  } catch (error) {
    console.error('Erro ao buscar comissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/comissoes/{id}:
 *   put:
 *     tags: [Comissões]
 *     summary: Atualizar comissão
 *     description: Atualiza dados de uma comissão (principalmente o status de pagamento)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da comissão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, PAGA, CANCELADA]
 *                 description: Novo status da comissão
 *               valor:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Novo valor da comissão
 *               percentual:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Novo percentual
 *     responses:
 *       200:
 *         description: Comissão atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comissao'
 *       404:
 *         description: Comissão não encontrada
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      status: z.enum(['PENDENTE', 'PAGA', 'CANCELADA']).optional(),
      valor: z.number().min(0.01).optional(),
      percentual: z.number().min(0).max(100).optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se a comissão existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const comissaoExistente = await prisma.comissoes.findFirst({
      where
    });

    if (!comissaoExistente) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    // Estabelecimentos não podem alterar status de comissões
    if (user.type === 'ESTABELECIMENTO' && data.status) {
      return NextResponse.json(
        { error: 'Estabelecimentos não podem alterar o status de comissões' },
        { status: 403 }
      );
    }

    // Salvar dados anteriores para log
    const dadosAnteriores = {
      status: comissaoExistente.status,
      valor: comissaoExistente.valor,
      percentual: comissaoExistente.percentual
    };

    // Atualizar comissão
    const comissaoAtualizada = await prisma.comissoes.update({
      where: { id },
      data: {
        ...data,
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

    // Criar log da alteração
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'UPDATE',
        entidade: 'comissoes',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: data,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        comissaoId: id
      }
    });

    return NextResponse.json(comissaoAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar comissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/comissoes/{id}:
 *   delete:
 *     tags: [Comissões]
 *     summary: Cancelar comissão
 *     description: Cancela uma comissão (apenas franqueadoras podem fazer isso)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da comissão
 *     responses:
 *       200:
 *         description: Comissão cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Comissão não encontrada
 *       403:
 *         description: Sem permissão para cancelar comissão
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Apenas franqueadoras podem cancelar comissões
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para cancelar comissões' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const comissao = await prisma.comissoes.findUnique({
      where: { id }
    });

    if (!comissao) {
      return NextResponse.json(
        { error: 'Comissão não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir cancelar comissões já pagas
    if (comissao.status === 'PAGA') {
      return NextResponse.json(
        { error: 'Não é possível cancelar uma comissão já paga' },
        { status: 400 }
      );
    }

    // Atualizar status para CANCELADA
    await prisma.comissoes.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        updatedAt: new Date()
      }
    });

    // Criar log do cancelamento
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'DELETE',
        entidade: 'comissoes',
        entidadeId: id,
        dadosAnteriores: { status: comissao.status },
        dadosNovos: { status: 'CANCELADA' },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        comissaoId: id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Comissão cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar comissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
