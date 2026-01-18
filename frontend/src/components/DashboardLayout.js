import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3,
  Target,
  Award,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
  UserCog,
  Trophy,
  Briefcase
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'agent'] },
    { path: '/admin', icon: Settings, label: 'Administração', roles: ['admin'] },
    { path: '/usuarios', icon: UserCog, label: 'Gerenciar Usuários', roles: ['admin'] },
    { path: '/gamificacao', icon: Trophy, label: 'Gamificação', roles: ['admin', 'agent'] },
    { path: '/carreira-config', icon: TrendingUp, label: 'Config. Carreira', roles: ['admin'] },
    { path: '/bonus', icon: DollarSign, label: 'Bonificação', roles: ['admin', 'agent'] },
    { path: '/carreira', icon: Briefcase, label: 'Plano de Carreira', roles: ['admin', 'agent'] },
    { path: '/extrato', icon: FileText, label: 'Extrato', roles: ['admin', 'agent'] },
    { path: '/dre', icon: BarChart3, label: 'DRE', roles: ['admin', 'agent'] },
    { path: '/forecast', icon: Target, label: 'Forecast', roles: ['admin', 'agent'] },
    { path: '/competencias', icon: Award, label: 'Competências', roles: ['admin', 'agent'] },
    { path: '/perfil', icon: Users, label: 'Meu Perfil', roles: ['admin', 'agent'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-out`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-900">MOT</h1>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="close-sidebar-btn"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-heading font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="open-sidebar-btn"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold font-heading text-slate-900">
                {filteredMenu.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs uppercase tracking-widest text-slate-500">Nível</p>
                <p className="text-sm font-semibold text-slate-900">{user?.career_level}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};