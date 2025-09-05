import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function criarConfiguracoes() {
  console.log('🔧 Criando configurações iniciais...')

  const configuracoes = [
    // Configurações do Sistema
    {
      chave: 'sistema.nomeEmpresa',
      valor: 'ValeLocal Sistema',
      tipo: 'TEXTO' as const,
      descricao: 'Nome da empresa exibido no sistema'
    },
    {
      chave: 'sistema.email',
      valor: 'contato@valelocal.com.br',
      tipo: 'TEXTO' as const,
      descricao: 'Email principal da empresa'
    },
    {
      chave: 'sistema.telefone',
      valor: '(11) 99999-9999',
      tipo: 'TEXTO' as const,
      descricao: 'Telefone de contato principal'
    },
    {
      chave: 'sistema.endereco',
      valor: 'Rua das Empresas, 123 - São Paulo, SP',
      tipo: 'TEXTO' as const,
      descricao: 'Endereço completo da empresa'
    },
    {
      chave: 'sistema.timezone',
      valor: 'America/Sao_Paulo',
      tipo: 'TEXTO' as const,
      descricao: 'Timezone padrão do sistema'
    },
    {
      chave: 'sistema.idioma',
      valor: 'pt-BR',
      tipo: 'TEXTO' as const,
      descricao: 'Idioma padrão do sistema'
    },

    // Configurações de Comissão
    {
      chave: 'comissao.percentualPadrao',
      valor: '5.0',
      tipo: 'NUMERO' as const,
      descricao: 'Percentual padrão de comissão'
    },
    {
      chave: 'comissao.percentualMinimo',
      valor: '1.0',
      tipo: 'NUMERO' as const,
      descricao: 'Percentual mínimo de comissão'
    },
    {
      chave: 'comissao.percentualMaximo',
      valor: '15.0',
      tipo: 'NUMERO' as const,
      descricao: 'Percentual máximo de comissão'
    },
    {
      chave: 'comissao.diasPagamento',
      valor: '30',
      tipo: 'NUMERO' as const,
      descricao: 'Dias para pagamento de comissões'
    },
    {
      chave: 'comissao.valorMinimoSaque',
      valor: '100.0',
      tipo: 'NUMERO' as const,
      descricao: 'Valor mínimo para saque de comissões'
    },
    {
      chave: 'comissao.autoProcessamento',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Processar comissões automaticamente'
    },

    // Configurações de Email
    {
      chave: 'email.servidor',
      valor: 'smtp.gmail.com',
      tipo: 'TEXTO' as const,
      descricao: 'Servidor SMTP para envio de emails'
    },
    {
      chave: 'email.porta',
      valor: '587',
      tipo: 'NUMERO' as const,
      descricao: 'Porta do servidor SMTP'
    },
    {
      chave: 'email.usuario',
      valor: 'sistema@valelocal.com.br',
      tipo: 'TEXTO' as const,
      descricao: 'Usuário para autenticação SMTP'
    },
    {
      chave: 'email.criptografia',
      valor: 'TLS',
      tipo: 'TEXTO' as const,
      descricao: 'Tipo de criptografia SMTP'
    },
    {
      chave: 'email.remetentePadrao',
      valor: 'ValeLocal <noreply@valelocal.com.br>',
      tipo: 'TEXTO' as const,
      descricao: 'Remetente padrão dos emails'
    },
    {
      chave: 'email.ativo',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Sistema de email ativo'
    },

    // Configurações de Segurança
    {
      chave: 'seguranca.senhaMinima',
      valor: '8',
      tipo: 'NUMERO' as const,
      descricao: 'Tamanho mínimo da senha'
    },
    {
      chave: 'seguranca.exigirCaracteresEspeciais',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Exigir caracteres especiais na senha'
    },
    {
      chave: 'seguranca.exigirNumeros',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Exigir números na senha'
    },
    {
      chave: 'seguranca.exigirMaiusculaMinuscula',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Exigir maiúscula e minúscula na senha'
    },
    {
      chave: 'seguranca.tentativasMaximasLogin',
      valor: '5',
      tipo: 'NUMERO' as const,
      descricao: 'Máximo de tentativas de login'
    },
    {
      chave: 'seguranca.tempoBloqueioConta',
      valor: '30',
      tipo: 'NUMERO' as const,
      descricao: 'Tempo de bloqueio da conta em minutos'
    },
    {
      chave: 'seguranca.sessaoExpiraEm',
      valor: '8',
      tipo: 'NUMERO' as const,
      descricao: 'Tempo de expiração da sessão em horas'
    },
    {
      chave: 'seguranca.autenticacaoDoisFatores',
      valor: 'false',
      tipo: 'BOOLEAN' as const,
      descricao: 'Autenticação de dois fatores ativa'
    },

    // Configurações de Notificação
    {
      chave: 'notificacao.emailNovaTransacao',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Email para novas transações'
    },
    {
      chave: 'notificacao.emailComissaoPaga',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Email quando comissão é paga'
    },
    {
      chave: 'notificacao.emailNovoCartao',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Email para novos cartões'
    },
    {
      chave: 'notificacao.emailRelatorioSemanal',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Email com relatório semanal'
    },
    {
      chave: 'notificacao.smsTransacao',
      valor: 'false',
      tipo: 'BOOLEAN' as const,
      descricao: 'SMS para transações'
    },
    {
      chave: 'notificacao.whatsappNotificacoes',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Notificações via WhatsApp'
    },
    {
      chave: 'notificacao.pushNotifications',
      valor: 'true',
      tipo: 'BOOLEAN' as const,
      descricao: 'Push notifications ativas'
    }
  ]

  // Criar ou atualizar cada configuração
  for (const config of configuracoes) {
    try {
      const existing = await prisma.configuracoes.findUnique({
        where: { chave: config.chave }
      })

      if (existing) {
        console.log(`⚠️  Configuração já existe: ${config.chave}`)
        continue
      }

      await prisma.configuracoes.create({
        data: {
          id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          chave: config.chave,
          valor: config.valor,
          tipo: config.tipo,
          descricao: config.descricao,
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Criada configuração: ${config.chave}`)
    } catch (error) {
      console.error(`❌ Erro ao criar configuração ${config.chave}:`, error)
    }
  }

  console.log('🎉 Configurações iniciais criadas com sucesso!')
}

async function main() {
  try {
    await criarConfiguracoes()
  } catch (error) {
    console.error('❌ Erro durante a criação das configurações:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
main()
