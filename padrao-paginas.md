# Padrão para Criação de Páginas - Sistema ValeLocal

## 📋 Checklist de Criação de Páginas

### 🔐 Segurança e Autenticação
- [ ] **API Routes protegidas** - Todas as rotas da API devem implementar `getAuthenticatedUser(request)`
- [ ] **Verificação de permissões** - Implementar controle de acesso por tipo de usuário (FRANQUEADORA, FRANQUEADO, ESTABELECIMENTO)
- [ ] **Filtros por usuário** - Aplicar `whereCondition` baseado no tipo de usuário logado
- [ ] **Validação de dados** - Usar schemas Zod para validação de entrada
- [ ] **Respostas padronizadas** - Usar `successResponse`, `errorResponse`, `unauthorizedResponse`, `forbiddenResponse`

### 🎨 Estrutura de Componentes

#### 📄 Página Principal (`page.tsx`)
```typescript
// Estrutura padrão de uma página
export default function PageName() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [error, setError] = useState<string | null>(null)
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedItem, setSelectedItem] = useState(null)

  // Função de carregamento de dados
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await service.getAll()
      setData(result)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // useEffect para carregamento inicial
  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header com título e botão de ação */}
      <PageHeader />
      
      {/* Cards de estatísticas */}
      <StatsCards />
      
      {/* Tabela ou lista principal */}
      <DataTable />
      
      {/* Modal */}
      <Modal />
    </div>
  )
}
```

#### 📊 Cards de Estatísticas
```typescript
// Padrão para StatsCards
interface StatsCardsProps {
  stats?: StatsType
  loading?: boolean
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return <LoadingSkeleton />
  }

  if (!stats) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card individual */}
    </div>
  )
}
```

#### 📋 Tabela de Dados
```typescript
// Padrão para DataTable
interface DataTableProps {
  data: DataType[]
  loading: boolean
  onEdit: (item: DataType) => void
  onDelete: (id: string) => void
  onView: (item: DataType) => void
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, loading, onEdit, onDelete, onView 
}) => {
  if (loading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return <EmptyTableState />
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Cabeçalho e corpo da tabela */}
      </table>
    </div>
  )
}
```

#### 🪟 Modal de Formulário
```typescript
// Padrão para Modal
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: DataType) => Promise<void>
  mode: 'create' | 'edit' | 'view'
  item?: DataType | null
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, onClose, onSave, mode, item 
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validação de formulário
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}
    // Implementar validações específicas
    return errors
  }

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Conteúdo do modal */}
    </Dialog>
  )
}
```

### 🔧 Service Layer

#### 📡 Estrutura do Service
```typescript
// Padrão para Services
class DataService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutos

  async getAll(): Promise<DataType[]> {
    try {
      const response = await apiClient.get('/endpoint')
      return (response.data || response) as DataType[]
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      throw error
    }
  }

  async getById(id: string): Promise<DataType> {
    try {
      const response = await apiClient.get(`/endpoint/${id}`)
      return (response.data || response) as DataType
    } catch (error) {
      console.error('Erro ao buscar item:', error)
      throw error
    }
  }

  async create(data: CreateDataType): Promise<DataType> {
    try {
      const response = await apiClient.post('/endpoint', data)
      this.clearCache()
      return (response.data || response) as DataType
    } catch (error) {
      console.error('Erro ao criar item:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateDataType): Promise<DataType> {
    try {
      const response = await apiClient.put(`/endpoint/${id}`, data)
      this.clearCache()
      return (response.data || response) as DataType
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/endpoint/${id}`)
      this.clearCache()
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      throw error
    }
  }

  private clearCache() {
    this.cache.clear()
  }
}

export const dataService = new DataService()
```

### 🛡️ API Routes

#### 📄 Estrutura da Route (`route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { withValidation, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/app/utils/validation'
import { CreateSchema, UpdateSchema } from '@/app/utils/schemas'
import { prisma } from '@/lib/prisma'

// GET - Listagem
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const user = getAuthenticatedUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // 2. Verificar permissões
    if (user.type === 'ESTABELECIMENTO') {
      return forbiddenResponse('Estabelecimentos não podem acessar esta funcionalidade')
    }

    // 3. Definir condições de filtro baseado no usuário
    let whereCondition = {}
    if (user.type === 'FRANQUEADO') {
      whereCondition = { franqueadoId: user.franqueadoId }
    }

    // 4. Buscar dados
    const data = await prisma.table.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(data, 'Dados obtidos com sucesso')

  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

// POST - Criação
const createHandler = async (data: any, request: NextRequest) => {
  const user = getAuthenticatedUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    // Validações específicas de negócio
    
    // Criar item
    const newItem = await prisma.table.create({
      data: {
        ...data,
        // Adicionar campos automáticos baseado no usuário
        franqueadoId: user.type === 'FRANQUEADO' ? user.franqueadoId : data.franqueadoId
      }
    })

    return successResponse(newItem, 'Item criado com sucesso')

  } catch (error) {
    console.error('Erro ao criar item:', error)
    return errorResponse('Erro interno do servidor', null, 500)
  }
}

export const POST = withValidation(CreateSchema, createHandler)
```

### 🎯 Schemas de Validação

#### 📋 Estrutura dos Schemas
```typescript
// schemas.ts
import { z } from 'zod'

export const CreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  // Outros campos...
})

export const UpdateSchema = CreateSchema.partial()

export type CreateInput = z.infer<typeof CreateSchema>
export type UpdateInput = z.infer<typeof UpdateSchema>
```

## 🚨 Erros Comuns a Evitar

### 🔒 Segurança
- ❌ **Não proteger rotas da API** - Sempre implementar `getAuthenticatedUser()`
- ❌ **Não filtrar dados por usuário** - Aplicar `whereCondition` baseado no tipo de usuário
- ❌ **Expor dados sensíveis** - Usar `select` para limitar campos retornados
- ❌ **Não validar entrada** - Sempre usar schemas Zod

### 💾 Dados
- ❌ **Não usar type casting** - Sempre fazer `(response.data || response) as Type`
- ❌ **Não limpar cache** - Chamar `clearCache()` após operações de modificação
- ❌ **Não tratar erros** - Implementar try-catch em todas as operações
- ❌ **Não remover máscaras** - Usar funções como `cnpjToDatabase()` antes de salvar

### 🎨 Interface
- ❌ **Não mostrar loading states** - Sempre implementar skeletons
- ❌ **Não tratar estados vazios** - Criar componentes para dados vazios
- ❌ **Não validar formulários** - Implementar validação no frontend
- ❌ **Não tratar senhas opcionais** - Em edição, senha deve ser opcional

### 📱 UX/UI
- ❌ **Botões sem feedback** - Sempre mostrar estado de loading em botões
- ❌ **Não fechar modais** - Chamar `onClose()` após sucesso
- ❌ **Não recarregar dados** - Atualizar listas após operações
- ❌ **Não mostrar mensagens de erro** - Implementar toasts/notificações

## 🎨 Padrões de UI Identificados

### 📊 Cards de Estatísticas
```typescript
// Padrão de StatCard
<div className="bg-white p-6 rounded-lg shadow">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <Icon className="h-8 w-8 text-blue-600" />
    </div>
    <div className="ml-5 w-0 flex-1">
      <dl>
        <dt className="text-sm font-medium text-gray-500 truncate">
          {title}
        </dt>
        <dd className="text-lg font-medium text-gray-900">
          {value}
        </dd>
      </dl>
    </div>
  </div>
</div>
```

### 🪟 Modal com Dialog
```typescript
// Padrão de Modal usando Dialog
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos do formulário */}
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### 📋 Tabela Responsiva
```typescript
// Padrão de Tabela
<div className="bg-white shadow overflow-hidden sm:rounded-md">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        {headers.map(header => (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {/* Linhas da tabela */}
    </tbody>
  </table>
</div>
```

### 🔄 Loading Skeletons
```typescript
// Padrão de Loading Skeleton
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </div>
        <div className="ml-5 flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  ))}
</div>
```

## 📚 Dependências Padrão

### 🎨 UI Components
- `@radix-ui/react-dialog` - Modais
- `@radix-ui/react-toast` - Notificações
- `lucide-react` - Ícones

### 🔧 Validação e Formulários
- `zod` - Validação de schemas
- `react-hook-form` (opcional) - Gerenciamento de formulários

### 🛡️ Autenticação
- `@/lib/auth` - Utilitários de autenticação
- `@/app/utils/validation` - Wrappers de validação

## 🔄 Fluxo de Desenvolvimento

1. **Criar Schema de Validação** (`schemas.ts`)
2. **Implementar API Route** (`route.ts`)
3. **Criar Service Layer** (`service.ts`)
4. **Desenvolver Componentes UI** (Modal, Table, Cards)
5. **Implementar Página Principal** (`page.tsx`)
6. **Testar Segurança** (Verificar proteções e permissões)
7. **Implementar Loading States** (Skeletons e feedbacks)
8. **Adicionar Tratamento de Erros** (Try-catch e mensagens)

## ✅ Checklist Final

- [ ] Todas as rotas API protegidas com autenticação
- [ ] Permissões implementadas por tipo de usuário
- [ ] Validação de dados com Zod
- [ ] Service layer com cache e error handling
- [ ] Loading states e skeletons implementados
- [ ] Formulários com validação frontend
- [ ] Estados vazios tratados
- [ ] Máscaras removidas antes de salvar dados
- [ ] Senhas opcionais em formulários de edição
- [ ] Feedback visual em todas as operações
- [ ] Testes de funcionalidade realizados
