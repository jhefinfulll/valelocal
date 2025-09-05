// Helper para carregar variáveis de ambiente com fallback
export function getAsaasConfig() {
  // Tentar várias possibilidades de onde a API key pode estar
  const apiKey = 
    process.env.ASAAS_API_KEY || 
    process.env.NEXT_PUBLIC_ASAAS_API_KEY ||
    "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjZhODg5NzNmLTc2MGYtNGIzMS05MDVmLTkxMWY2YjBiNTZmODo6JGFhY2hfNGY4MTVmOGMtNzM4OS00OWFmLTkzZDMtMGE3ODg3NmY0Zjdi"; // Fallback para desenvolvimento

  const isSandbox = process.env.ASAAS_SANDBOX !== 'false';
  
  console.log('🔧 getAsaasConfig():', {
    hasApiKey: !!apiKey,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 20)}...` : 'UNDEFINED',
    isSandbox,
    envVars: Object.keys(process.env).filter(k => k.includes('ASAAS'))
  });

  return {
    apiKey,
    isSandbox,
    baseURL: isSandbox 
      ? 'https://sandbox.asaas.com/api/v3' 
      : 'https://www.asaas.com/api/v3'
  };
}
