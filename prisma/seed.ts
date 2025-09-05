import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Verificar se já existem dados
  const existingUsers = await prisma.users.count()
  if (existingUsers > 0) {
    console.log('✅ Dados já existem no banco. Pulando seed...')
    return
  }

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...')
  await prisma.logs.deleteMany()
  await prisma.refresh_tokens.deleteMany()
  await prisma.comissoes.deleteMany()
  await prisma.transacoes.deleteMany()
  await prisma.solicitacoes_cartao.deleteMany()
  await prisma.displays.deleteMany()
  await prisma.cartoes.deleteMany()
  await prisma.estabelecimento_coords.deleteMany()
  await prisma.users.deleteMany()
  await prisma.estabelecimentos.deleteMany()
  await prisma.franqueados.deleteMany()
  await prisma.franqueadoras.deleteMany()
  await prisma.configuracoes.deleteMany()

  // Hash das senhas
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1. Criar Franqueadora
  console.log('🏢 Criando franqueadora...')
  const franqueadora = await prisma.franqueadoras.create({
    data: {
      id: '1',
      name: 'ValeLocal Brasil',
      cnpj: '12345678000190',
      email: 'contato@valelocal.com.br',
      phone: '11999999999',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      status: 'ATIVO',
      logo: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  })

  // 2. Criar Franqueados
  console.log('🏪 Criando franqueados...')
  const franqueado1 = await prisma.franqueados.create({
    data: {
      id: '1',
      name: 'ValeLocal São Paulo',
      cnpj: '98765432000110',
      email: 'saopaulo@valelocal.com.br',
      phone: '11888888888',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      region: 'São Paulo - Capital',
      comissionRate: 15.0,
      status: 'ATIVO',
      logo: null,
      franqueadoraId: franqueadora.id,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  })

  const franqueado2 = await prisma.franqueados.create({
    data: {
      id: '2',
      name: 'ValeLocal Rio de Janeiro',
      cnpj: '11222333000144',
      email: 'rj@valelocal.com.br',
      phone: '21777777777',
      address: 'Av. Copacabana, 200 - Rio de Janeiro, RJ',
      region: 'Rio de Janeiro - Zona Sul',
      comissionRate: 12.0,
      status: 'ATIVO',
      logo: null,
      franqueadoraId: franqueadora.id,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  })

  // 3. Criar Estabelecimentos
  console.log('🏬 Criando estabelecimentos...')
  const estabelecimento1 = await prisma.estabelecimentos.create({
    data: {
      id: '1',
      name: 'Padaria Central',
      cnpj: '55666777000188',
      email: 'contato@padariacentral.com',
      phone: '11666666666',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      category: 'Alimentação',
      status: 'ATIVO',
      logo: null,
      franqueadoId: franqueado1.id,
      asaasId: null, // Será preenchido quando integrar com Asaas
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  })

  const estabelecimento2 = await prisma.estabelecimentos.create({
    data: {
      id: '2',
      name: 'Farmácia Saúde',
      cnpj: '44555666000177',
      email: 'contato@farmaciasaude.com',
      phone: '11555555555',
      address: 'Av. Brasil, 456 - São Paulo, SP',
      category: 'Farmácia',
      status: 'ATIVO',
      logo: null,
      franqueadoId: franqueado1.id,
      asaasId: null, // Será preenchido quando integrar com Asaas
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    }
  })

  const estabelecimento3 = await prisma.estabelecimentos.create({
    data: {
      id: '3',
      name: 'Supermercado Economia',
      cnpj: '33444555000166',
      email: 'contato@supereconomia.com',
      phone: '21444444444',
      address: 'Rua da Praia, 789 - Rio de Janeiro, RJ',
      category: 'Supermercado',
      status: 'ATIVO',
      logo: null,
      franqueadoId: franqueado2.id,
      asaasId: null, // Será preenchido quando integrar com Asaas
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  })

  // 4. Criar Coordenadas dos Estabelecimentos
  console.log('📍 Criando coordenadas dos estabelecimentos...')
  await prisma.estabelecimento_coords.createMany({
    data: [
      {
        id: '1',
        estabelecimentoId: estabelecimento1.id,
        lat: -23.550520,
        lng: -46.633309
      },
      {
        id: '2',
        estabelecimentoId: estabelecimento2.id,
        lat: -23.551520,
        lng: -46.634309
      },
      {
        id: '3',
        estabelecimentoId: estabelecimento3.id,
        lat: -22.970722,
        lng: -43.182365
      }
    ]
  })

  // 5. Criar Usuários (removido - usuários serão criados conforme necessário)
  console.log('👥 Usuários de teste removidos - sistema pronto para produção')

  // 6. Criar Cartões
  console.log('💳 Criando cartões...')
  const cartao1 = await prisma.cartoes.create({
    data: {
      id: '1',
      codigo: 'VL001001',
      qrCode: 'https://valelocal.com/qr/VL001001',
      valor: 50.00,
      status: 'ATIVO',
      franqueadoId: franqueado1.id,
      estabelecimentoId: estabelecimento1.id,
      usuarioId: '4',
      dataAtivacao: new Date('2024-08-15'),
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-15')
    }
  })

  const cartao2 = await prisma.cartoes.create({
    data: {
      id: '2',
      codigo: 'VL001002',
      qrCode: 'https://valelocal.com/qr/VL001002',
      valor: 0.00,
      status: 'UTILIZADO',
      franqueadoId: franqueado1.id,
      estabelecimentoId: estabelecimento1.id,
      usuarioId: '4',
      dataAtivacao: new Date('2024-08-10'),
      dataUtilizacao: new Date('2024-08-20'),
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-20')
    }
  })

  const cartao3 = await prisma.cartoes.create({
    data: {
      id: '3',
      codigo: 'VL001003',
      qrCode: 'https://valelocal.com/qr/VL001003',
      valor: 0,
      status: 'DISPONIVEL',
      franqueadoId: franqueado1.id,
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    }
  })

  // 7. Criar Transações
  console.log('💰 Criando transações...')
  const transacao1 = await prisma.transacoes.create({
    data: {
      id: '1',
      tipo: 'RECARGA',
      cartaoId: cartao1.id,
      estabelecimentoId: estabelecimento1.id,
      valor: 50.00,
      status: 'CONCLUIDA',
      createdAt: new Date('2024-08-15T10:30:00'),
      updatedAt: new Date('2024-08-15T10:30:00')
    }
  })

  const transacao2 = await prisma.transacoes.create({
    data: {
      id: '2',
      tipo: 'UTILIZACAO',
      cartaoId: cartao2.id,
      estabelecimentoId: estabelecimento1.id,
      valor: 100.00,
      status: 'CONCLUIDA',
      usuarioNome: 'João Silva',
      usuarioTelefone: '11999999999',
      comprovante: 'COMP-20240820-001',
      createdAt: new Date('2024-08-20T14:45:00'),
      updatedAt: new Date('2024-08-20T14:45:00')
    }
  })

  const transacao3 = await prisma.transacoes.create({
    data: {
      id: '3',
      tipo: 'RECARGA',
      cartaoId: cartao2.id,
      estabelecimentoId: estabelecimento1.id,
      valor: 100.00,
      status: 'CONCLUIDA',
      createdAt: new Date('2024-08-10T09:15:00'),
      updatedAt: new Date('2024-08-10T09:15:00')
    }
  })

  // 8. Criar Comissões
  console.log('💼 Criando comissões...')
  await prisma.comissoes.createMany({
    data: [
      {
        id: '1',
        franqueadoId: franqueado1.id,
        estabelecimentoId: estabelecimento1.id,
        transacaoId: transacao1.id,
        valor: 7.50,
        percentual: 15,
        status: 'PAGA',
        createdAt: new Date('2024-08-15T10:30:00'),
        updatedAt: new Date('2024-08-16T10:00:00')
      },
      {
        id: '2',
        franqueadoId: franqueado1.id,
        estabelecimentoId: estabelecimento1.id,
        transacaoId: transacao3.id,
        valor: 15.00,
        percentual: 15,
        status: 'PENDENTE',
        createdAt: new Date('2024-08-10T09:15:00'),
        updatedAt: new Date('2024-08-10T09:15:00')
      }
    ]
  })

  // 9. Criar Solicitações de Cartão
  console.log('📋 Criando solicitações de cartão...')
  await prisma.solicitacoes_cartao.createMany({
    data: [
      {
        id: '1',
        estabelecimentoId: estabelecimento1.id,
        franqueadoId: franqueado1.id,
        quantidade: 100,
        status: 'APROVADA',
        observacoes: 'Primeira remessa para a padaria',
        dataAprovacao: new Date('2024-08-02'),
        dataEnvio: new Date('2024-08-03'),
        dataEntrega: new Date('2024-08-05'),
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-05')
      },
      {
        id: '2',
        estabelecimentoId: estabelecimento2.id,
        franqueadoId: franqueado1.id,
        quantidade: 50,
        status: 'PENDENTE',
        observacoes: 'Solicitação inicial da farmácia',
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-20')
      }
    ]
  })

  // 10. Criar Displays
  console.log('📺 Criando displays...')
  await prisma.displays.createMany({
    data: [
      {
        id: '1',
        franqueadoId: franqueado1.id,
        estabelecimentoId: estabelecimento1.id,
        tipo: 'BALCAO',
        status: 'INSTALADO',
        dataInstalacao: new Date('2024-08-05'),
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-05')
      },
      {
        id: '2',
        franqueadoId: franqueado1.id,
        tipo: 'PAREDE',
        status: 'DISPONIVEL',
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-01')
      },
      {
        id: '3',
        franqueadoId: franqueado1.id,
        estabelecimentoId: estabelecimento2.id,
        tipo: 'MESA',
        status: 'INSTALADO',
        dataInstalacao: new Date('2024-08-10'),
        createdAt: new Date('2024-08-02'),
        updatedAt: new Date('2024-08-10')
      },
      {
        id: '4',
        franqueadoId: franqueado2.id,
        estabelecimentoId: estabelecimento3.id,
        tipo: 'BALCAO',
        status: 'INSTALADO',
        dataInstalacao: new Date('2024-08-15'),
        createdAt: new Date('2024-08-03'),
        updatedAt: new Date('2024-08-15')
      },
      {
        id: '5',
        franqueadoId: franqueado2.id,
        tipo: 'PAREDE',
        status: 'MANUTENCAO',
        createdAt: new Date('2024-08-04'),
        updatedAt: new Date('2024-08-18')
      }
    ]
  })

  // 11. Criar Logs
  console.log('📝 Criando logs...')
  await prisma.logs.createMany({
    data: [
      {
        id: '1',
        userId: '1',
        acao: 'CREATE',
        entidade: 'Franqueado',
        entidadeId: '2',
        dadosNovos: { name: 'ValeLocal Rio de Janeiro' },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date('2024-08-20T10:30:00')
      },
      {
        id: '2',
        userId: '2',
        acao: 'UPDATE',
        entidade: 'Estabelecimento',
        entidadeId: '1',
        dadosAnteriores: { status: 'inativo' },
        dadosNovos: { status: 'ativo' },
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date('2024-08-20T11:15:00')
      }
    ]
  })

  // 12. Criar Configurações
  console.log('⚙️ Criando configurações do sistema...')
  await prisma.configuracoes.createMany({
    data: [
      {
        id: '1',
        chave: 'taxa_comissao_padrao',
        valor: '15',
        descricao: 'Taxa de comissão padrão para novos franqueados (%)',
        tipo: 'NUMERO',
        updatedAt: new Date()
      },
      {
        id: '2',
        chave: 'valor_minimo_recarga',
        valor: '10',
        descricao: 'Valor mínimo para recarga de cartão (R$)',
        tipo: 'NUMERO',
        updatedAt: new Date()
      },
      {
        id: '3',
        chave: 'valor_maximo_recarga',
        valor: '500',
        descricao: 'Valor máximo para recarga de cartão (R$)',
        tipo: 'NUMERO',
        updatedAt: new Date()
      },
      {
        id: '4',
        chave: 'email_suporte',
        valor: 'suporte@valelocal.com.br',
        descricao: 'Email de suporte técnico',
        tipo: 'TEXTO',
        updatedAt: new Date()
      },
      {
        id: '5',
        chave: 'manutencao_sistema',
        valor: 'false',
        descricao: 'Sistema em manutenção?',
        tipo: 'BOOLEAN',
        updatedAt: new Date()
      }
    ]
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log(`
  📊 Dados criados:
  • 1 Franqueadora
  • 2 Franqueados
  • 3 Estabelecimentos
  • 4 Usuários
  • 3 Cartões
  • 3 Transações
  • 2 Comissões
  • 2 Solicitações de cartão
  • 5 Displays
  • 2 Logs
  • 5 Configurações

  🔑 Usuários para teste:
  • admin@franqueadora.com (FRANQUEADORA) - senha: 123456
  • gestor@franqueadosp.com (FRANQUEADO) - senha: 123456
  • contato@padariacentral.com (ESTABELECIMENTO) - senha: 123456
  • joao.silva@email.com (USUARIO) - senha: 123456
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
