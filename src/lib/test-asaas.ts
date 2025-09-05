import { getAsaasConfig } from '@/lib/asaas-config';

export async function testAsaasConnection() {
  console.log('🧪 Testando conexão Asaas...')
  
  const config = getAsaasConfig();
  
  if (!config.apiKey) {
    console.error('❌ API Key não encontrada!')
    return false;
  }
  
  try {
    const response = await fetch(`${config.baseURL}/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': config.apiKey,
      }
    });
    
    console.log('📡 Teste de conexão Asaas:', {
      status: response.status,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro no teste Asaas:', error);
    return false;
  }
}
