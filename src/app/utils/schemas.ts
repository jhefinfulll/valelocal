import { z } from 'zod'

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  type: z.enum(['FRANQUEADORA', 'FRANQUEADO', 'ESTABELECIMENTO', 'USUARIO']),
  franqueadoraId: z.string().optional(),
  franqueadoId: z.string().optional(),
  estabelecimentoId: z.string().optional()
})

// Franqueadora Schemas
export const CreateFranqueadoraSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(10, 'Endereço deve ser mais detalhado'),
  logo: z.string().url().optional()
})

export const UpdateFranqueadoraSchema = CreateFranqueadoraSchema.partial()

// Franqueado Schemas
export const CreateFranqueadoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(10, 'Endereço deve ser mais detalhado'),
  region: z.string().min(2, 'Região deve ser especificada'),
  comissionRate: z.number().min(0).max(100, 'Taxa de comissão deve estar entre 0 e 100'),
  status: z.enum(['ATIVO', 'INATIVO']).optional().default('ATIVO'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  logo: z.string().url().optional()
})

export const UpdateFranqueadoSchema = CreateFranqueadoSchema.partial().extend({
  password: z.union([
    z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    z.literal(''),
    z.undefined()
  ]).optional()
})

// Estabelecimento Schemas
export const CreateEstabelecimentoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(10, 'Endereço deve ser mais detalhado'),
  category: z.string().min(2, 'Categoria deve ser especificada'),
  franqueadoId: z.string(),
  logo: z.string().url('Logo deve ser uma URL válida').or(z.literal('')).optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
})

export const UpdateEstabelecimentoSchema = CreateEstabelecimentoSchema.partial()

// Cartão Schemas
export const CreateCartaoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  qrCode: z.string().min(1, 'QR Code é obrigatório'),
  franqueadoId: z.string(),
  estabelecimentoId: z.string().optional(),
  valor: z.number().min(0, 'Valor deve ser maior que 0').optional()
})

export const RecargarCartaoSchema = z.object({
  valor: z.number().min(1, 'Valor deve ser maior que 0')
})

export const UtilizarCartaoSchema = z.object({
  usuarioNome: z.string().min(2, 'Nome do usuário é obrigatório'),
  usuarioTelefone: z.string().min(10, 'Telefone do usuário é obrigatório')
})

// Transação Schemas
export const CreateTransacaoSchema = z.object({
  tipo: z.enum(['RECARGA', 'UTILIZACAO']),
  valor: z.number().min(0.01, 'Valor deve ser maior que 0'),
  cartaoId: z.string(),
  estabelecimentoId: z.string(),
  usuarioNome: z.string().optional(),
  usuarioTelefone: z.string().optional()
})

// Solicitação de Cartão Schemas
export const CreateSolicitacaoSchema = z.object({
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  estabelecimentoId: z.string(),
  franqueadoId: z.string(),
  observacoes: z.string().optional()
})

export const UpdateSolicitacaoSchema = z.object({
  status: z.enum(['PENDENTE', 'APROVADA', 'NEGADA', 'ENVIADA', 'ENTREGUE']),
  observacoes: z.string().optional()
})

// Display Schemas
export const CreateDisplaySchema = z.object({
  tipo: z.enum(['BALCAO', 'PAREDE', 'MESA']),
  franqueadoId: z.string(),
  estabelecimentoId: z.string().optional()
})

export const UpdateDisplaySchema = z.object({
  status: z.enum(['DISPONIVEL', 'INSTALADO', 'MANUTENCAO']),
  estabelecimentoId: z.string().optional(),
  dataInstalacao: z.string().datetime().optional()
})

// Configuração Schemas
export const CreateConfiguracaoSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória'),
  valor: z.string(),
  descricao: z.string().optional(),
  tipo: z.enum(['TEXTO', 'NUMERO', 'BOOLEAN', 'JSON']).default('TEXTO')
})

export const UpdateConfiguracaoSchema = CreateConfiguracaoSchema.partial()

// Query Schemas
export const PaginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  limit: z.string().optional().transform(val => parseInt(val || '10', 10)),
  search: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional()
})

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Types derivados dos schemas
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type CreateFranqueadoraInput = z.infer<typeof CreateFranqueadoraSchema>
export type UpdateFranqueadoraInput = z.infer<typeof UpdateFranqueadoraSchema>
export type CreateFranqueadoInput = z.infer<typeof CreateFranqueadoSchema>
export type UpdateFranqueadoInput = z.infer<typeof UpdateFranqueadoSchema>
export type CreateEstabelecimentoInput = z.infer<typeof CreateEstabelecimentoSchema>
export type UpdateEstabelecimentoInput = z.infer<typeof UpdateEstabelecimentoSchema>
export type CreateCartaoInput = z.infer<typeof CreateCartaoSchema>
export type RecargarCartaoInput = z.infer<typeof RecargarCartaoSchema>
export type UtilizarCartaoInput = z.infer<typeof UtilizarCartaoSchema>
export type CreateTransacaoInput = z.infer<typeof CreateTransacaoSchema>
export type CreateSolicitacaoInput = z.infer<typeof CreateSolicitacaoSchema>
export type UpdateSolicitacaoInput = z.infer<typeof UpdateSolicitacaoSchema>
export type CreateDisplayInput = z.infer<typeof CreateDisplaySchema>
export type UpdateDisplayInput = z.infer<typeof UpdateDisplaySchema>
export type CreateConfiguracaoInput = z.infer<typeof CreateConfiguracaoSchema>
export type UpdateConfiguracaoInput = z.infer<typeof UpdateConfiguracaoSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
export type DateRangeInput = z.infer<typeof DateRangeSchema>
