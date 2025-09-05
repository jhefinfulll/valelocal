import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Creating test data...')

    // Verificar se já há franqueadora
    let franqueadora = await prisma.franqueadoras.findFirst()
    
    if (!franqueadora) {
      franqueadora = await prisma.franqueadoras.create({
        data: {
          id: 'franqueadora-1',
          name: 'Franqueadora Principal',
          cnpj: '11222333000144',
          email: 'franqueadora@vale.com',
          phone: '1133334444',
          address: 'Rua Principal, 100',
          status: 'ATIVO',
          updatedAt: new Date()
        }
      })
    }

    // Criar franqueados de teste
    const franqueadosTest = [
      {
        id: 'franq-1',
        name: 'João Silva',
        cnpj: '12345678000190',
        email: 'joao@franqueado.com',
        phone: '11999887766',
        address: 'Rua das Flores, 123, São Paulo, SP',
        region: 'Sudeste',
        comissionRate: 15.0,
        status: 'ATIVO' as const,
        franqueadoraId: franqueadora.id,
        updatedAt: new Date()
      },
      {
        id: 'franq-2',
        name: 'Maria Santos',
        cnpj: '98765432000111',
        email: 'maria@franqueado.com',
        phone: '21988776655',
        address: 'Av. Copacabana, 456, Rio de Janeiro, RJ',
        region: 'Sudeste',
        comissionRate: 18.0,
        status: 'ATIVO' as const,
        franqueadoraId: franqueadora.id
      },
      {
        id: 'franq-3',
        name: 'Carlos Oliveira',
        cnpj: '11223344000155',
        email: 'carlos@franqueado.com',
        phone: '85987654321',
        address: 'Rua do Sol, 789, Fortaleza, CE',
        region: 'Nordeste',
        comissionRate: 16.5,
        status: 'ATIVO' as const,
        franqueadoraId: franqueadora.id
      },
      {
        id: 'franq-4',
        name: 'Ana Costa',
        cnpj: '55667788000199',
        email: 'ana@franqueado.com',
        phone: '11876543210',
        address: 'Av. Paulista, 1000, São Paulo, SP',
        region: 'Sudeste',
        comissionRate: 17.0,
        status: 'INATIVO' as const,
        franqueadoraId: franqueadora.id
      },
      {
        id: 'franq-5',
        name: 'Pedro Almeida',
        cnpj: '33445566000177',
        email: 'pedro@franqueado.com',
        phone: '47999112233',
        address: 'Rua XV de Novembro, 200, Blumenau, SC',
        region: 'Sul',
        comissionRate: 19.0,
        status: 'ATIVO' as const,
        franqueadoraId: franqueadora.id
      }
    ]

    // Inserir franqueados
    for (const franqueado of franqueadosTest) {
      await prisma.franqueados.upsert({
        where: { id: franqueado.id },
        update: franqueado,
        create: {
          ...franqueado,
          updatedAt: franqueado.updatedAt || new Date()
        }
      })
    }

    // Criar alguns estabelecimentos de teste
    const estabelecimentos = [
      {
        id: 'estab-1',
        name: 'Loja Centro',
        cnpj: '12345678000101',
        email: 'centro@loja.com',
        phone: '11999887701',
        address: 'Rua do Centro, 100',
        franqueadoId: 'franq-1',
        status: 'ATIVO' as const
      },
      {
        id: 'estab-2',
        name: 'Loja Shopping',
        cnpj: '12345678000102',
        email: 'shopping@loja.com',
        phone: '11999887702',
        address: 'Shopping Center, Loja 50',
        franqueadoId: 'franq-1',
        status: 'ATIVO' as const
      },
      {
        id: 'estab-3',
        name: 'Loja Copacabana',
        cnpj: '98765432000101',
        email: 'copa@loja.com',
        phone: '21988776601',
        address: 'Av. Copacabana, 500',
        franqueadoId: 'franq-2',
        status: 'ATIVO' as const
      }
    ]

    for (const estab of estabelecimentos) {
      await prisma.estabelecimentos.upsert({
        where: { id: estab.id },
        update: estab,
        create: {
          ...estab,
          category: 'SUPERMERCADO',
          updatedAt: new Date()
        }
      })
    }

    console.log('✅ Test data created successfully!')

    return NextResponse.json({ 
      message: 'Dados de teste criados com sucesso!',
      franqueados: franqueadosTest.length,
      estabelecimentos: estabelecimentos.length
    })

  } catch (error) {
    console.error('❌ Error creating test data:', error)
    return NextResponse.json(
      { error: 'Erro ao criar dados de teste', details: error },
      { status: 500 }
    )
  }
}
