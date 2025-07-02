// AppSidebar component
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Bike,
  FileText,
  Users,
  Settings,
  ChevronRight,
  Menu,
  X,
  User,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  badge?: number;
  children?: MenuItem[];
}

// Главные разделы навигации
const navigationItems: MenuItem[] = [
  {
    id: 'home',
    title: 'Главная',
    url: '/',
    icon: Home,
  },
  {
    id: 'news',
    title: 'Новости',
    url: '/news',
    icon: FileText,
  },
  {
    id: 'regulations',
    title: 'Регламенты',
    url: '/regulations',
    icon: FileText,
  },
  {
    id: 'employees',
    title: 'Сотрудники',
    url: '/employees',
    icon: Users,
  },
  {
    id: 'sidebar-demo',
    title: 'Sidebar Demo',
    url: '/sidebar-demo',
    icon: Sparkles,
    badge: 3,
  },
  {
    id: 'admin',
    title: 'Админ',
    url: '/admin',
    icon: Settings,
  },
];

const user = {
  name: 'Менеджер VMC',
  avatar: 'VM',
  role: 'Продажи мотоциклов',
};

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isCollapsed = false, onToggle }: AppSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isItemActive = (item: MenuItem): boolean => {
    return item.url === location.pathname;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isItemActive(item);

    return (
      <Link
        key={item.id}
        to={item.url || '#'}
        onClick={() => setIsMobileOpen(false)}
        className={`
          group flex items-center px-4 py-3 mx-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
          ${isActive 
            ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 ring-1 ring-red-500/50' 
            : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:text-white hover:shadow-md hover:shadow-gray-900/50'
          }
          ${!isCollapsed ? 'hover:translate-x-1' : ''}
        `}
      >
        <div className={`
          flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300
          ${isActive 
            ? 'bg-white/20 text-white shadow-sm' 
            : 'text-gray-400 group-hover:text-white group-hover:bg-white/10'
          }
        `}>
          <item.icon className="w-4 h-4" />
        </div>
        {!isCollapsed && (
          <>
            <span className={`
              flex-1 ml-3 font-semibold text-sm tracking-wide transition-all duration-300
              ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
            `}>
              {item.title}
            </span>
            {item.badge && (
              <span className={`
                px-2.5 py-1 text-xs rounded-full font-bold tracking-wide transition-all duration-300 shadow-sm
                ${isActive 
                  ? 'bg-white/25 text-white ring-1 ring-white/20' 
                  : 'bg-gray-700/80 text-gray-300 group-hover:bg-white/15 group-hover:text-white'
                }
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-red-500/20 sidebar-glow">
              VMC
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">VMC Moto</h1>
              <p className="text-xs text-gray-400 font-medium">Обучающий портал</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto shadow-lg ring-2 ring-red-500/20 sidebar-glow">
            VMC
          </div>
        )}
        {!isCollapsed && onToggle && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800/60 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-md"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Welcome Message */}
      {!isCollapsed && (
        <div className="p-6 pb-4">
          <div className="bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-700/15 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm shadow-inner">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">👋</span>
              <h2 className="text-sm font-bold text-red-300 tracking-wide">
                Добро пожаловать!
              </h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Изучайте мотоциклы VMC и совершенствуйте продажные навыки
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto dark-sidebar-scroll">
        {!isCollapsed && (
          <div className="px-6 mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-80">
              Навигация
            </h2>
            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent mt-2"></div>
          </div>
        )}
        <div className="space-y-1 px-3">
          {navigationItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-500/20">
            {user.avatar}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <p className="font-bold text-sm text-white tracking-tight">{user.name}</p>
                <p className="text-xs text-gray-400 font-medium">{user.role}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-800/60 text-gray-400 hover:text-white transition-all duration-200 hover:shadow-md">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
        {sidebarContent}
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-6 left-6 z-50 lg:hidden p-3 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700/50 hover:shadow-red-500/20 hover:border-red-500/30 transition-all duration-300 hover:scale-105"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsMobileOpen(false)} 
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 transform transition-transform duration-300 ease-out">
            <div className="relative h-full">
              {sidebarContent}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-xl hover:bg-red-600/20 hover:border-red-500/30 border border-gray-700/50 transition-all duration-300 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 