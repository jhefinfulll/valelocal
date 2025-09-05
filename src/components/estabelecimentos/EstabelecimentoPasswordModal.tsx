'use client'

import { useState, useEffect } from 'react'
import { FiLock, FiEye, FiEyeOff, FiShield, FiRefreshCw, FiUser, FiCheckCircle } from 'react-icons/fi'
import { estabelecimentoPasswordService, CreatePasswordData, UpdatePasswordData, EstabelecimentoUserData } from '@/services/estabelecimentoPasswordService'

interface EstabelecimentoPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  estabelecimentoId: string
  estabelecimentoNome: string
}

export function EstabelecimentoPasswordModal({
  isOpen,
  onClose,
  estabelecimentoId,
  estabelecimentoNome
}: EstabelecimentoPasswordModalProps) {
  const [userInfo, setUserInfo] = useState<EstabelecimentoUserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [temporaryPassword, setTemporaryPassword] = useState<string>('')
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false)
  
  // Estados para criar usuário
  const [createData, setCreateData] = useState<CreatePasswordData>({
    password: '',
    confirmPassword: ''
  })

  // Estados para atualizar senha
  const [updateData, setUpdateData] = useState<UpdatePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    if (isOpen && estabelecimentoId) {
      loadUserInfo()
    }
  }, [isOpen, estabelecimentoId])

  const loadUserInfo = async () => {
    try {
      setLoading(true)
      const info = await estabelecimentoPasswordService.getUserInfo(estabelecimentoId)
      setUserInfo(info)
    } catch (error) {
      console.error('Erro ao carregar informações do usuário:', error)
      setError('Erro ao carregar informações do usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)
      
      const result = await estabelecimentoPasswordService.createUser(estabelecimentoId, createData)
      
      setSuccess('Usuário criado com sucesso!')
      setUserInfo(result.user)
      setTemporaryPassword(result.tempPassword)
      setShowTemporaryPassword(true)
      setCreateData({ password: '', confirmPassword: '' })
      
      setTimeout(() => {
        setSuccess('')
      }, 3000)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)
      
      await estabelecimentoPasswordService.updatePassword(estabelecimentoId, updateData)
      
      setSuccess('Senha atualizada com sucesso!')
      setUpdateData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      setTimeout(() => {
        setSuccess('')
      }, 3000)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm('Tem certeza que deseja resetar a senha? Uma nova senha temporária será gerada.')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      setLoading(true)
      
      const result = await estabelecimentoPasswordService.resetPassword(estabelecimentoId)
      
      setTemporaryPassword(result.temporaryPassword)
      setShowTemporaryPassword(true)
      setSuccess('Senha resetada! Uma nova senha temporária foi gerada.')
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao resetar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess('')
    setTemporaryPassword('')
    setShowTemporaryPassword(false)
    setCreateData({ password: '', confirmPassword: '' })
    setUpdateData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswords({ current: false, new: false, confirm: false })
    setUserInfo(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Gerenciar Usuário
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Estabelecimento:</strong> {estabelecimentoNome}
          </p>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Carregando...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {showTemporaryPassword && temporaryPassword && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiShield className="text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Senha Temporária Gerada</h3>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono">
                {temporaryPassword}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(temporaryPassword)}
                className="text-yellow-600 hover:text-yellow-800 text-xs"
                title="Copiar senha"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Esta senha temporária deve ser alterada no primeiro acesso.
            </p>
          </div>
        )}

        {!loading && userInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiCheckCircle className="text-blue-600" />
              <h3 className="font-medium text-blue-800">Usuário Existente</h3>
            </div>
            <div className="text-sm text-blue-700">
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Status:</strong> {userInfo.status}</p>
              {userInfo.lastLogin && (
                <p><strong>Último Login:</strong> {new Date(userInfo.lastLogin).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {!userInfo?.hasPassword ? (
              // Criar novo usuário/senha
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Criar Usuário de Acesso</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={createData.password}
                      onChange={(e) => setCreateData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Digite a senha para o usuário"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={createData.confirmPassword}
                      onChange={(e) => setCreateData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirme a senha"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateUser}
                    disabled={loading || !createData.password || !createData.confirmPassword}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Criar Usuário
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Atualizar senha existente
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Atualizar Senha</h3>
                  <button
                    onClick={handleResetPassword}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                    title="Resetar senha (gera senha temporária)"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={updateData.currentPassword}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Digite a senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={updateData.newPassword}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Digite a nova senha"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={updateData.confirmPassword}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirme a nova senha"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={loading || !updateData.newPassword || !updateData.confirmPassword}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Atualizar Senha
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
