'use client'

/**
 * Remove máscara e retorna apenas números
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Converte CNPJ mascarado para formato de banco (apenas números)
 */
export const cnpjToDatabase = (cnpj: string): string => {
  return removeMask(cnpj)
}

/**
 * Converte telefone mascarado para formato de banco (apenas números)
 */
export const phoneToDatabase = (phone: string): string => {
  return removeMask(phone)
}

/**
 * Aplica máscara de CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export const maskCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
}

/**
 * Aplica máscara de telefone (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

/**
 * Aplica máscara de CEP (XXXXX-XXX)
 */
export const maskCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 5) return numbers
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

/**
 * Aplica máscara de CPF (XXX.XXX.XXX-XX)
 */
export const maskCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

/**
 * Aplica máscara monetária (R$ X.XXX,XX)
 */
export const maskMoney = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  const amount = parseFloat(numbers) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

/**
 * Aplica máscara de porcentagem (XX,XX%)
 */
export const maskPercentage = (value: string): string => {
  const numbers = value.replace(/[^\d,.-]/g, '')
  
  if (!numbers) return ''
  
  const num = parseFloat(numbers.replace(',', '.'))
  if (isNaN(num)) return ''
  
  return `${num.toFixed(2).replace('.', ',')}%`
}

/**
 * Remove todas as máscaras deixando apenas números
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = unmask(cnpj)
  
  if (numbers.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false
  
  // Validação dos dígitos verificadores
  let soma = 0
  let pos = 5
  
  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    soma += parseInt(numbers.charAt(i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(numbers.charAt(12))) return false
  
  // Segundo dígito verificador
  soma = 0
  pos = 6
  for (let i = 0; i < 13; i++) {
    soma += parseInt(numbers.charAt(i)) * pos--
    if (pos < 2) pos = 9
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  return resultado === parseInt(numbers.charAt(13))
}

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = unmask(cpf)
  
  if (numbers.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false
  
  // Validação dos dígitos verificadores
  let soma = 0
  
  // Primeiro dígito verificador
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numbers.charAt(i)) * (10 - i)
  }
  
  let resultado = (soma * 10) % 11
  if (resultado === 10 || resultado === 11) resultado = 0
  if (resultado !== parseInt(numbers.charAt(9))) return false
  
  // Segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numbers.charAt(i)) * (11 - i)
  }
  
  resultado = (soma * 10) % 11
  if (resultado === 10 || resultado === 11) resultado = 0
  return resultado === parseInt(numbers.charAt(10))
}

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida telefone
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = unmask(phone)
  return numbers.length === 10 || numbers.length === 11
}

/**
 * Formata valores monetários para exibição
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formata porcentagem para exibição
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1).replace('.', ',')}%`
}

/**
 * Formata data para exibição brasileira
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata data e hora para exibição brasileira
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}
