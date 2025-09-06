import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getAuthenticatedUser } from '@/lib/auth'

// GET - Buscar informações do usuário do estabelecimento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    const { id } = await params
    
    // Apenas FRANQUEADORA pode gerenciar usuários de estabelecimentos
    if (!user || user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const estabelecimento = await prisma.estabelecimentos.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            lastLogin: true,
            createdAt: true
          }
        }
      }
    })

    if (!estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      )
    }

    const userInfo = estabelecimento.users[0]

    return NextResponse.json({
      id: userInfo?.id || null,
      name: userInfo?.name || estabelecimento.name,
      email: userInfo?.email || estabelecimento.email,
      status: userInfo?.status || 'INATIVO',
      hasPassword: !!userInfo,
      lastLogin: userInfo?.lastLogin,
      createdAt: userInfo?.createdAt || estabelecimento.createdAt
    })

  } catch (error) {
    console.error('Erro ao buscar usuário do estabelecimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar usuário para estabelecimento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    const { id } = await params
    
    // Apenas FRANQUEADORA pode criar usuários de estabelecimentos
    if (!user || user.type !== 'FRANQUEADORA') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 8 caracteres' },
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

    if (estabelecimento.users.length > 0) {
      return NextResponse.json(
        { error: 'Estabelecimento já possui usuário' },
        { status: 400 }
      )
    }

    // Verificar se email já existe na tabela users
    const existingUser = await prisma.users.findUnique({
      where: { email: estabelecimento.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado na tabela de usuários' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: estabelecimento.name,
        email: estabelecimento.email,
        password: hashedPassword,
        type: 'ESTABELECIMENTO',
        status: 'ATIVO',
        estabelecimentoId: estabelecimento.id,
        franqueadoraId: user.franqueadoraId!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status,
        hasPassword: true,
        lastLogin: newUser.lastLogin,
        createdAt: newUser.createdAt
      },
      tempPassword: password
    })

  } catch (error) {
    console.error('Erro ao criar usuário do estabelecimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
