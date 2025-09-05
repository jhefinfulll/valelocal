import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/solicitacoes/{id}:
 *   get:
 *     tags: [Solicitações]
 *     summary: Obter solicitação por ID
 *     description: Retorna dados detalhados de uma solicitação específica
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação
 *     responses:
 *       200:
 *         description: Dados da solicitação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Solicitacao'
 *       404:
 *         description: Solicitação não encontrada
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

    const solicitacao = await prisma.solicitacoes_cartao.findFirst({
      where,
      include: {
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
        franqueados: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            region: true,
            status: true
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

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(solicitacao);

  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/solicitacoes/{id}:
 *   put:
 *     tags: [Solicitações]
 *     summary: Atualizar solicitação
 *     description: Atualiza dados de uma solicitação (status, datas, observações)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, APROVADA, NEGADA, ENVIADA, ENTREGUE]
 *                 description: Novo status da solicitação
 *               observacoes:
 *                 type: string
 *                 description: Observações atualizadas
 *               dataAprovacao:
 *                 type: string
 *                 format: date-time
 *                 description: Data de aprovação
 *               dataEnvio:
 *                 type: string
 *                 format: date-time
 *                 description: Data de envio
 *               dataEntrega:
 *                 type: string
 *                 format: date-time
 *                 description: Data de entrega
 *     responses:
 *       200:
 *         description: Solicitação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Solicitacao'
 *       404:
 *         description: Solicitação não encontrada
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
      status: z.enum(['PENDENTE', 'APROVADA', 'NEGADA', 'ENVIADA', 'ENTREGUE']).optional(),
      observacoes: z.string().optional(),
      dataAprovacao: z.string().datetime().optional(),
      dataEnvio: z.string().datetime().optional(),
      dataEntrega: z.string().datetime().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se a solicitação existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const solicitacaoExistente = await prisma.solicitacoes_cartao.findFirst({
      where
    });

    if (!solicitacaoExistente) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    // Estabelecimentos podem apenas atualizar observações
    if (user.type === 'ESTABELECIMENTO' && (data.status || data.dataAprovacao || data.dataEnvio || data.dataEntrega)) {
      return NextResponse.json(
        { error: 'Estabelecimentos podem apenas atualizar observações' },
        { status: 403 }
      );
    }

    // Validações de fluxo de status
    if (data.status) {
      const statusAtual = solicitacaoExistente.status;
      const novoStatus = data.status;

      // Validar transições de status
      const transicoesValidas: Record<string, string[]> = {
        'PENDENTE': ['APROVADA', 'NEGADA'],
        'APROVADA': ['ENVIADA'],
        'ENVIADA': ['ENTREGUE'],
        'NEGADA': [], // Status final
        'ENTREGUE': [] // Status final
      };

      if (!transicoesValidas[statusAtual]?.includes(novoStatus)) {
        return NextResponse.json(
          { error: `Não é possível alterar status de ${statusAtual} para ${novoStatus}` },
          { status: 400 }
        );
      }

      // Definir datas automaticamente baseado no status
      if (novoStatus === 'APROVADA' && !data.dataAprovacao) {
        data.dataAprovacao = new Date().toISOString();
      }
      if (novoStatus === 'ENVIADA' && !data.dataEnvio) {
        data.dataEnvio = new Date().toISOString();
      }
      if (novoStatus === 'ENTREGUE' && !data.dataEntrega) {
        data.dataEntrega = new Date().toISOString();
      }
    }

    // Salvar dados anteriores para log
    const dadosAnteriores = {
      status: solicitacaoExistente.status,
      observacoes: solicitacaoExistente.observacoes,
      dataAprovacao: solicitacaoExistente.dataAprovacao,
      dataEnvio: solicitacaoExistente.dataEnvio,
      dataEntrega: solicitacaoExistente.dataEntrega
    };

    // Converter datas string para Date
    const updateData: any = { ...data };
    if (data.dataAprovacao) updateData.dataAprovacao = new Date(data.dataAprovacao);
    if (data.dataEnvio) updateData.dataEnvio = new Date(data.dataEnvio);
    if (data.dataEntrega) updateData.dataEntrega = new Date(data.dataEntrega);

    // Atualizar solicitação
    const solicitacaoAtualizada = await prisma.solicitacoes_cartao.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        estabelecimentos: {
          select: {
            id: true,
            name: true,
            category: true
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

    // Criar log da alteração
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'UPDATE',
        entidade: 'solicitacoes_cartao',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: data,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        solicitacaoId: id
      }
    });

    return NextResponse.json(solicitacaoAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/solicitacoes/{id}:
 *   delete:
 *     tags: [Solicitações]
 *     summary: Cancelar solicitação
 *     description: Cancela uma solicitação (apenas se estiver pendente)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação
 *     responses:
 *       200:
 *         description: Solicitação cancelada com sucesso
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
 *         description: Solicitação não encontrada
 *       400:
 *         description: Solicitação não pode ser cancelada
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

    // Verificar se a solicitação existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
    }

    const solicitacao = await prisma.solicitacoes_cartao.findFirst({
      where
    });

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      );
    }

    // Só permitir cancelar solicitações pendentes
    if (solicitacao.status !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Apenas solicitações pendentes podem ser canceladas' },
        { status: 400 }
      );
    }

    // Atualizar status para NEGADA
    await prisma.solicitacoes_cartao.update({
      where: { id },
      data: {
        status: 'NEGADA',
        observacoes: solicitacao.observacoes 
          ? `${solicitacao.observacoes}\n\nCancelada pelo usuário em ${new Date().toLocaleString('pt-BR')}`
          : `Cancelada pelo usuário em ${new Date().toLocaleString('pt-BR')}`,
        updatedAt: new Date()
      }
    });

    // Criar log do cancelamento
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'DELETE',
        entidade: 'solicitacoes_cartao',
        entidadeId: id,
        dadosAnteriores: { status: solicitacao.status },
        dadosNovos: { status: 'NEGADA' },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        solicitacaoId: id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitação cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
