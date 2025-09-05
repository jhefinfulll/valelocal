import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/transacoes/{id}:
 *   get:
 *     tags: [Transações]
 *     summary: Obter transação por ID
 *     description: Retorna dados detalhados de uma transação específica
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da transação
 *     responses:
 *       200:
 *         description: Dados da transação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transacao'
 *       404:
 *         description: Transação não encontrada
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
      where.cartoes = {
        franqueadoId: user.franqueadoId
      };
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const transacao = await prisma.transacoes.findFirst({
      where,
      include: {
        cartoes: {
          select: {
            id: true,
            codigo: true,
            qrCode: true,
            valor: true,
            status: true,
            dataAtivacao: true,
            dataUtilizacao: true,
            franqueados: {
              select: {
                id: true,
                name: true,
                region: true,
                email: true,
                phone: true
              }
            }
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
        comissoes: {
          select: {
            id: true,
            valor: true,
            percentual: true,
            status: true,
            createdAt: true
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

    if (!transacao) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(transacao);

  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transacoes/{id}:
 *   put:
 *     tags: [Transações]
 *     summary: Atualizar transação
 *     description: Atualiza dados de uma transação (limitado a alguns campos)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da transação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, CONCLUIDA, CANCELADA]
 *                 description: Novo status da transação
 *               usuarioNome:
 *                 type: string
 *                 description: Nome do usuário
 *               usuarioTelefone:
 *                 type: string
 *                 description: Telefone do usuário
 *               comprovante:
 *                 type: string
 *                 description: URL do comprovante
 *     responses:
 *       200:
 *         description: Transação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transacao'
 *       404:
 *         description: Transação não encontrada
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
      status: z.enum(['PENDENTE', 'CONCLUIDA', 'CANCELADA']).optional(),
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

    // Verificar se a transação existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.cartoes = {
        franqueadoId: user.franqueadoId
      };
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const transacaoExistente = await prisma.transacoes.findFirst({
      where,
      include: {
        cartoes: true
      }
    });

    if (!transacaoExistente) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir alterar transações já concluídas ou canceladas
    if (transacaoExistente.status !== 'PENDENTE' && data.status) {
      return NextResponse.json(
        { error: 'Não é possível alterar o status de uma transação já processada' },
        { status: 400 }
      );
    }

    // Salvar dados anteriores para log
    const dadosAnteriores = {
      status: transacaoExistente.status,
      usuarioNome: transacaoExistente.usuarioNome,
      usuarioTelefone: transacaoExistente.usuarioTelefone,
      comprovante: transacaoExistente.comprovante
    };

    // Atualizar transação
    const transacaoAtualizada = await prisma.transacoes.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
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

    // Criar log da alteração
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'UPDATE',
        entidade: 'transacoes',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: data,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        transacaoId: id
      }
    });

    return NextResponse.json(transacaoAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transacoes/{id}:
 *   delete:
 *     tags: [Transações]
 *     summary: Cancelar transação
 *     description: Cancela uma transação (apenas se estiver pendente)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da transação
 *     responses:
 *       200:
 *         description: Transação cancelada com sucesso
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
 *         description: Transação não encontrada
 *       400:
 *         description: Transação não pode ser cancelada
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

    const { id } = await params;

    // Verificar se a transação existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.cartoes = {
        franqueadoId: user.franqueadoId
      };
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const transacao = await prisma.transacoes.findFirst({
      where,
      include: {
        cartoes: true,
        comissoes: true
      }
    });

    if (!transacao) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Só permitir cancelar transações pendentes
    if (transacao.status !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Apenas transações pendentes podem ser canceladas' },
        { status: 400 }
      );
    }

    // Cancelar transação usando transação do banco
    await prisma.$transaction(async (tx) => {
      // Atualizar status da transação
      await tx.transacoes.update({
        where: { id },
        data: {
          status: 'CANCELADA',
          updatedAt: new Date()
        }
      });

      // Se tinha comissões pendentes, cancelá-las também
      if (transacao.comissoes.length > 0) {
        await tx.comissoes.updateMany({
          where: { transacaoId: id },
          data: {
            status: 'CANCELADA',
            updatedAt: new Date()
          }
        });
      }

      // Criar log do cancelamento
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await tx.logs.create({
        data: {
          id: logId,
          acao: 'DELETE',
          entidade: 'transacoes',
          entidadeId: id,
          dadosAnteriores: { status: transacao.status },
          dadosNovos: { status: 'CANCELADA' },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          userId: user.id,
          transacaoId: id
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Transação cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
