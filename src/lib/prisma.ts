import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Detectar se estamos em build time (apenas durante o processo de build do Next.js)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && typeof window === 'undefined'

try {
  if (isBuildTime) {
    // Durante o build, usar um mock básico
    console.log('🔧 Prisma: Usando mock durante build time')
    prisma = {} as PrismaClient
  } else if (process.env.NODE_ENV === 'production') {
    // Em produção (runtime), usar Prisma real
    console.log('🔧 Prisma: Inicializando para produção')
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  } else {
    // Em desenvolvimento, usar instância global
    console.log('🔧 Prisma: Inicializando para desenvolvimento')
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient()
    }
    prisma = globalForPrisma.prisma
  }
} catch (error) {
  console.error('❌ Erro na inicialização do Prisma:', error)
  // Em caso de erro, tentar uma última vez com configuração básica
  if (process.env.NODE_ENV !== 'production' || isBuildTime) {
    console.warn('🔧 Usando mock devido ao erro')
    prisma = {} as PrismaClient
  } else {
    console.log('🔧 Tentando inicialização básica do Prisma')
    prisma = new PrismaClient()
  }
}

export default prisma
export { prisma }
