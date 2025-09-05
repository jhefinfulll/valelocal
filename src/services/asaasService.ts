import { getAsaasConfig } from '@/lib/asaas-config';

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface AsaasCharge {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  originalValue: number;
  interestValue: number;
  description: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'REFUND_IN_PROGRESS' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
  pixTransaction?: {
    qrCode: {
      encodedImage: string;
      payload: string;
    };
  };
  bankSlipUrl?: string;
  invoiceUrl: string;
  dueDate: string;
  originalDueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceNumber: string;
  externalReference?: string;
}

interface CreateChargeRequest {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
  fine?: {
    value: number;
  };
  interest?: {
    value: number;
  };
  postalService?: boolean;
}

interface CreateCustomerRequest {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  notificationDisabled?: boolean;
}

class AsaasService {
  private baseURL: string;
  private _apiKey: string | undefined;

  constructor() {
    const config = getAsaasConfig();
    this.baseURL = config.baseURL;
    this._apiKey = config.apiKey;
    
    console.log('🔧 AsaasService constructor - configurado:', {
      baseURL: this.baseURL,
      hasApiKey: !!this._apiKey,
      apiKeyPreview: this._apiKey ? `${this._apiKey.substring(0, 10)}...` : 'UNDEFINED'
    })
  }

  private get apiKey(): string | undefined {
    if (!this._apiKey) {
      const config = getAsaasConfig();
      this._apiKey = config.apiKey;
      console.log('🔑 Carregando API key lazy:', {
        found: !!this._apiKey,
        preview: this._apiKey ? `${this._apiKey.substring(0, 10)}...` : 'UNDEFINED'
      })
    }
    return this._apiKey;
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    // Verificar API key no momento da requisição
    const apiKey = this.apiKey;
    if (!apiKey) {
      console.error('🚨 ASAAS API key not found. Environment variables:', {
        nodeEnv: process.env.NODE_ENV,
        hasAsaasKey: !!process.env.ASAAS_API_KEY,
        asaasKeyLength: process.env.ASAAS_API_KEY?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('ASAAS'))
      })
      throw new Error('ASAAS API key not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log('🌐 Fazendo requisição para Asaas:', { url, method, data })
      const response = await fetch(url, config);
      
      console.log('📡 Resposta do Asaas:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ASAAS API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
          method,
          data
        });
        throw new Error(`ASAAS API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta sucesso do Asaas:', result)
      return result;
    } catch (error) {
      console.error('💥 ASAAS Service Error:', error);
      throw error;
    }
  }

  // Criar cliente no ASAAS
  async createCustomer(customerData: CreateCustomerRequest): Promise<AsaasCustomer> {
    console.log('🔄 AsaasService.createCustomer() - dados recebidos:', customerData)
    
    // Validar dados básicos antes de enviar
    if (!customerData.name || customerData.name.trim().length < 2) {
      throw new Error('Nome é obrigatório e deve ter pelo menos 2 caracteres')
    }
    
    if (!customerData.cpfCnpj || customerData.cpfCnpj.length < 11) {
      throw new Error('CPF/CNPJ é obrigatório e deve ser válido')
    }
    
    if (!customerData.email || !customerData.email.includes('@')) {
      throw new Error('Email é obrigatório e deve ser válido')
    }
    
    // Validar e formatar telefone se fornecido
    if (customerData.phone) {
      const phoneClean = customerData.phone.replace(/\D/g, '')
      if (phoneClean.length < 10 || phoneClean.length > 11) {
        console.warn('⚠️ Telefone inválido, removendo:', customerData.phone)
        delete customerData.phone
      } else {
        customerData.phone = phoneClean
      }
    }
    
    if (customerData.mobilePhone) {
      const mobileClean = customerData.mobilePhone.replace(/\D/g, '')
      if (mobileClean.length < 10 || mobileClean.length > 11) {
        console.warn('⚠️ Celular inválido, removendo:', customerData.mobilePhone)
        delete customerData.mobilePhone
      } else {
        customerData.mobilePhone = mobileClean
      }
    }
    
    console.log('✅ Dados validados, enviando para Asaas:', customerData)
    return this.makeRequest<AsaasCustomer>('/customers', 'POST', customerData);
  }

  // Buscar cliente por CPF/CNPJ
  async getCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    try {
      const response = await this.makeRequest<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${cpfCnpj}`);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  // Criar cobrança
  async createCharge(chargeData: CreateChargeRequest): Promise<AsaasCharge> {
    return this.makeRequest<AsaasCharge>('/payments', 'POST', chargeData);
  }

  // Buscar cobrança por ID
  async getCharge(chargeId: string): Promise<AsaasCharge> {
    return this.makeRequest<AsaasCharge>(`/payments/${chargeId}`);
  }

  // Buscar cobrança por referência externa
  async getChargeByExternalReference(externalReference: string): Promise<AsaasCharge | null> {
    try {
      const response = await this.makeRequest<{ data: AsaasCharge[] }>(
        `/payments?externalReference=${externalReference}`
      );
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching charge by external reference:', error);
      return null;
    }
  }

  // Cancelar cobrança
  async cancelCharge(chargeId: string): Promise<AsaasCharge> {
    return this.makeRequest<AsaasCharge>(`/payments/${chargeId}`, 'DELETE');
  }

  // Gerar QR Code PIX para uma cobrança
  async generatePixQrCode(chargeId: string): Promise<string> {
    const response = await this.makeRequest<{ encodedImage: string; payload: string }>(
      `/payments/${chargeId}/pixQrCode`
    );
    return response.payload;
  }

  // Criar cobrança para ativação de estabelecimento
  async createActivationCharge(
    franqueadoData: { name: string; cnpj: string; email: string; phone: string },
    estabelecimentoId: string,
    valor: number = 50.00 // Valor padrão para ativação
  ): Promise<AsaasCharge> {
    // Primeiro, buscar ou criar o cliente
    let customer = await this.getCustomerByCpfCnpj(franqueadoData.cnpj);
    
    if (!customer) {
      customer = await this.createCustomer({
        name: franqueadoData.name,
        cpfCnpj: franqueadoData.cnpj,
        email: franqueadoData.email,
        phone: franqueadoData.phone,
        mobilePhone: franqueadoData.phone,
      });
    }

    // Criar a cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Vencimento em 7 dias

    const chargeData: CreateChargeRequest = {
      customer: customer.id,
      billingType: 'PIX',
      value: valor,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Ativação de Estabelecimento - ID: ${estabelecimentoId}`,
      externalReference: `ATIVACAO_${estabelecimentoId}`,
    };

    return this.createCharge(chargeData);
  }

  // Criar cobrança para ativação de estabelecimento (compatibilidade)
  async criarCobrancaAtivacao(data: {
    franqueadoId: string;
    estabelecimentoId: string;
    valorAtivacao: number;
  }) {
    // Buscar dados do franqueado
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const franqueado = await prisma.franqueados.findUnique({
        where: { id: data.franqueadoId }
      });

      if (!franqueado) {
        throw new Error('Franqueado não encontrado');
      }

      // Criar cobrança no ASAAS
      const asaasCharge = await this.createActivationCharge(
        {
          name: franqueado.name,
          cnpj: franqueado.cnpj,
          email: franqueado.email,
          phone: franqueado.phone,
        },
        data.estabelecimentoId,
        data.valorAtivacao
      );

      // Registrar na tabela cobrancas
      const cobranca = await prisma.cobrancas.create({
        data: {
          id: crypto.randomUUID(),
          estabelecimentoId: data.estabelecimentoId,
          franqueadoId: data.franqueadoId,
          asaasChargeId: asaasCharge.id,
          valor: asaasCharge.value,
          status: 'PENDING',
          tipo: 'ATIVACAO_ESTABELECIMENTO',
          vencimento: new Date(asaasCharge.dueDate),
          urlPagamento: asaasCharge.invoiceUrl,
          pixQrCode: asaasCharge.pixTransaction?.qrCode?.payload || null,
        }
      });

      return {
        cobranca: {
          id: cobranca.id,
          valor: cobranca.valor.toString(),
          vencimento: asaasCharge.dueDate,
        },
        pagamento: {
          invoiceUrl: asaasCharge.invoiceUrl,
          pixQrCode: asaasCharge.pixTransaction?.qrCode?.payload || null,
        },
        status: 'PENDING',
      };

    } finally {
      await prisma.$disconnect();
    }
  }

  // Validar webhook (mantendo compatibilidade)
  validateWebhook(body: any, signature: string): boolean {
    console.log('Webhook validation:', { body, signature });
    // TODO: Implementar validação real do webhook se necessário
    return true;
  }

  // Processar pagamento confirmado (mantendo compatibilidade)
  async processarPagamentoConfirmado(paymentId: string) {
    console.log('Processing confirmed payment:', paymentId);
    try {
      const charge = await this.getCharge(paymentId);
      return { success: true, charge };
    } catch (error) {
      console.error('Error processing confirmed payment:', error);
      return { success: false, error };
    }
  }
}

export const asaasService = new AsaasService();
export type { AsaasCharge, AsaasCustomer, CreateChargeRequest, CreateCustomerRequest };
