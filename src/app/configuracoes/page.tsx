'use client'

import React, { useState, useEffect } from 'react'
import { 
  FiSave,
  FiSettings,
  FiMail,
  FiShield,
  FiDollarSign,
  FiPercent,
  FiClock,
  FiGlobe,
  FiUser,
  FiKey,
  FiEye,
  FiEyeOff,
  FiToggleLeft,
  FiToggleRight,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

interface ConfiguracaoData {
  id?: string
  chave: string
  valor: string
  tipo: 'TEXTO' | 'NUMERO' | 'BOOLEAN' | 'JSON'
  descricao?: string
}

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('sistema')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  // Estados das configurações
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoData[]>([])
  
  // Estados organizados por tipo
  const [sistemaConfig, setSistemaConfig] = useState({
    nomeEmpresa: 'ValeLocal Sistema',
    email: 'contato@valelocal.com.br',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Empresas, 123 - São Paulo, SP',
    logo: '',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR'
  })

  const [comissaoConfig, setComissaoConfig] = useState({
    percentualPadrao: 5.0,
    percentualMinimo: 1.0,
    percentualMaximo: 15.0,
    diasPagamento: 30,
    valorMinimoSaque: 100.0,
    autoProcessamento: true
  })

  const [emailConfig, setEmailConfig] = useState({
    servidor: 'smtp.gmail.com',
    porta: 587,
    usuario: 'sistema@valelocal.com.br',
    senha: '',
    criptografia: 'TLS',
    remetentePadrao: 'ValeLocal <noreply@valelocal.com.br>',
    ativo: true
  })

  const [segurancaConfig, setSegurancaConfig] = useState({
    senhaMinima: 8,
    exigirCaracteresEspeciais: true,
    exigirNumeros: true,
    exigirMaiusculaMinuscula: true,
    tentativasMaximasLogin: 5,
    tempoBloqueioConta: 30,
    sessaoExpiraEm: 8,
    autenticacaoDoisFatores: false
  })

  const [notificacaoConfig, setNotificacaoConfig] = useState({
    emailNovaTransacao: true,
    emailComissaoPaga: true,
    emailNovoCartao: true,
    emailRelatorioSemanal: true,
    smsTransacao: false,
    whatsappNotificacoes: true,
    pushNotifications: true
  })

  // Carregar configurações
  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔧 Carregando configurações...')
      const response = await apiClient.get('/configuracoes')
      console.log('📄 Resposta da API:', response.data)
      
      const apiData = response.data as any
      const configs = apiData.data || apiData || []
      console.log('⚙️ Configurações carregadas:', configs.length)

      // Organizar configurações por tipo
      configs.forEach((config: ConfiguracaoData) => {
        const valor = config.valor
        console.log(`📝 Processando: ${config.chave} = ${valor}`)
        
        // Agrupar por chaves do sistema
        if (config.chave.includes('sistema.')) {
          const key = config.chave.replace('sistema.', '')
          console.log(`🔧 Sistema config: ${key}`)
          if (key === 'nomeEmpresa') setSistemaConfig(prev => ({ ...prev, nomeEmpresa: valor }))
          if (key === 'email') setSistemaConfig(prev => ({ ...prev, email: valor }))
          if (key === 'telefone') setSistemaConfig(prev => ({ ...prev, telefone: valor }))
          if (key === 'endereco') setSistemaConfig(prev => ({ ...prev, endereco: valor }))
          if (key === 'timezone') setSistemaConfig(prev => ({ ...prev, timezone: valor }))
        }
        
        if (config.chave.includes('comissao.')) {
          const key = config.chave.replace('comissao.', '')
          console.log(`💰 Comissão config: ${key}`)
          if (key === 'percentualPadrao') setComissaoConfig(prev => ({ ...prev, percentualPadrao: parseFloat(valor) || 5.0 }))
          if (key === 'diasPagamento') setComissaoConfig(prev => ({ ...prev, diasPagamento: parseInt(valor) || 30 }))
          if (key === 'valorMinimoSaque') setComissaoConfig(prev => ({ ...prev, valorMinimoSaque: parseFloat(valor) || 100.0 }))
          if (key === 'autoProcessamento') setComissaoConfig(prev => ({ ...prev, autoProcessamento: valor === 'true' }))
        }
        
        if (config.chave.includes('email.')) {
          const key = config.chave.replace('email.', '')
          console.log(`📧 Email config: ${key}`)
          if (key === 'servidor') setEmailConfig(prev => ({ ...prev, servidor: valor }))
          if (key === 'porta') setEmailConfig(prev => ({ ...prev, porta: parseInt(valor) || 587 }))
          if (key === 'usuario') setEmailConfig(prev => ({ ...prev, usuario: valor }))
          if (key === 'ativo') setEmailConfig(prev => ({ ...prev, ativo: valor === 'true' }))
        }
        
        if (config.chave.includes('seguranca.')) {
          const key = config.chave.replace('seguranca.', '')
          console.log(`🔒 Segurança config: ${key}`)
          if (key === 'senhaMinima') setSegurancaConfig(prev => ({ ...prev, senhaMinima: parseInt(valor) || 8 }))
          if (key === 'tentativasMaximasLogin') setSegurancaConfig(prev => ({ ...prev, tentativasMaximasLogin: parseInt(valor) || 5 }))
          if (key === 'exigirCaracteresEspeciais') setSegurancaConfig(prev => ({ ...prev, exigirCaracteresEspeciais: valor === 'true' }))
          if (key === 'exigirNumeros') setSegurancaConfig(prev => ({ ...prev, exigirNumeros: valor === 'true' }))
        }

        if (config.chave.includes('notificacao.')) {
          const key = config.chave.replace('notificacao.', '')
          console.log(`🔔 Notificação config: ${key}`)
          if (key === 'emailNovaTransacao') setNotificacaoConfig(prev => ({ ...prev, emailNovaTransacao: valor === 'true' }))
          if (key === 'emailComissaoPaga') setNotificacaoConfig(prev => ({ ...prev, emailComissaoPaga: valor === 'true' }))
          if (key === 'smsTransacao') setNotificacaoConfig(prev => ({ ...prev, smsTransacao: valor === 'true' }))
        }
      })
      
      setConfiguracoes(configs)
      console.log('✅ Configurações carregadas com sucesso!')
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar configurações:', err)
      setError('Erro ao carregar configurações: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const salvarConfiguracoes = async (tipo: string) => {
    try {
      setSaving(true)
      setError('')

      let configsParaSalvar: any[] = []

      switch (tipo) {
        case 'sistema':
          configsParaSalvar = [
            { chave: 'sistema.nomeEmpresa', valor: sistemaConfig.nomeEmpresa, tipo: 'TEXTO' },
            { chave: 'sistema.email', valor: sistemaConfig.email, tipo: 'TEXTO' },
            { chave: 'sistema.telefone', valor: sistemaConfig.telefone, tipo: 'TEXTO' },
            { chave: 'sistema.endereco', valor: sistemaConfig.endereco, tipo: 'TEXTO' },
            { chave: 'sistema.timezone', valor: sistemaConfig.timezone, tipo: 'TEXTO' }
          ]
          break
          
        case 'comissoes':
          configsParaSalvar = [
            { chave: 'comissao.percentualPadrao', valor: comissaoConfig.percentualPadrao.toString(), tipo: 'NUMERO' },
            { chave: 'comissao.diasPagamento', valor: comissaoConfig.diasPagamento.toString(), tipo: 'NUMERO' },
            { chave: 'comissao.valorMinimoSaque', valor: comissaoConfig.valorMinimoSaque.toString(), tipo: 'NUMERO' },
            { chave: 'comissao.autoProcessamento', valor: comissaoConfig.autoProcessamento.toString(), tipo: 'BOOLEAN' }
          ]
          break
          
        case 'email':
          configsParaSalvar = [
            { chave: 'email.servidor', valor: emailConfig.servidor, tipo: 'TEXTO' },
            { chave: 'email.porta', valor: emailConfig.porta.toString(), tipo: 'NUMERO' },
            { chave: 'email.usuario', valor: emailConfig.usuario, tipo: 'TEXTO' },
            { chave: 'email.criptografia', valor: emailConfig.criptografia, tipo: 'TEXTO' },
            { chave: 'email.remetentePadrao', valor: emailConfig.remetentePadrao, tipo: 'TEXTO' },
            { chave: 'email.ativo', valor: emailConfig.ativo.toString(), tipo: 'BOOLEAN' }
          ]
          if (emailConfig.senha) {
            configsParaSalvar.push({ chave: 'email.senha', valor: emailConfig.senha, tipo: 'TEXTO' })
          }
          break
          
        case 'seguranca':
          configsParaSalvar = [
            { chave: 'seguranca.senhaMinima', valor: segurancaConfig.senhaMinima.toString(), tipo: 'NUMERO' },
            { chave: 'seguranca.tentativasMaximasLogin', valor: segurancaConfig.tentativasMaximasLogin.toString(), tipo: 'NUMERO' },
            { chave: 'seguranca.tempoBloqueioConta', valor: segurancaConfig.tempoBloqueioConta.toString(), tipo: 'NUMERO' },
            { chave: 'seguranca.sessaoExpiraEm', valor: segurancaConfig.sessaoExpiraEm.toString(), tipo: 'NUMERO' },
            { chave: 'seguranca.exigirCaracteresEspeciais', valor: segurancaConfig.exigirCaracteresEspeciais.toString(), tipo: 'BOOLEAN' },
            { chave: 'seguranca.exigirNumeros', valor: segurancaConfig.exigirNumeros.toString(), tipo: 'BOOLEAN' },
            { chave: 'seguranca.exigirMaiusculaMinuscula', valor: segurancaConfig.exigirMaiusculaMinuscula.toString(), tipo: 'BOOLEAN' },
            { chave: 'seguranca.autenticacaoDoisFatores', valor: segurancaConfig.autenticacaoDoisFatores.toString(), tipo: 'BOOLEAN' }
          ]
          break
          
        case 'notificacoes':
          configsParaSalvar = [
            { chave: 'notificacao.emailNovaTransacao', valor: notificacaoConfig.emailNovaTransacao.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.emailComissaoPaga', valor: notificacaoConfig.emailComissaoPaga.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.emailNovoCartao', valor: notificacaoConfig.emailNovoCartao.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.emailRelatorioSemanal', valor: notificacaoConfig.emailRelatorioSemanal.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.smsTransacao', valor: notificacaoConfig.smsTransacao.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.whatsappNotificacoes', valor: notificacaoConfig.whatsappNotificacoes.toString(), tipo: 'BOOLEAN' },
            { chave: 'notificacao.pushNotifications', valor: notificacaoConfig.pushNotifications.toString(), tipo: 'BOOLEAN' }
          ]
          break
      }

      // Salvar cada configuração
      for (const config of configsParaSalvar) {
        try {
          await apiClient.post('/configuracoes', config)
        } catch (err: any) {
          console.error(`Erro ao salvar ${config.chave}:`, err)
          // Continue tentando salvar as outras configurações
        }
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (err) {
      setError('Erro ao salvar configurações')
      console.error('Erro ao salvar configurações:', err)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'sistema', label: 'Sistema', icon: FiSettings },
    { id: 'comissoes', label: 'Comissões', icon: FiDollarSign },
    { id: 'email', label: 'E-mail', icon: FiMail },
    { id: 'seguranca', label: 'Segurança', icon: FiShield },
    { id: 'notificacoes', label: 'Notificações', icon: FiGlobe }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sistema':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Sistema</h3>
              <p className="text-sm text-gray-600 mb-6">Configure as informações básicas do sistema</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={sistemaConfig.nomeEmpresa}
                  onChange={(e) => setSistemaConfig({...sistemaConfig, nomeEmpresa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail Principal
                </label>
                <input
                  type="email"
                  value={sistemaConfig.email}
                  onChange={(e) => setSistemaConfig({...sistemaConfig, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={sistemaConfig.telefone}
                  onChange={(e) => setSistemaConfig({...sistemaConfig, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={sistemaConfig.timezone}
                  onChange={(e) => setSistemaConfig({...sistemaConfig, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="America/Sao_Paulo">America/São_Paulo</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <textarea
                  value={sistemaConfig.endereco}
                  onChange={(e) => setSistemaConfig({...sistemaConfig, endereco: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Rua das Empresas, 123 - São Paulo, SP"
                />
              </div>
            </div>
            
            <Button
              onClick={() => salvarConfiguracoes('sistema')}
              disabled={saving}
              className="inline-flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )

      case 'comissoes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de Comissões</h3>
              <p className="text-sm text-gray-600 mb-6">Configure os parâmetros de comissões do sistema</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentual Padrão (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={comissaoConfig.percentualPadrao}
                    onChange={(e) => setComissaoConfig({...comissaoConfig, percentualPadrao: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias para Pagamento
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={comissaoConfig.diasPagamento}
                    onChange={(e) => setComissaoConfig({...comissaoConfig, diasPagamento: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <FiClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentual Mínimo (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={comissaoConfig.percentualMinimo}
                  onChange={(e) => setComissaoConfig({...comissaoConfig, percentualMinimo: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentual Máximo (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  value={comissaoConfig.percentualMaximo}
                  onChange={(e) => setComissaoConfig({...comissaoConfig, percentualMaximo: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo para Saque (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={comissaoConfig.valorMinimoSaque}
                  onChange={(e) => setComissaoConfig({...comissaoConfig, valorMinimoSaque: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div className="lg:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Processamento</label>
                  <p className="text-xs text-gray-500">Processar comissões automaticamente</p>
                </div>
                <button
                  onClick={() => setComissaoConfig({...comissaoConfig, autoProcessamento: !comissaoConfig.autoProcessamento})}
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  {comissaoConfig.autoProcessamento ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <Button
              onClick={() => salvarConfiguracoes('comissoes')}
              disabled={saving}
              className="inline-flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de E-mail</h3>
              <p className="text-sm text-gray-600 mb-6">Configure o servidor SMTP para envio de e-mails</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={emailConfig.servidor}
                  onChange={(e) => setEmailConfig({...emailConfig, servidor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porta
                </label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={emailConfig.porta}
                  onChange={(e) => setEmailConfig({...emailConfig, porta: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="587"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailConfig.usuario}
                    onChange={(e) => setEmailConfig({...emailConfig, usuario: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="usuario@dominio.com"
                  />
                  <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={emailConfig.senha}
                    onChange={(e) => setEmailConfig({...emailConfig, senha: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Digite a senha do e-mail"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criptografia
                </label>
                <select
                  value={emailConfig.criptografia}
                  onChange={(e) => setEmailConfig({...emailConfig, criptografia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                  <option value="NONE">Nenhuma</option>
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remetente Padrão
                </label>
                <input
                  type="text"
                  value={emailConfig.remetentePadrao}
                  onChange={(e) => setEmailConfig({...emailConfig, remetentePadrao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="ValeLocal <noreply@valelocal.com.br>"
                />
              </div>
              
              <div className="lg:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sistema de E-mail Ativo</label>
                  <p className="text-xs text-gray-500">Permitir envio de e-mails pelo sistema</p>
                </div>
                <button
                  onClick={() => setEmailConfig({...emailConfig, ativo: !emailConfig.ativo})}
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  {emailConfig.ativo ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <Button
              onClick={() => salvarConfiguracoes('email')}
              disabled={saving}
              className="inline-flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )

      case 'seguranca':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de Segurança</h3>
              <p className="text-sm text-gray-600 mb-6">Configure as políticas de segurança do sistema</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Mínimo da Senha
                </label>
                <input
                  type="number"
                  min="4"
                  max="50"
                  value={segurancaConfig.senhaMinima}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, senhaMinima: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Tentativas de Login
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={segurancaConfig.tentativasMaximasLogin}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, tentativasMaximasLogin: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Bloqueio (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={segurancaConfig.tempoBloqueioConta}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, tempoBloqueioConta: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessão Expira em (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={segurancaConfig.sessaoExpiraEm}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, sessaoExpiraEm: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Políticas de Senha</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Exigir Caracteres Especiais</label>
                    <p className="text-xs text-gray-500">Obrigar uso de caracteres especiais como !@#$%</p>
                  </div>
                  <button
                    onClick={() => setSegurancaConfig({...segurancaConfig, exigirCaracteresEspeciais: !segurancaConfig.exigirCaracteresEspeciais})}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {segurancaConfig.exigirCaracteresEspeciais ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Exigir Números</label>
                    <p className="text-xs text-gray-500">Obrigar pelo menos um número na senha</p>
                  </div>
                  <button
                    onClick={() => setSegurancaConfig({...segurancaConfig, exigirNumeros: !segurancaConfig.exigirNumeros})}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {segurancaConfig.exigirNumeros ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Exigir Maiúscula e Minúscula</label>
                    <p className="text-xs text-gray-500">Obrigar letras maiúsculas e minúsculas</p>
                  </div>
                  <button
                    onClick={() => setSegurancaConfig({...segurancaConfig, exigirMaiusculaMinuscula: !segurancaConfig.exigirMaiusculaMinuscula})}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {segurancaConfig.exigirMaiusculaMinuscula ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Autenticação de Dois Fatores</label>
                    <p className="text-xs text-gray-500">Ativar 2FA para todos os usuários</p>
                  </div>
                  <button
                    onClick={() => setSegurancaConfig({...segurancaConfig, autenticacaoDoisFatores: !segurancaConfig.autenticacaoDoisFatores})}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {segurancaConfig.autenticacaoDoisFatores ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => salvarConfiguracoes('seguranca')}
              disabled={saving}
              className="inline-flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )

      case 'notificacoes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de Notificações</h3>
              <p className="text-sm text-gray-600 mb-6">Configure quando e como o sistema enviará notificações</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notificações por E-mail</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nova Transação</label>
                      <p className="text-xs text-gray-500">Enviar e-mail quando uma transação for realizada</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, emailNovaTransacao: !notificacaoConfig.emailNovaTransacao})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.emailNovaTransacao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Comissão Paga</label>
                      <p className="text-xs text-gray-500">Enviar e-mail quando uma comissão for paga</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, emailComissaoPaga: !notificacaoConfig.emailComissaoPaga})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.emailComissaoPaga ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Novo Cartão</label>
                      <p className="text-xs text-gray-500">Enviar e-mail quando um cartão for criado</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, emailNovoCartao: !notificacaoConfig.emailNovoCartao})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.emailNovoCartao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Relatório Semanal</label>
                      <p className="text-xs text-gray-500">Enviar relatório semanal por e-mail</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, emailRelatorioSemanal: !notificacaoConfig.emailRelatorioSemanal})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.emailRelatorioSemanal ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Outras Notificações</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">SMS para Transações</label>
                      <p className="text-xs text-gray-500">Enviar SMS quando uma transação for realizada</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, smsTransacao: !notificacaoConfig.smsTransacao})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.smsTransacao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                      <p className="text-xs text-gray-500">Enviar notificações via WhatsApp</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, whatsappNotificacoes: !notificacaoConfig.whatsappNotificacoes})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.whatsappNotificacoes ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                      <p className="text-xs text-gray-500">Ativar notificações push no navegador</p>
                    </div>
                    <button
                      onClick={() => setNotificacaoConfig({...notificacaoConfig, pushNotifications: !notificacaoConfig.pushNotifications})}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      {notificacaoConfig.pushNotifications ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => salvarConfiguracoes('notificacoes')}
              disabled={saving}
              className="inline-flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <FiSettings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-600">Esta seção está sendo desenvolvida.</p>
          </div>
        )
    }
  }

  if (loading) {
    return <Loading fullScreen text="Carregando configurações..." />
  }

  return (
    <ProtectedRoute allowedRoles={['FRANQUEADORA']}>
      <DashboardLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
              <p className="text-gray-600">Gerencie as configurações globais do ValeLocal</p>
            </div>
          </div>

          {/* Mensagens */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-green-700 font-medium">Configurações salvas com sucesso!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar de Navegação */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
