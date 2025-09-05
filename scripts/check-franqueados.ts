import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFranqueados() {
  try {
    const franqueados = await prisma.franqueados.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })

    console.log('📋 Franqueados no banco:', franqueados.length)
    console.log('📋 Dados:', franqueados)

    const users = await prisma.users.findMany({
      where: { type: 'FRANQUEADO' },
      select: {
        id: true,
        name: true,
        email: true,
        type: true
      }
    })

    console.log('👥 Usuários franqueados:', users.length)
    console.log('👥 Dados:', users)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFranqueados()
