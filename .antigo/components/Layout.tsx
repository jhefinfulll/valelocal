'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiCreditCard, 
  FiBarChart, 
  FiSettings, 
  FiFileText, 
  FiLogOut,
  FiMenu,
  FiX,
  FiDollarSign,
  FiTrendingUp,
  FiMapPin,
  FiShield
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  permissions: string[];
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Iniciar fechado no mobile
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Lógica melhorada para controle do sidebar
      if (mobile) {
        setSidebarOpen(false); // Sempre fechado no mobile por padrão
      } else {
        // No desktop, manter o estado atual ou abrir se for a primeira vez
        if (!localStorage.getItem('sidebarState')) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(localStorage.getItem('sidebarState') === 'true');
        }
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Salvar estado do sidebar no localStorage (apenas para desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarState', sidebarOpen.toString());
    }
  }, [sidebarOpen, isMobile]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      path: '/dashboard',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento', 'usuario']
    },
    {
      id: 'franqueados',
      label: 'Franqueados',
      icon: FiUsers,
      path: '/franqueados',
      permissions: ['franqueadora']
    },
    {
      id: 'estabelecimentos',
      label: 'Estabelecimentos',
      icon: FiShoppingBag,
      path: '/estabelecimentos',
      permissions: ['franqueadora', 'franqueado']
    },
    {
      id: 'cartoes',
      label: 'Cartões',
      icon: FiCreditCard,
      path: '/cartoes',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento']
    },
    {
      id: 'transacoes',
      label: 'Transações',
      icon: FiDollarSign,
      path: '/transacoes',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento']
    },
    {
      id: 'comissoes',
      label: 'Comissões',
      icon: FiTrendingUp,
      path: '/comissoes',
      permissions: ['franqueadora', 'franqueado']
    },
    {
      id: 'solicitacoes',
      label: 'Solicitações',
      icon: FiFileText,
      path: '/solicitacoes',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento']
    },
    {
      id: 'displays',
      label: 'Displays',
      icon: FiMapPin,
      path: '/displays',
      permissions: ['franqueadora', 'franqueado']
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FiBarChart,
      path: '/relatorios',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento']
    },
    {
      id: 'logs',
      label: 'Logs & Auditoria',
      icon: FiShield,
      path: '/logs',
      permissions: ['franqueadora']
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: FiSettings,
      path: '/configuracoes',
      permissions: ['franqueadora', 'franqueado', 'estabelecimento']
    }
  ];

  // Atualiza o menu ativo baseado na URL atual
  useEffect(() => {
    const currentPath = pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      setActiveMenu(currentMenuItem.id);
    }
  }, [pathname]);

  if (!user) {
    return null;
  }

  const filteredMenuItems = menuItems.filter(item => 
    item.permissions.includes(user.type.toLowerCase())
  );

  const getUserTypeLabel = (type: string) => {
    const labels = {
      franqueadora: 'Franqueadora',
      franqueado: 'Franqueado',
      estabelecimento: 'Estabelecimento',
      usuario: 'Usuário'
    };
    return labels[type.toLowerCase() as keyof typeof labels] || type;
  };

  const getUserTypeColor = (type: string) => {
    const colors = {
      franqueadora: 'bg-green-500',
      franqueado: 'bg-blue-500',
      estabelecimento: 'bg-purple-500',
      usuario: 'bg-orange-500'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay para mobile com efeito de desfoque */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          bg-white shadow-lg transition-all duration-300 flex flex-col h-screen
          ${isMobile ? 'fixed z-50' : 'fixed z-10'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${sidebarOpen ? (isMobile ? 'w-80' : 'w-64') : 'w-16'}
        `}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: isMobile ? 50 : 10
        }}
      >
        {/* Header da Sidebar */}
        <div className={`border-b border-gray-200 ${sidebarOpen ? 'p-4' : 'p-2'}`}>
          {sidebarOpen ? (
            // Layout expandido
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <FiHome className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">ValeLocal</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Recolher sidebar"
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>
          ) : (
            // Layout colapsado - stack vertical
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <FiHome className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Expandir sidebar"
              >
                <FiMenu className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className={`flex-1 overflow-y-auto sidebar-scroll smooth-scroll ${sidebarOpen ? 'p-4 space-y-2' : 'p-1 space-y-1'}`}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  router.push(item.path);
                  if (isMobile) {
                    setSidebarOpen(false); // Fechar sidebar no mobile após clique
                  }
                }}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-green-50 text-green-600 border-l-4 border-green-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                  ${sidebarOpen ? 'space-x-3 px-3 py-3' : 'justify-center px-1 py-2'}
                  ${isMobile ? 'min-h-[48px]' : ''}
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`
                  ${sidebarOpen ? (isMobile ? 'w-6 h-6' : 'w-5 h-5') : 'w-5 h-5'} 
                  ${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'} 
                  transition-colors flex-shrink-0
                `} />
                {sidebarOpen && (
                  <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className={`border-t border-gray-200 ${sidebarOpen ? 'p-4' : 'p-1'}`}>
          {sidebarOpen ? (
            // Layout expandido
            <div className="mb-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} rounded-full flex items-center justify-center ${getUserTypeColor(user.type)}`}>
                  <span className={`text-white ${isMobile ? 'text-base' : 'text-sm'} font-semibold`}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-800 truncate`}>{user.name}</p>
                  <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>{getUserTypeLabel(user.type)}</p>
                </div>
              </div>
            </div>
          ) : (
            // Layout colapsado - avatar centralizado
            <div className="mb-2 flex justify-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600" title={user.name}>
                <span className="text-white text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className={`
              w-full flex items-center text-red-600 hover:bg-red-50 rounded-lg transition-colors group
              ${sidebarOpen ? 'space-x-3 px-3 py-3' : 'justify-center px-1 py-2'}
              ${isMobile ? 'min-h-[48px]' : ''}
            `}
            title={!sidebarOpen ? 'Sair' : undefined}
          >
            <FiLogOut className={`
              ${sidebarOpen ? (isMobile ? 'w-6 h-6' : 'w-5 h-5') : 'w-5 h-5'} 
              group-hover:text-red-700 transition-colors flex-shrink-0
            `} />
            {sidebarOpen && (
              <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                Sair
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0' : (sidebarOpen ? '16rem' : '4rem') // 256px expandido, 64px colapsado
        }}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Botão do menu mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors mr-4"
              >
                <FiMenu className="w-6 h-6 bg-black" />
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {filteredMenuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Bem-vindo(a), {user.name} • {getUserTypeLabel(user.type)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.type)} text-white`}>
                <span className="hidden sm:inline">{getUserTypeLabel(user.type)}</span>
                <span className="sm:hidden">{getUserTypeLabel(user.type).charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
