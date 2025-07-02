import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  ArrowUpDown,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  FileCheck,
  Receipt,
  CreditCard,
  Calculator,
  Users,
  Briefcase,
  Wallet,
  Tag,
  TrendingUp,
  Settings,
  Mail,
  User,
  MoreHorizontal,
  Home,
  Bike,
  Menu,
  X,
} from 'lucide-react';

export type SidebarTheme = 'dark' | 'light' | 'minimal';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  badge?: number;
  children?: MenuItem[];
}

interface ModernSidebarProps {
  theme?: SidebarTheme;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    url: '/',
    badge: 41,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: PieChart,
    url: '/analytics',
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: ArrowUpDown,
    url: '/transactions',
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: FileText,
    children: [
      { id: 'company', title: 'Company', icon: Building2, url: '/documents/company' },
      { id: 'contracts', title: 'Contracts', icon: FileCheck, url: '/documents/contracts' },
      { id: 'taxation', title: 'Taxation', icon: Receipt, url: '/documents/taxation' },
      { id: 'invoices', title: 'Invoices', icon: CreditCard, url: '/documents/invoices' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: TrendingUp,
    url: '/reports',
    badge: 72,
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    url: '/customers',
  },
  {
    id: 'payroll',
    title: 'Payroll',
    icon: Briefcase,
    url: '/payroll',
  },
  {
    id: 'accounting',
    title: 'Accounting',
    icon: Calculator,
    url: '/accounting',
  },
  {
    id: 'personal',
    title: 'Personal',
    icon: User,
    children: [
      { id: 'cards', title: 'Cards', icon: CreditCard, url: '/personal/cards' },
      { id: 'trips', title: 'Trips', icon: Tag, url: '/personal/trips' },
      { id: 'wallet', title: 'Wallet', icon: Wallet, url: '/personal/wallet' },
      { id: 'budgets', title: 'Budgets', icon: TrendingUp, url: '/personal/budgets' },
      { id: 'expenses', title: 'Expenses', icon: Receipt, url: '/personal/expenses' },
    ],
  },
  {
    id: 'inbox',
    title: 'Inbox',
    icon: Mail,
    url: '/inbox',
    badge: 99,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    url: '/settings',
  },
];

const user = {
  name: 'Jimmy Jameson',
  avatar: 'JJ',
  role: 'Administrator',
};

export function ModernSidebar({ theme = 'dark', isCollapsed = false, onToggle }: ModernSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['documents', 'personal']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.url === location.pathname) return true;
    if (item.children) {
      return item.children.some(child => child.url === location.pathname);
    }
    return false;
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          sidebar: 'bg-white border-r border-gray-200',
          text: 'text-gray-700',
          textSecondary: 'text-gray-500',
          textActive: 'text-blue-600',
          bgActive: 'bg-blue-50',
          bgHover: 'hover:bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-600',
          badgeActive: 'bg-blue-100 text-blue-600',
        };
      case 'minimal':
        return {
          sidebar: 'bg-gray-50 border-r border-gray-100',
          text: 'text-gray-600',
          textSecondary: 'text-gray-400',
          textActive: 'text-gray-900',
          bgActive: 'bg-white shadow-sm',
          bgHover: 'hover:bg-white/50',
          border: 'border-gray-100',
          badge: 'bg-gray-200 text-gray-600',
          badgeActive: 'bg-gray-900 text-white',
        };
      default: // dark
        return {
          sidebar: 'bg-gray-900 border-r border-gray-800',
          text: 'text-gray-300',
          textSecondary: 'text-gray-400',
          textActive: 'text-white',
          bgActive: 'bg-gray-800',
          bgHover: 'hover:bg-gray-800/50',
          border: 'border-gray-700',
          badge: 'bg-gray-700 text-gray-300',
          badgeActive: 'bg-white text-gray-900',
        };
    }
  };

  const themeClasses = getThemeClasses();

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200
            ${isActive ? `${themeClasses.bgActive} ${themeClasses.textActive}` : `${themeClasses.text} ${themeClasses.bgHover}`}
            ${depth > 0 ? 'ml-4' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.url) {
              setIsMobileOpen(false);
            }
          }}
        >
          <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!isCollapsed && (
            <>
              <span className="flex-1 font-medium">{item.title}</span>
              {item.badge && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-medium
                  ${isActive ? themeClasses.badgeActive : themeClasses.badge}
                `}>
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              )}
            </>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col ${themeClasses.sidebar}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${themeClasses.border} border-b`}>
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              DS
            </div>
            <div>
              <h1 className={`font-semibold ${themeClasses.text}`}>Dashboard</h1>
              <p className={`text-xs ${themeClasses.textSecondary}`}>Admin Panel</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
            DS
          </div>
        )}
        {!isCollapsed && onToggle && (
          <button
            onClick={onToggle}
            className={`p-1 rounded-lg ${themeClasses.bgHover} ${themeClasses.text}`}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* User Profile */}
      <div className={`p-4 ${themeClasses.border} border-t`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user.avatar}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <p className={`font-medium text-sm ${themeClasses.text}`}>{user.name}</p>
                <p className={`text-xs ${themeClasses.textSecondary}`}>{user.role}</p>
              </div>
              <button className={`p-1 rounded-lg ${themeClasses.bgHover} ${themeClasses.text}`}>
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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64">
            <div className="relative h-full">
              {sidebarContent}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
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