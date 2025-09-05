import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

const configuracoes = [
  // Configurações do Sistema
  {
    chave: 'sistema.nome',
    valor: 'ValeLocal',
    descricao: 'Nome do sistema',
    tipo: 'TEXTO'
  },
  {
    chave: 'sistema.versao',
    valor: '2.0.0',
    descricao: 'Versão atual do sistema',
    tipo: 'TEXTO'
  },
  {
    chave: 'sistema.manutencao',
    valor: 'false',
    descricao: 'Sistema em manutenção',
    tipo: 'BOOLEAN'
  },
  {
    chave: 'sistema.max_cartoes_por_franqueado',
    valor: '1000',
    descricao: 'Máximo de cartões por franqueado',
    tipo: 'NUMERO'
  },
  {
    chave: 'sistema.valor_minimo_recarga',
    valor: '10.00',
    descricao: 'Valor mínimo para recarga de cartão',
    tipo: 'NUMERO'
  },
  {
    chave: 'sistema.valor_maximo_recarga',
    valor: '500.00',
    descricao: 'Valor máximo para recarga de cartão',
    tipo: 'NUMERO'
  },
  {
    chave: 'sistema.tempo_expiracao_cartao',
    valor: '365',
    descricao: 'Tempo de expiração do cartão em dias',
    tipo: 'NUMERO'
  },

  // Configurações de Comissão
  {
    chave: 'comissao.franqueadora_percentual',
    valor: '5.0',
    descricao: 'Percentual de comissão da franqueadora',
    tipo: 'NUMERO'
  },
  {
    chave: 'comissao.franqueado_percentual',
    valor: '15.0',
    descricao: 'Percentual padrão de comissão do franqueado',
    tipo: 'NUMERO'
  },
  {
    chave: 'comissao.estabelecimento_percentual',
    valor: '80.0',
    descricao: 'Percentual de comissão do estabelecimento',
    tipo: 'NUMERO'
  },
  {
    chave: 'comissao.prazo_pagamento',
    valor: '30',
    descricao: 'Prazo para pagamento de comissões em dias',
    tipo: 'NUMERO'
  },
  {
    chave: 'comissao.valor_minimo_saque',
    valor: '50.00',
    descricao: 'Valor mínimo para saque de comissões',
    tipo: 'NUMERO'
  },

  // Configurações de Email
  {
    chave: 'email.smtp_host',
    valor: 'smtp.gmail.com',
    descricao: 'Servidor SMTP para envio de emails',
    tipo: 'TEXTO'
  },
  {
    chave: 'email.smtp_port',
    valor: '587',
    descricao: 'Porta do servidor SMTP',
    tipo: 'NUMERO'
  },
  {
    chave: 'email.smtp_user',
    valor: '',
    descricao: 'Usuário do servidor SMTP',
    tipo: 'TEXTO'
  },
  {
    chave: 'email.smtp_password',
    valor: '',
    descricao: 'Senha do servidor SMTP',
    tipo: 'TEXTO'
  },
  {
    chave: 'email.from_name',
    valor: 'ValeLocal',
    descricao: 'Nome do remetente dos emails',
    tipo: 'TEXTO'
  },
  {
    chave: 'email.from_email',
    valor: 'noreply@valelocal.com',
    descricao: 'Email do remetente',
    tipo: 'TEXTO'
  },
  {
    chave: 'email.notificacoes_ativas',
    valor: 'true',
    descricao: 'Envio de notificações por email ativo',
    tipo: 'BOOLEAN'
  },

  // Configurações de Segurança
  {
    chave: 'seguranca.jwt_secret',
    valor: 'sua-chave-secreta-jwt-muito-segura-aqui',
    descricao: 'Chave secreta para JWT',
    tipo: 'TEXTO'
  },
  {
    chave: 'seguranca.jwt_expiracao',
    valor: '24h',
    descricao: 'Tempo de expiração dos tokens JWT',
    tipo: 'TEXTO'
  },
  {
    chave: 'seguranca.max_tentativas_login',
    valor: '5',
    descricao: 'Máximo de tentativas de login',
    tipo: 'NUMERO'
  },
  {
    chave: 'seguranca.tempo_bloqueio_login',
    valor: '30',
    descricao: 'Tempo de bloqueio após tentativas em minutos',
    tipo: 'NUMERO'
  },
  {
    chave: 'seguranca.forcar_https',
    valor: 'true',
    descricao: 'Forçar uso de HTTPS',
    tipo: 'BOOLEAN'
  },
  {
    chave: 'seguranca.log_atividades',
    valor: 'true',
    descricao: 'Registrar logs de atividades',
    tipo: 'BOOLEAN'
  },

  // Configurações de Cobrança
  {
    chave: 'cobranca.taxa_ativacao_estabelecimento',
    valor: '100.00',
    descricao: 'Taxa de ativação por estabelecimento',
    tipo: 'NUMERO'
  },
  {
    chave: 'cobranca.valor_por_cartao',
    valor: '2.50',
    descricao: 'Valor cobrado por cartão solicitado',
    tipo: 'NUMERO'
  },
  {
    chave: 'cobranca.prazo_vencimento',
    valor: '30',
    descricao: 'Prazo de vencimento das cobranças em dias',
    tipo: 'NUMERO'
  },

  // Configurações de API Externa (Asaas)
  {
    chave: 'asaas.api_key',
    valor: '',
    descricao: 'Chave da API do Asaas',
    tipo: 'TEXTO'
  },
  {
    chave: 'asaas.sandbox',
    valor: 'true',
    descricao: 'Usar ambiente de sandbox do Asaas',
    tipo: 'BOOLEAN'
  },
  {
    chave: 'asaas.webhook_url',
    valor: '',
    descricao: 'URL para webhooks do Asaas',
    tipo: 'TEXTO'
  }
]

async function seedConfiguracoes() {
  console.log('🌱 Iniciando seed de configurações...')

  for (const config of configuracoes) {
    try {
      await prisma.configuracoes.upsert({
        where: { chave: config.chave },
        update: {
          descricao: config.descricao,
          tipo: config.tipo as any,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          chave: config.chave,
          valor: config.valor,
          descricao: config.descricao,
          tipo: config.tipo as any,
          updatedAt: new Date()
        }
      })
      console.log(`✅ Configuração criada/atualizada: ${config.chave}`)
    } catch (error) {
      console.error(`❌ Erro ao criar configuração ${config.chave}:`, error)
    }
  }

  console.log('✅ Seed de configurações concluído!')
}

seedConfiguracoes()
  .catch((e) => {
    console.error('❌ Erro no seed de configurações:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
