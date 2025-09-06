import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Só inicializa o Prisma se não estivermos em build time
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient()
    }
    prisma = globalForPrisma.prisma
  }
} else {
  // Fallback durante build ou no cliente
  prisma = new PrismaClient()
}

export default prisma
export { prisma }
