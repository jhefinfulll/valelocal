import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'vale-local-default-key-2025'

/**
 * Criptografa um valor antes de armazenar no localStorage
 */
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Erro ao criptografar dados:', error)
    throw new Error('Falha na criptografia')
  }
}

/**
 * Descriptografa um valor do localStorage
 */
export function decryptData<T>(encryptedData: string): T {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!jsonString) {
      throw new Error('Dados corrompidos')
    }
    
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error)
    throw new Error('Falha na descriptografia')
  }
}

/**
 * Armazena dados criptografados no localStorage
 */
export function setSecureItem(key: string, value: any): void {
  try {
    const encrypted = encryptData(value)
    localStorage.setItem(key, encrypted)
  } catch (error) {
    console.error('Erro ao armazenar dados seguros:', error)
    throw error
  }
}

/**
 * Recupera e descriptografa dados do localStorage
 */
export function getSecureItem<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) {
      return null
    }
    
    return decryptData<T>(encrypted)
  } catch (error) {
    console.error('Erro ao recuperar dados seguros:', error)
    // Remove dados corrompidos
    localStorage.removeItem(key)
    return null
  }
}

/**
 * Remove dados criptografados do localStorage
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(key)
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAuthData(): void {
  removeSecureItem('auth_token')
  removeSecureItem('auth_user')
  removeSecureItem('auth_refresh_token')
}
