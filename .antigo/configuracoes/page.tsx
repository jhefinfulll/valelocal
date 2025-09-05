'use client';

import { useState } from 'react';
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
  FiCheckCircle
} from 'react-icons/fi';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sistema');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados das configurações
  const [sistemConfig, setSistemaConfig] = useState({
    nomeEmpresa: 'ValeLocal Sistema',
    email: 'contato@valelocal.com.br',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Empresas, 123 - São Paulo, SP',
    logo: '',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR'
  });

  const [comissaoConfig, setComissaoConfig] = useState({
    percentualPadrao: 5.0,
    percentualMinimo: 1.0,
    percentualMaximo: 15.0,
    diasPagamento: 30,
    valorMinimoSaque: 100.0,
    autoProcessamento: true
  });

  const [emailConfig, setEmailConfig] = useState({
    servidor: 'smtp.gmail.com',
    porta: 587,
    usuario: 'sistema@valelocal.com.br',
    senha: '',
    criptografia: 'TLS',
    remetentePadrao: 'ValeLocal <noreply@valelocal.com.br>',
    ativo: true
  });

  const [segurancaConfig, setSegurancaConfig] = useState({
    senhaMinima: 8,
    exigirCaracteresEspeciais: true,
    exigirNumeros: true,
    exigirMaiusculaMinuscula: true,
    tentativasMaximasLogin: 5,
    tempoBloqueioConta: 30,
    sessaoExpiraEm: 8,
    autenticacaoDoisFatores: false
  });

  const [notificacaoConfig, setNotificacaoConfig] = useState({
    emailNovaTransacao: true,
    emailComissaoPaga: true,
    emailNovoCartao: true,
    emailRelatorioSemanal: true,
    smsTransacao: false,
    whatsappNotificacoes: true,
    pushNotifications: true
  });

  const handleSave = (configType: string) => {
    // Simula salvamento
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    console.log(`Salvando configurações de ${configType}`);
  };

  const tabs = [
    { id: 'sistema', label: 'Sistema', icon: FiSettings },
    { id: 'comissoes', label: 'Comissões', icon: FiDollarSign },
    { id: 'email', label: 'E-mail', icon: FiMail },
    { id: 'seguranca', label: 'Segurança', icon: FiShield },
    { id: 'notificacoes', label: 'Notificações', icon: FiGlobe }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sistema':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configurações do Sistema</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={sistemConfig.nomeEmpresa}
                  onChange={(e) => setSistemaConfig({...sistemConfig, nomeEmpresa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail Principal
                </label>
                <input
                  type="email"
                  value={sistemConfig.email}
                  onChange={(e) => setSistemaConfig({...sistemConfig, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={sistemConfig.telefone}
                  onChange={(e) => setSistemaConfig({...sistemConfig, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={sistemConfig.timezone}
                  onChange={(e) => setSistemaConfig({...sistemConfig, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  value={sistemConfig.endereco}
                  onChange={(e) => setSistemaConfig({...sistemConfig, endereco: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => handleSave('sistema')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        );

      case 'comissoes':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configurações de Comissões</h3>
            
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo para Saque (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={comissaoConfig.valorMinimoSaque}
                  onChange={(e) => setComissaoConfig({...comissaoConfig, valorMinimoSaque: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Processamento</label>
                  <p className="text-xs text-gray-500">Processar comissões automaticamente</p>
                </div>
                <button
                  onClick={() => setComissaoConfig({...comissaoConfig, autoProcessamento: !comissaoConfig.autoProcessamento})}
                  className="text-green-600"
                >
                  {comissaoConfig.autoProcessamento ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('comissoes')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configurações de E-mail</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={emailConfig.servidor}
                  onChange={(e) => setEmailConfig({...emailConfig, servidor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porta
                </label>
                <input
                  type="number"
                  value={emailConfig.porta}
                  onChange={(e) => setEmailConfig({...emailConfig, porta: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <input
                  type="email"
                  value={emailConfig.usuario}
                  onChange={(e) => setEmailConfig({...emailConfig, usuario: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="lg:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail Ativo</label>
                  <p className="text-xs text-gray-500">Ativar envio de e-mails do sistema</p>
                </div>
                <button
                  onClick={() => setEmailConfig({...emailConfig, ativo: !emailConfig.ativo})}
                  className="text-green-600"
                >
                  {emailConfig.ativo ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('email')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        );

      case 'seguranca':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configurações de Segurança</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Mínimo da Senha
                </label>
                <input
                  type="number"
                  min="6"
                  max="50"
                  value={segurancaConfig.senhaMinima}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, senhaMinima: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tentativas Máximas de Login
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={segurancaConfig.tentativasMaximasLogin}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, tentativasMaximasLogin: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessão Expira em (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={segurancaConfig.sessaoExpiraEm}
                  onChange={(e) => setSegurancaConfig({...segurancaConfig, sessaoExpiraEm: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Exigir Caracteres Especiais</label>
                  <p className="text-xs text-gray-500">Senha deve conter caracteres especiais</p>
                </div>
                <button
                  onClick={() => setSegurancaConfig({...segurancaConfig, exigirCaracteresEspeciais: !segurancaConfig.exigirCaracteresEspeciais})}
                  className="text-green-600"
                >
                  {segurancaConfig.exigirCaracteresEspeciais ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Exigir Números</label>
                  <p className="text-xs text-gray-500">Senha deve conter números</p>
                </div>
                <button
                  onClick={() => setSegurancaConfig({...segurancaConfig, exigirNumeros: !segurancaConfig.exigirNumeros})}
                  className="text-green-600"
                >
                  {segurancaConfig.exigirNumeros ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maiúsculas e Minúsculas</label>
                  <p className="text-xs text-gray-500">Senha deve conter letras maiúsculas e minúsculas</p>
                </div>
                <button
                  onClick={() => setSegurancaConfig({...segurancaConfig, exigirMaiusculaMinuscula: !segurancaConfig.exigirMaiusculaMinuscula})}
                  className="text-green-600"
                >
                  {segurancaConfig.exigirMaiusculaMinuscula ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Autenticação de Dois Fatores</label>
                  <p className="text-xs text-gray-500">Ativar 2FA para maior segurança</p>
                </div>
                <button
                  onClick={() => setSegurancaConfig({...segurancaConfig, autenticacaoDoisFatores: !segurancaConfig.autenticacaoDoisFatores})}
                  className="text-green-600"
                >
                  {segurancaConfig.autenticacaoDoisFatores ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('seguranca')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        );

      case 'notificacoes':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configurações de Notificações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail - Nova Transação</label>
                  <p className="text-xs text-gray-500">Notificar por e-mail quando há novas transações</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, emailNovaTransacao: !notificacaoConfig.emailNovaTransacao})}
                  className="text-green-600"
                >
                  {notificacaoConfig.emailNovaTransacao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail - Comissão Paga</label>
                  <p className="text-xs text-gray-500">Notificar por e-mail quando comissões são pagas</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, emailComissaoPaga: !notificacaoConfig.emailComissaoPaga})}
                  className="text-green-600"
                >
                  {notificacaoConfig.emailComissaoPaga ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail - Novo Cartão</label>
                  <p className="text-xs text-gray-500">Notificar por e-mail quando novos cartões são criados</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, emailNovoCartao: !notificacaoConfig.emailNovoCartao})}
                  className="text-green-600"
                >
                  {notificacaoConfig.emailNovoCartao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail - Relatório Semanal</label>
                  <p className="text-xs text-gray-500">Enviar relatório semanal por e-mail</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, emailRelatorioSemanal: !notificacaoConfig.emailRelatorioSemanal})}
                  className="text-green-600"
                >
                  {notificacaoConfig.emailRelatorioSemanal ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS - Transações</label>
                  <p className="text-xs text-gray-500">Notificar por SMS sobre transações importantes</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, smsTransacao: !notificacaoConfig.smsTransacao})}
                  className="text-green-600"
                >
                  {notificacaoConfig.smsTransacao ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">WhatsApp - Notificações</label>
                  <p className="text-xs text-gray-500">Enviar notificações via WhatsApp Business</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, whatsappNotificacoes: !notificacaoConfig.whatsappNotificacoes})}
                  className="text-green-600"
                >
                  {notificacaoConfig.whatsappNotificacoes ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-xs text-gray-500">Notificações push no navegador</p>
                </div>
                <button
                  onClick={() => setNotificacaoConfig({...notificacaoConfig, pushNotifications: !notificacaoConfig.pushNotifications})}
                  className="text-green-600"
                >
                  {notificacaoConfig.pushNotifications ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleSave('notificacoes')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['franqueadora']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
              <p className="text-gray-600">Gerencie as configurações globais do ValeLocal</p>
            </div>
          </div>

          {/* Notificação de Sucesso */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-green-700 font-medium">Configurações salvas com sucesso!</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar de Navegação */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
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
                    );
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
      </Layout>
    </ProtectedRoute>
  );
}
