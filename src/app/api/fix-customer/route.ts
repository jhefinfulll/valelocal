import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/app/utils/validation';
import prisma from '@/lib/prisma';
import { asaasService } from '@/services/asaasService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Corrigindo customer ID inválido do franqueado...');
    
    // Buscar franqueado com customer ID inválido
    const franqueado = await prisma.franqueados.findFirst({
      where: {
        asaasCustomerId: 'cus_000005925892'
      }
    });
    
    if (!franqueado) {
      return errorResponse('Franqueado com customer ID inválido não encontrado', null, 404);
    }
    
    console.log('🎯 Franqueado encontrado:', {
      name: franqueado.name,
      cnpj: franqueado.cnpj,
      currentCustomerId: franqueado.asaasCustomerId
    });
    
    // Criar novo customer no Asaas
    const newCustomer = await asaasService.createCustomer({
      name: franqueado.name,
      cpfCnpj: franqueado.cnpj,
      email: franqueado.email,
      phone: franqueado.phone || '',
      mobilePhone: franqueado.phone || ''
    });
    
    console.log('✅ Novo customer criado:', newCustomer.id);
    
    // Atualizar o franqueado no banco
    const updatedFranqueado = await prisma.franqueados.update({
      where: { id: franqueado.id },
      data: { asaasCustomerId: newCustomer.id }
    });
    
    console.log('✅ Franqueado atualizado com novo customer ID:', newCustomer.id);
    
    return successResponse({
      franqueado: {
        id: updatedFranqueado.id,
        name: updatedFranqueado.name,
        oldCustomerId: 'cus_000005925892',
        newCustomerId: newCustomer.id
      }
    }, 'Customer ID corrigido com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir customer ID:', error);
    return errorResponse('Erro interno do servidor', null, 500);
  }
}
