// src/app/api/webhooks/asaas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Função para processar pagamento confirmado
async function processarPagamentoConfirmado(asaasChargeId: string) {
  try {
    // Buscar cobrança no banco
    const cobranca = await prisma.cobrancas.findUnique({
      where: { asaasChargeId },
      include: { estabelecimento: true }
    });

    if (!cobranca) {
      console.error(`Cobrança não encontrada para asaasChargeId: ${asaasChargeId}`);
      return;
    }

    // Atualizar cobrança e ativar estabelecimento em transação
    await prisma.$transaction(async (tx) => {
      // Atualizar cobrança
      await tx.cobrancas.update({
        where: { id: cobranca.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Ativar estabelecimento
      await tx.estabelecimentos.update({
        where: { id: cobranca.estabelecimentoId },
        data: {
          status: 'ATIVO',
          ativadoEm: new Date(),
          updatedAt: new Date()
        }
      });
    });

    console.log(`✅ Estabelecimento ${cobranca.estabelecimentoId} ativado com sucesso`);
  } catch (error) {
    console.error('Erro ao processar pagamento confirmado:', error);
    throw error;
  }
}

// Função para processar pagamento vencido
async function processarPagamentoVencido(asaasChargeId: string) {
  try {
    // Buscar cobrança no banco
    const cobranca = await prisma.cobrancas.findUnique({
      where: { asaasChargeId }
    });

    if (!cobranca) {
      console.error(`Cobrança não encontrada para asaasChargeId: ${asaasChargeId}`);
      return;
    }

    // Atualizar status da cobrança
    await prisma.cobrancas.update({
      where: { id: cobranca.id },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    });

    console.log(`⏰ Cobrança ${cobranca.id} marcada como vencida`);
  } catch (error) {
    console.error('Erro ao processar pagamento vencido:', error);
    throw error;
  }
}

// Função para processar pagamento cancelado
async function processarPagamentoCancelado(asaasChargeId: string) {
  try {
    // Buscar cobrança no banco
    const cobranca = await prisma.cobrancas.findUnique({
      where: { asaasChargeId }
    });

    if (!cobranca) {
      console.error(`Cobrança não encontrada para asaasChargeId: ${asaasChargeId}`);
      return;
    }

    // Atualizar status da cobrança
    await prisma.cobrancas.update({
      where: { id: cobranca.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`❌ Cobrança ${cobranca.id} cancelada`);
  } catch (error) {
    console.error('Erro ao processar pagamento cancelado:', error);
    throw error;
  }
}

// Removido import direto do asaasService para evitar problemas no build

/**
 * @swagger
 * /api/webhooks/asaas:
 *   post:
 *     summary: Webhook do Asaas para notificações de pagamento
 *     description: Recebe notificações do Asaas sobre mudanças de status de pagamentos
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: PAYMENT_RECEIVED
 *               payment:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: pay_123456789
 *                   status:
 *                     type: string
 *                     example: RECEIVED
 *                   value:
 *                     type: number
 *                     example: 150.00
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Webhook processado com sucesso
 *       400:
 *         description: Dados inválidos no webhook
 *       500:
 *         description: Erro interno do servidor
 */
export async function POST(request: NextRequest) {
  try {
    // Import dinâmico do asaasService
    const { asaasService } = await import('@/services/asaasService');
    
    const body = await request.text();
    const signature = request.headers.get('asaas-signature') || '';
    
    // Log para debug (remover em produção)
    console.log('🔔 Webhook Asaas recebido:', body);

    // Validar assinatura do webhook (por segurança)
    if (!asaasService.validateWebhook(body, signature)) {
      console.error('❌ Webhook com assinatura inválida');
      return NextResponse.json(
        { error: 'Assinatura inválida' }, 
        { status: 401 }
      );
    }

    // Parse do JSON
    const evento = JSON.parse(body);

    if (!evento || !evento.event || !evento.payment) {
      console.error('❌ Webhook com formato inválido:', evento);
      return NextResponse.json(
        { error: 'Formato de webhook inválido' }, 
        { status: 400 }
      );
    }

    console.log(`📥 Evento: ${evento.event} | Payment ID: ${evento.payment.id}`);

    // Processar diferentes tipos de eventos
    switch (evento.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Pagamento confirmado - ativar estabelecimento
        await processarPagamentoConfirmado(evento.payment.id);
        console.log(`✅ Pagamento ${evento.payment.id} processado com sucesso`);
        break;

      case 'PAYMENT_OVERDUE':
        // Pagamento vencido - atualizar status
        await processarPagamentoVencido(evento.payment.id);
        console.log(`⏰ Pagamento ${evento.payment.id} vencido`);
        break;

      case 'PAYMENT_DELETED':
        // Pagamento cancelado
        await processarPagamentoCancelado(evento.payment.id);
        console.log(`❌ Pagamento ${evento.payment.id} cancelado`);
        break;

      default:
        console.log(`ℹ️ Evento não processado: ${evento.event}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso',
      event: evento.event,
      paymentId: evento.payment.id
    });

  } catch (error) {
    console.error('💥 Erro ao processar webhook Asaas:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Asaas está funcionando',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}
