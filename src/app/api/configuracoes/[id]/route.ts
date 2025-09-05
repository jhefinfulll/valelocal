import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   get:
 *     tags: [Configurações]
 *     summary: Obter configuração por ID
 *     description: Retorna dados de uma configuração específica
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração
 *     responses:
 *       200:
 *         description: Dados da configuração
 *       404:
 *         description: Configuração não encontrada
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

    // Apenas franqueadoras podem acessar configurações
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para acessar configurações' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const configuracao = await prisma.configuracoes.findUnique({
      where: { id }
    });

    if (!configuracao) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(configuracao);

  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   put:
 *     tags: [Configurações]
 *     summary: Atualizar configuração
 *     description: Atualiza uma configuração do sistema
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *                 description: Novo valor da configuração
 *               descricao:
 *                 type: string
 *                 description: Nova descrição da configuração
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
 *       404:
 *         description: Configuração não encontrada
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

    // Apenas franqueadoras podem alterar configurações
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para alterar configurações' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Schema de validação
    const schema = z.object({
      valor: z.string().min(0).optional(),
      descricao: z.string().optional()
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se a configuração existe
    const configExistente = await prisma.configuracoes.findUnique({
      where: { id }
    });

    if (!configExistente) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      );
    }

    // Validar valor se fornecido, baseado no tipo da configuração
    if (data.valor !== undefined) {
      if (configExistente.tipo === 'NUMERO' && isNaN(Number(data.valor))) {
        return NextResponse.json(
          { error: 'Valor deve ser um número válido para tipo NUMERO' },
          { status: 400 }
        );
      }

      if (configExistente.tipo === 'BOOLEAN' && !['true', 'false'].includes(data.valor.toLowerCase())) {
        return NextResponse.json(
          { error: 'Valor deve ser "true" ou "false" para tipo BOOLEAN' },
          { status: 400 }
        );
      }

      if (configExistente.tipo === 'JSON') {
        try {
          JSON.parse(data.valor);
        } catch {
          return NextResponse.json(
            { error: 'Valor deve ser um JSON válido para tipo JSON' },
            { status: 400 }
          );
        }
      }
    }

    // Salvar dados anteriores para log
    const dadosAnteriores = {
      valor: configExistente.valor,
      descricao: configExistente.descricao
    };

    // Atualizar configuração
    const configAtualizada = await prisma.configuracoes.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Criar log da alteração
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'UPDATE',
        entidade: 'configuracoes',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: data,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id
      }
    });

    return NextResponse.json(configAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   delete:
 *     tags: [Configurações]
 *     summary: Remover configuração
 *     description: Remove uma configuração do sistema (apenas franqueadoras)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração
 *     responses:
 *       200:
 *         description: Configuração removida com sucesso
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
 *         description: Configuração não encontrada
 *       403:
 *         description: Sem permissão para remover configuração
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

    // Apenas franqueadoras podem remover configurações
    if (user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Sem permissão para remover configurações' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const configuracao = await prisma.configuracoes.findUnique({
      where: { id }
    });

    if (!configuracao) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se não é uma configuração crítica do sistema
    const configsCriticas = [
      'sistema.nome_empresa',
      'sistema.versao',
      'email.smtp_host',
      'email.smtp_port',
      'pagamento.taxa_transacao'
    ];

    if (configsCriticas.includes(configuracao.chave)) {
      return NextResponse.json(
        { error: 'Esta configuração é crítica e não pode ser removida' },
        { status: 400 }
      );
    }

    // Remover configuração
    await prisma.configuracoes.delete({
      where: { id }
    });

    // Criar log da remoção
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.logs.create({
      data: {
        id: logId,
        acao: 'DELETE',
        entidade: 'configuracoes',
        entidadeId: id,
        dadosAnteriores: {
          chave: configuracao.chave,
          valor: configuracao.valor,
          tipo: configuracao.tipo,
          descricao: configuracao.descricao
        },
        dadosNovos: {},
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuração removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
