import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getAuthenticatedUser } from '@/lib/auth'

const prisma = new PrismaClient()

// PUT - Atualizar senha do usuário do estabelecimento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    const { id } = await params
    
    // Apenas FRANQUEADORA pode atualizar senhas de estabelecimentos
    if (!user || user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Nova senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
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
        { error: 'Estabelecimento não possui usuário' },
        { status: 400 }
      )
    }

    const estabelecimentoUser = estabelecimento.users[0]

    // Verificar senha atual se fornecida
    if (currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, estabelecimentoUser.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.users.update({
      where: { id: estabelecimentoUser.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Senha atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar senha do estabelecimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
