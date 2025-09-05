// Email Service - Implementação básica
export interface EmailCredentials {
  to: string
  franqueadoName: string
  email: string
  tempPassword: string
  franqueadoraName: string
}

class EmailService {
  async sendCredentials(params: EmailCredentials): Promise<void> {
    console.log('📧 Email de credenciais enviado para:', params.to)
    console.log('📧 Dados:', {
      franqueado: params.franqueadoName,
      email: params.email,
      tempPassword: '***',
      franqueadora: params.franqueadoraName
    })
    
    // TODO: Implementar envio real de email
    // Por enquanto, apenas simular o envio
    return Promise.resolve()
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    console.log('📧 Email de boas-vindas enviado para:', to, 'Nome:', name)
    return Promise.resolve()
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    console.log('📧 Email de reset de senha enviado para:', to, 'Token:', resetToken)
    return Promise.resolve()
  }
}

export const emailService = new EmailService()
