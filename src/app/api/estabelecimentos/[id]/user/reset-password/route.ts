import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getAuthenticatedUser } from '@/lib/auth'

const prisma = new PrismaClient()

// POST - Reset da senha do usuário do estabelecimento (gera senha temporária)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    const { id } = await params
    
    // Apenas FRANQUEADORA pode resetar senhas de estabelecimentos
    if (!user || user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id },
      include: {
        users: true
      }
    })

    if (!estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      )
    }

    if (estabelecimento.users.length === 0) {
      return NextResponse.json(
        { error: 'Estabelecimento não possui usuário para resetar' },
        { status: 400 }
      )
    }

    // Gerar senha temporária (8 caracteres aleatórios)
    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2)
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12)

    const estabelecimentoUser = estabelecimento.users[0]

    await prisma.users.update({
      where: { id: estabelecimentoUser.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Senha resetada com sucesso',
      temporaryPassword
    })

  } catch (error) {
    console.error('Erro ao resetar senha do estabelecimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
