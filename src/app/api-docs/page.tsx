'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Importar SwaggerUI dinamicamente para evitar problemas de SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Suprimir warnings específicos do SwaggerUI
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      const message = args[0]
      if (typeof message === 'string' && (
        message.includes('UNSAFE_componentWillReceiveProps') ||
        message.includes('OperationContainer') ||
        message.includes('ModelCollapse')
      )) {
        return // Suprimir este warning
      }
      originalConsoleWarn.apply(console, args)
    }

    // Carregar a especificação OpenAPI
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Erro ao carregar especificação:', error)
        setLoading(false)
      })

    // Restaurar console.warn quando o componente for desmontado
    return () => {
      console.warn = originalConsoleWarn
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentação da API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header customizado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ValeLocal API</h1>
                <p className="text-sm text-gray-500">Documentação da API REST</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                ← Voltar ao Sistema
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Autenticação JWT</h3>
                <p className="text-sm text-gray-600">Token Bearer em todas as rotas protegidas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 7h6l2 2-6 6"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">REST API</h3>
                <p className="text-sm text-gray-600">Padrão REST com validação Zod</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">PostgreSQL</h3>
                <p className="text-sm text-gray-600">Base de dados robusta com Prisma ORM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usuarios de teste */}
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">🔑 Usuários para Teste da API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">👑 Franqueadora</h4>
              <p className="text-sm text-gray-600 mb-2">admin@franqueadora.com</p>
              <p className="text-xs text-gray-500">Senha: 123456</p>
              <p className="text-xs text-blue-600 mt-1">Acesso total ao sistema</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">🏢 Franqueado</h4>
              <p className="text-sm text-gray-600 mb-2">gestor@franqueadosp.com</p>
              <p className="text-xs text-gray-500">Senha: 123456</p>
              <p className="text-xs text-blue-600 mt-1">Gestão da própria franquia</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">🏪 Estabelecimento</h4>
              <p className="text-sm text-gray-600 mb-2">contato@padariacentral.com</p>
              <p className="text-xs text-gray-500">Senha: 123456</p>
              <p className="text-xs text-blue-600 mt-1">Visualização próprios dados</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">👤 Usuário Final</h4>
              <p className="text-sm text-gray-600 mb-2">joao.silva@email.com</p>
              <p className="text-xs text-gray-500">Senha: 123456</p>
              <p className="text-xs text-blue-600 mt-1">Consulta cartões e transações</p>
            </div>
          </div>
        </div>

        {/* Como usar a API */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🚀 Como usar a API</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">1️⃣ Fazer Login</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@franqueadora.com",
  "password": "123456"
}`}
              </pre>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">2️⃣ Usar Token JWT</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`GET /api/estabelecimentos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">3️⃣ Criar Recursos</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`POST /api/estabelecimentos
Authorization: Bearer [seu-token]
Content-Type: application/json

{
  "name": "Meu Estabelecimento",
  "cnpj": "12345678000195",
  "email": "contato@meuestablecimento.com",
  "phone": "11987654321",
  "address": "Rua Exemplo, 123",
  "category": "Alimentação",
  "franqueadoId": "uuid-do-franqueado"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Endpoints disponíveis */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">📋 Principais Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🔐 Autenticação</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>POST /api/auth/login</code> - Login</li>
                <li>• <code>POST /api/auth/logout</code> - Logout</li>
                <li>• <code>GET /api/auth/me</code> - Perfil atual</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🏢 Franqueados</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>GET /api/franqueados</code> - Listar</li>
                <li>• <code>POST /api/franqueados</code> - Criar</li>
                <li>• <code>PUT /api/franqueados/:id</code> - Atualizar</li>
                <li>• <code>DELETE /api/franqueados/:id</code> - Deletar</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🏪 Estabelecimentos</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>GET /api/estabelecimentos</code> - Listar</li>
                <li>• <code>POST /api/estabelecimentos</code> - Criar</li>
                <li>• <code>GET /api/estabelecimentos/:id</code> - Ver detalhes</li>
                <li>• <code>PUT /api/estabelecimentos/:id</code> - Atualizar</li>
                <li>• <code>DELETE /api/estabelecimentos/:id</code> - Deletar</li>
                <li>• <code>GET /api/estabelecimentos/stats</code> - Estatísticas</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">📊 Relatórios</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>GET /api/dashboard/stats</code> - Dashboard</li>
                <li>• <code>GET /api/relatorios/vendas</code> - Vendas</li>
                <li>• <code>GET /api/relatorios/comissoes</code> - Comissões</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {spec && (
            <SwaggerUI 
              spec={spec}
              docExpansion="none"
              defaultModelExpandDepth={1}
              defaultModelsExpandDepth={1}
              displayOperationId={false}
              displayRequestDuration={true}
              filter={true}
              persistAuthorization={true}
              showExtensions={false}
              showCommonExtensions={false}
              tryItOutEnabled={true}
              requestSnippetsEnabled={true}
              supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
              onComplete={(system: any) => {
                // Personalizar a interface após carregar
                console.log('Swagger UI carregado:', system)
              }}
              plugins={[]}
              deepLinking={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
