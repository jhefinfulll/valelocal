import { NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '@/app/utils/schemas'
import { withValidation, successResponse, errorResponse } from '@/app/utils/validation'
import { generateToken, verifyPassword } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Fazer login no sistema
 *     description: Autentica um usuário e retorna um token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: admin@valelocal.com.br
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
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
 *                   example: Login realizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT para autenticação
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [FRANQUEADORA, FRANQUEADO, ESTABELECIMENTO, USUARIO]
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function loginHandler(data: any, request: NextRequest) {
  const { email, password } = data

  console.log('🔑 Tentativa de login:', { email })

  try {
    // Buscar usuário no banco
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        franqueadoras: true,
        franqueados: true,
        estabelecimentos: true
      }
    })

    console.log('👤 Usuário encontrado:', user ? { 
      id: user.id, 
      email: user.email, 
      type: user.type, 
      status: user.status,
      hasPassword: !!user.password 
    } : 'Não encontrado')

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return errorResponse('Email ou senha inválidos', null, 401)
    }

    // Verificar se o usuário está ativo
    if (user.status !== 'ATIVO') {
      console.log('❌ Usuário inativo:', user.status)
      return errorResponse('Usuário inativo', null, 401)
    }

    // Verificar senha
    console.log('🔐 Verificando senha...')
    const isPasswordValid = await verifyPassword(password, user.password)
    console.log('🔐 Senha válida:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Senha inválida')
      return errorResponse('Email ou senha inválidos', null, 401)
    }

    // Gerar token JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
      franqueadoraId: user.franqueadoraId || undefined,
      franqueadoId: user.franqueadoId || undefined,
      estabelecimentoId: user.estabelecimentoId || undefined
    }

    const token = generateToken(tokenPayload)

    // Atualizar último login
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Preparar dados do usuário para resposta (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      status: user.status,
      lastLogin: user.lastLogin,
      franqueadoraId: user.franqueadoraId,
      franqueadoId: user.franqueadoId,
      estabelecimentoId: user.estabelecimentoId,
      franqueadora: user.franqueadoras,
      franqueado: user.franqueados,
      estabelecimento: user.estabelecimentos
    }

    return successResponse({
      token,
      user: userData
    }, 'Login realizado com sucesso')

  } catch (error) {
    console.error('Erro no login:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = withValidation(LoginSchema, loginHandler)
