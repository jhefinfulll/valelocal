import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Detectar se estamos em build time
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

try {
  if (isBuildTime) {
    // Durante o build, usar um mock básico
    prisma = {} as PrismaClient
  } else if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient()
    }
    prisma = globalForPrisma.prisma
  }
} catch (error) {
  console.warn('Prisma initialization failed, using mock:', error)
  prisma = {} as PrismaClient
}

export default prisma
export { prisma }
