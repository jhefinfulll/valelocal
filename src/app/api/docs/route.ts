import { getSwaggerSpec } from '@/lib/swagger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const spec = getSwaggerSpec()
    return Response.json(spec, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Erro ao gerar spec do Swagger:', error)
    
    // Especificação mínima de fallback
    const fallbackSpec = {
      openapi: '3.0.3',
      info: {
        title: 'ValeLocal Sistema API',
        version: '1.0.0',
        description: 'API do Sistema ValeLocal'
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://seu-dominio.com.br/api' 
            : 'http://localhost:3001/api'
        }
      ],
      paths: {
        '/auth/login': {
          post: {
            summary: 'Login',
            tags: ['Autenticação'],
            responses: {
              '200': {
                description: 'Login realizado com sucesso'
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    }
    
    return Response.json(fallbackSpec, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  }
}
