const { Client } = require('pg');
require('dotenv').config();

async function updateFranqueado() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao banco de dados');

    // Atualizar franqueado com um asaasCustomerId válido para testes
    const updateQuery = `
      UPDATE franqueados 
      SET "asaasCustomerId" = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    // Usando um ID do Asaas sandbox válido (geralmente começam com 'cus_')
    const testAsaasCustomerId = 'cus_000005925892'; // ID de teste típico do Asaas sandbox
    
    const result = await client.query(updateQuery, [
      testAsaasCustomerId, 
      '11fb1d74-5579-458d-b4eb-812728a028be'
    ]);
    
    console.log('✅ Franqueado atualizado:', result.rows[0]);
    
    // Verificar se a atualização funcionou
    const verifyQuery = `
      SELECT id, name, "asaasCustomerId", "updatedAt"
      FROM franqueados 
      WHERE id = $1
    `;
    
    const verifyResult = await client.query(verifyQuery, ['11fb1d74-5579-458d-b4eb-812728a028be']);
    console.log('🔍 Verificação:', verifyResult.rows[0]);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

updateFranqueado();
