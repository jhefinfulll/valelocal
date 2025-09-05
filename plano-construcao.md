# PLANO DE CONSTRUÇÃO - VALE LOCAL

## ANÁLISE DO SISTEMA ANTIGO

### O que foi implementado:
- ✅ **Prisma Schema**: Estrutura do banco já completa e bem modelada
- ✅ **APIs**: Rotas da pasta `src/app/api` já estão funcionando
- ✅ **Layout Base**: Estrutura visual das páginas antigas será referência
- ✅ **Fluxo de Negócio**: Documentado no `fluxo.md`
- ✅ **Sistema de Autenticação**: Login funcional com JWT e cache criptografado
- ✅ **Layout Principal**: DashboardLayout com navegação e header
- ✅ **Tela de Login**: Interface moderna com preenchimento rápido para desenvolvimento
- ✅ **Tela de Configurações**: Sistema completo com 5 abas (Sistema, Comissões, Email, Segurança, Notificações)
- ✅ **Database Seed**: Script para popular configurações iniciais (38 configurações criadas)
- ✅ **API Configurações**: GET e POST funcionando com logs e validação

### O que será reconstruído:
- ❌ **Todos os componentes React**: Recriar com padrões modernos
- ❌ **Sistema de autenticação frontend**: Nova implementação
- ❌ **Hooks personalizados**: Reconstruir com melhor arquitetura
- ❌ **Estados globais**: Nova implementação com Context API
- ❌ **Validações frontend**: Padronizar com Zod/React Hook Form

---

## ESTRUTURA DE PASTAS PROPOSTA

```
src/
├── app/                          # App Router (já existe)
│   ├── api/                      # APIs prontas (manter)
│   ├── auth/                     # Páginas de autenticação
│   │   ├── login/
│   │   └── forgot-password/
│   ├── dashboard/                # Dashboard principal
│   │   ├── franqueadora/         # Dashboard específica franqueadora
│   │   ├── franqueado/           # Dashboard específica franqueado
│   │   ├── estabelecimento/      # Dashboard específica estabelecimento
│   │   └── usuario/              # Dashboard específica usuário
│   ├── cartoes/                  # Gestão de cartões
│   ├── estabelecimentos/         # Gestão de estabelecimentos
│   ├── franqueados/             # Gestão de franqueados
│   ├── comissoes/               # Gestão de comissões
│   ├── transacoes/              # Gestão de transações
│   ├── relatorios/              # Relatórios
│   ├── configuracoes/           # Configurações
│   ├── solicitacoes/            # Solicitações de cartões
│   ├── displays/                # Gestão de displays
│   └── logs/                    # Logs do sistema
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes básicos de UI
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Table/
│   │   ├── Card/
│   │   ├── Badge/
│   │   └── Loading/
│   ├── forms/                   # Componentes de formulários
│   │   ├── InputMask/           # Máscaras brasileiras
│   │   ├── FormField/
│   │   ├── FormValidation/
│   │   └── AutoComplete/
│   ├── layout/                  # Componentes de layout
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── Container/
│   ├── dashboard/               # Componentes específicos do dashboard
│   │   ├── StatsCard/
│   │   ├── Chart/
│   │   └── QuickActions/
│   └── business/                # Componentes específicos do negócio
│       ├── CartaoCard/
│       ├── EstabelecimentoCard/
│       ├── FranqueadoCard/
│       └── TransacaoItem/
├── contexts/                    # Context API
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── ToastContext.tsx
│   └── AppContext.tsx
├── hooks/                       # Hooks personalizados
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
├── lib/                        # Utilitários e configurações
│   ├── api.ts                  # Cliente HTTP
│   ├── auth.ts                 # Utilitários de auth (já existe)
│   ├── prisma.ts               # Cliente Prisma (já existe)
│   ├── masks.ts                # Máscaras brasileiras
│   ├── validations.ts          # Schemas de validação
│   ├── constants.ts            # Constantes da aplicação
│   └── utils.ts                # Funções utilitárias
├── types/                      # Tipos TypeScript
│   ├── api.ts
│   ├── auth.ts
│   ├── business.ts
│   └── common.ts
└── styles/                     # Estilos globais
    ├── globals.css
    └── components.css
```

---

## COMPONENTES PADRÃO A DESENVOLVER

### 1. **Sistema de Toasts**
```typescript
// Funcionalidades:
- Success, Error, Warning, Info
- Auto-dismiss configurável
- Ações customizáveis
- Posicionamento flexível
- Stack de notificações
```

### 2. **Máscaras Brasileiras**
```typescript
// Máscaras necessárias:
- CPF: 000.000.000-00
- CNPJ: 00.000.000/0000-00
- Telefone: (00) 00000-0000
- CEP: 00000-000
- Moeda: R$ 0.000,00
- Porcentagem: 00,00%
```

### 3. **Sistema de Modais**
```typescript
// Tipos de modais:
- Confirmação (Sim/Não)
- Criação/Edição de entidades
- Visualização de detalhes
- Seleção múltipla
- Upload de arquivos
```

### 4. **Componentes de Tabela**
```typescript
// Funcionalidades:
- Paginação
- Ordenação
- Filtros
- Busca
- Seleção múltipla
- Ações em lote
- Export (CSV, Excel, PDF)
```

---

## DASHBOARDS ESPECÍFICAS

### 1. **Dashboard Franqueadora**
- Overview geral da rede
- Métricas de franqueados
- Volume de transações
- Comissões pendentes
- Relatórios consolidados
- Gestão de aprovações

### 2. **Dashboard Franqueado**
- Seus estabelecimentos
- Performance da região
- Comissões a receber
- Solicitações pendentes
- Relatórios regionais

### 3. **Dashboard Estabelecimento**
- Seus cartões ativos
- Transações do dia/mês
- Saldo disponível
- Histórico de uso
- Solicitação de cartões

### 4. **Dashboard Usuário**
- Cartões disponíveis
- Histórico de uso
- Estabelecimentos próximos
- Saldo atual

---

## FLUXOS PRINCIPAIS A IMPLEMENTAR

### 1. **Ativação do Franqueado**
```
Franqueadora → Cadastra franqueado → Gera acesso → 
Franqueado recebe login → Pode cadastrar estabelecimentos
```

### 2. **Ativação do Estabelecimento**
```
Franqueado → Cadastra estabelecimento → Franqueadora aprova → 
Sistema libera cartões → Produção física → Entrega → 
Estabelecimento operacional
```

### 3. **Recarga do Cartão**
```
Estabelecimento → App móvel → Seleciona valor → 
Confirma recarga → Sistema registra → QR Code ativo
```

### 4. **Uso do Cartão**
```
Cliente → Apresenta cartão → Estabelecimento escaneia → 
Valida saldo → Registra uso → Deduz valor
```

### 5. **Reposição de Cartões**
```
Franqueado → Solicita cartões → Franqueadora aprova → 
Sistema libera etiquetas → Produção → Entrega
```

---

## FUNCIONALIDADES CRÍTICAS

### 1. **Sistema de Permissões**
- FRANQUEADORA: Acesso total
- FRANQUEADO: Seus estabelecimentos e região
- ESTABELECIMENTO: Apenas seus dados
- USUARIO: Apenas seus cartões

### 2. **Gestão de Estados**
- Cartões: DISPONIVEL → ATIVO → UTILIZADO
- Estabelecimentos: RASCUNHO → PENDENTE_PAGAMENTO → ATIVO
- Transações: PENDENTE → CONCLUIDA → CANCELADA

### 3. **Integração com ASAAS**
- Cobrança de ativações
- Webhooks de pagamento
- Gestão de clientes
- Relatórios financeiros

### 4. **Sistema de Logs**
- Auditoria completa
- Rastreamento de mudanças
- IP e User-Agent
- Histórico de ações

---

## PRIORIDADES DE DESENVOLVIMENTO

### **FASE 1 - FUNDAÇÃO (Semana 1-2)**
1. ✅ Configurar estrutura de pastas
2. ✅ Criar componentes UI básicos
3. ✅ Implementar sistema de autenticação
4. ✅ Configurar Context API
5. ✅ Criar layouts principais

### **FASE 2 - DASHBOARDS (Semana 3-4)**
1. ✅ Dashboard Franqueadora
2. ✅ Dashboard Franqueado
3. ✅ Dashboard Estabelecimento
4. ✅ Dashboard Usuário
5. ✅ Navegação entre dashboards

### **FASE 3 - GESTÃO PRINCIPAL (Semana 5-7)**
1. ✅ Gestão de Franqueados
2. ✅ Gestão de Estabelecimentos
3. ✅ Gestão de Cartões
4. ✅ Sistema de Solicitações
5. ✅ Gestão de Transações

### **FASE 4 - INTEGRAÇÕES (Semana 8-9)**
1. ✅ Integração ASAAS completa
2. ✅ Sistema de Cobrançasdocker 
3. ✅ Webhooks
4. ✅ Notificações por email
5. ✅ Relatórios avançados

### **FASE 5 - POLIMENTO (Semana 10)**
1. ✅ Testes completos
2. ✅ Otimizações de performance
3. ✅ Documentação
4. ✅ Deploy e configuração
5. ✅ Treinamento de usuários

---

## PADRÕES DE DESENVOLVIMENTO

### **Nomenclatura**
- Componentes: PascalCase (Ex: `EstabelecimentoCard`)
- Hooks: camelCase com 'use' (Ex: `useEstabelecimentos`)
- Tipos: PascalCase (Ex: `EstabelecimentoType`)
- Arquivos: kebab-case (Ex: `estabelecimento-card.tsx`)

### **Estrutura de Componentes**
```typescript
// Sempre seguir esta estrutura:
interface Props {
  // Props tipadas
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Estados locais
  // Hooks personalizados
  // Funções auxiliares
  // useEffects
  
  return (
    // JSX
  );
}
```

### **Padrão de API Calls**
```typescript
// Sempre usar try/catch
// Sempre mostrar loading
// Sempre tratar erros com toast
// Sempre validar dados
```

### **Padrão de Formulários**
```typescript
// Sempre usar React Hook Form
// Sempre validar com Zod
// Sempre usar máscaras brasileiras
// Sempre feedback visual de erros
```

---

## OBSERVAÇÕES IMPORTANTES

1. **Não reutilizar código antigo**: Começar do zero garante código limpo
2. **Usar TypeScript strict**: Tipagem rigorosa evita bugs
3. **Componentes pequenos**: Cada componente com responsabilidade única
4. **Testes desde o início**: TDD quando possível
5. **Documentação inline**: Código autodocumentado
6. **Performance first**: Lazy loading, memoização, otimizações
7. **Mobile responsive**: Design first mobile
8. **Acessibilidade**: Seguir padrões WCAG
9. **SEO friendly**: Meta tags e estrutura semântica
10. **Monitoramento**: Logs e analytics desde o início

---

## PRÓXIMOS PASSOS

1. ✅ **Criar estrutura de pastas**
2. ✅ **Implementar componentes UI básicos**
3. ✅ **Configurar autenticação**
4. ✅ **Criar primeira dashboard**
5. ✅ **Implementar gestão de entidades**

**Objetivo**: Sistema completo e funcional em 10 semanas, seguindo as melhores práticas de desenvolvimento moderno.
