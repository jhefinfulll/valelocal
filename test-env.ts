// Test environment variables
console.log('🔬 Testing environment variables:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('ASAAS_API_KEY exists:', !!process.env.ASAAS_API_KEY)
console.log('ASAAS_API_KEY preview:', process.env.ASAAS_API_KEY ? `${process.env.ASAAS_API_KEY.substring(0, 20)}...` : 'UNDEFINED')
console.log('ASAAS_SANDBOX:', process.env.ASAAS_SANDBOX)
console.log('All ASAAS env vars:', Object.keys(process.env).filter(k => k.includes('ASAAS')))

// Check if running in browser
console.log('Is server-side:', typeof window === 'undefined')

export {};
