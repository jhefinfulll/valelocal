import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/displays/{id}:
 *   get:
 *     tags: [Displays]
 *     summary: Obter display por ID
 *     description: Retorna dados detalhados de um display específico
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do display
 *     responses:
 *       200:
 *         description: Dados do display
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Display'
 *       404:
 *         description: Display não encontrado
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

    const display = await prisma.displays.findFirst({
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

    if (!display) {
      return NextResponse.json(
        { error: 'Display não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(display);

  } catch (error) {
    console.error('Erro ao buscar display:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/displays/{id}:
 *   put:
 *     tags: [Displays]
 *     summary: Atualizar display
 *     description: Atualiza dados de um display (status, localização, etc.)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do display
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DISPONIVEL, INSTALADO, MANUTENCAO]
 *                 description: Novo status do display
 *               tipo:
 *                 type: string
 *                 enum: [BALCAO, PAREDE, MESA]
 *                 description: Tipo do display
 *               estabelecimentoId:
 *                 type: string
 *                 description: ID do estabelecimento onde será instalado
 *               dataInstalacao:
 *                 type: string
 *                 format: date-time
 *                 description: Data de instalação
 *     responses:
 *       200:
 *         description: Display atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Display'
 *       404:
 *         description: Display não encontrado
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
      status: z.enum(['DISPONIVEL', 'INSTALADO', 'MANUTENCAO']).optional(),
      tipo: z.enum(['BALCAO', 'PAREDE', 'MESA']).optional(),
      estabelecimentoId: z.string().nullable().optional(),
      dataInstalacao: z.string().datetime().nullable().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se o display existe e se o usuário tem permissão
    const where: any = { id };
    
    if (user.type === 'FRANQUEADO' && user.franqueadoId) {
      where.franqueadoId = user.franqueadoId;
    } else if (user.type === 'ESTABELECIMENTO' && user.estabelecimentoId) {
      where.estabelecimentoId = user.estabelecimentoId;
      // Estabelecimentos só podem alterar status
      if (data.tipo || data.estabelecimentoId !== undefined || data.dataInstalacao !== undefined) {
        return NextResponse.json(
          { error: 'Estabelecimentos podem apenas alterar o status' },
          { status: 403 }
        );
      }
    }

    const displayExistente = await prisma.displays.findFirst({
      where
    });

    if (!displayExistente) {
      return NextResponse.json(
        { error: 'Display não encontrado' },
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

      if (estabelecimento.franqueadoId !== displayExistente.franqueadoId) {
        return NextResponse.json(
          { error: 'Estabelecimento não pertence ao franqueado do display' },
          { status: 400 }
        );
      }
    }

    // Lógica de negócio para status
    const updateData: any = { ...data };

    // Se está definindo estabelecimento e não especificou status, marcar como INSTALADO
    if (data.estabelecimentoId && !data.status) {
      updateData.status = 'INSTALADO';
    }

    // Se está removendo estabelecimento (null) e não especificou status, marcar como DISPONIVEL
    if (data.estabelecimentoId === null && !data.status) {
      updateData.status = 'DISPONIVEL';
    }

    // Se está marcando como INSTALADO mas não tem estabelecimento, erro
    if (data.status === 'INSTALADO' && !displayExistente.estabelecimentoId && !data.estabelecimentoId) {
      return NextResponse.json(
        { error: 'Display não pode ser marcado como INSTALADO sem um estabelecimento' },
        { status: 400 }
      );
    }

    // Se está marcando como INSTALADO e especificou data, usar ela, senão usar agora
    if (data.status === 'INSTALADO' && data.dataInstalacao === undefined) {
      updateData.dataInstalacao = new Date();
    }

    // Converter data se fornecida
    if (updateData.dataInstalacao && typeof updateData.dataInstalacao === 'string') {
      updateData.dataInstalacao = new Date(updateData.dataInstalacao);
    }

    // Salvar dados anteriores para log
    const dadosAnteriores = {
      status: displayExistente.status,
      tipo: displayExistente.tipo,
      estabelecimentoId: displayExistente.estabelecimentoId,
      dataInstalacao: displayExistente.dataInstalacao
    };

    // Atualizar display
    const displayAtualizado = await prisma.displays.update({
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

    // Criar log da alteração
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'UPDATE',
        entidade: 'displays',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: data,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id,
        displayId: id
      }
    });

    return NextResponse.json(displayAtualizado);

  } catch (error) {
    console.error('Erro ao atualizar display:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/displays/{id}:
 *   delete:
 *     tags: [Displays]
 *     summary: Remover display
 *     description: Remove um display do sistema (apenas se não estiver instalado)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do display
 *     responses:
 *       200:
 *         description: Display removido com sucesso
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
 *         description: Display não encontrado
 *       400:
 *         description: Display não pode ser removido
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

    // Apenas franqueadoras podem remover displays
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para remover displays' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const display = await prisma.displays.findUnique({
      where: { id }
    });

    if (!display) {
      return NextResponse.json(
        { error: 'Display não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir remover displays instalados ou em manutenção
    if (display.status === 'INSTALADO') {
      return NextResponse.json(
        { error: 'Não é possível remover um display instalado. Desinstale-o primeiro.' },
        { status: 400 }
      );
    }

    if (display.status === 'MANUTENCAO') {
      return NextResponse.json(
        { error: 'Não é possível remover um display em manutenção' },
        { status: 400 }
      );
    }

    // Remover display
    await prisma.displays.delete({
      where: { id }
    });

    // Criar log da remoção
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'DELETE',
        entidade: 'displays',
        entidadeId: id,
        dadosAnteriores: {
          tipo: display.tipo,
          status: display.status,
          franqueadoId: display.franqueadoId,
          estabelecimentoId: display.estabelecimentoId
        },
        dadosNovos: {},
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Display removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover display:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
