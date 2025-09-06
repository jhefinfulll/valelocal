import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Detecção mais robusta de build time vs runtime
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' && 
                   typeof window === 'undefined' &&
                   process.argv.some(arg => arg.includes('build'))

// Force production em produção
const isProduction = process.env.NODE_ENV === 'production'

console.log('🔧 Prisma Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PHASE: process.env.NEXT_PHASE,
  isBuildTime,
  isProduction,
  hasWindow: typeof window !== 'undefined'
})

try {
  if (isBuildTime) {
    // Durante o build, usar um mock básico
    console.log('🔧 Prisma: Usando mock durante build time')
    prisma = {} as PrismaClient
  } else {
    // Em qualquer runtime (development ou production), usar Prisma real
    console.log('🔧 Prisma: Inicializando Prisma Client para runtime')
    
    if (isProduction) {
      // Produção - sempre nova instância
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: ['error', 'warn']
      })
    } else {
      // Desenvolvimento - usar instância global
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
          log: ['query', 'error', 'warn']
        })
      }
      prisma = globalForPrisma.prisma
    }
  }
} catch (error) {
  console.error('❌ Erro na inicialização do Prisma:', error)
  
  // Se não for build time, tentar forçar inicialização
  if (!isBuildTime) {
    console.log('🔧 Tentando inicialização forçada do Prisma')
    try {
      prisma = new PrismaClient()
    } catch (fallbackError) {
      console.error('❌ Falha na inicialização forçada:', fallbackError)
      prisma = {} as PrismaClient
    }
  } else {
    prisma = {} as PrismaClient
  }
}

// Validação final
if (typeof prisma.users === 'undefined' && !isBuildTime) {
  console.error('❌ ERRO CRÍTICO: Prisma.users está undefined em runtime!')
  console.log('🔧 Tentando última reinicialização...')
  try {
    prisma = new PrismaClient()
  } catch (e) {
    console.error('❌ Falha total na inicialização do Prisma')
  }
}

console.log('🔧 Prisma Status:', {
  hasPrisma: !!prisma,
  hasUsers: !!prisma.users,
  type: prisma.constructor.name
})

export default prisma
export { prisma }
