// AppSidebar component
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  Bike,
  FileText,
  Users,
  Settings,
  ChevronRight,
} from 'lucide-react';

// Мотоциклы VMC
const motorcycles = [
  {
    id: 'vmc-sport-450',
    name: 'VMC Sport 450',
    category: 'Спортивные',
    icon: '🏍️',
  },
  {
    id: 'vmc-cruiser-650',
    name: 'VMC Cruiser 650',
    category: 'Круизеры',
    icon: '🛣️',
  },
  {
    id: 'vmc-adventure-800',
    name: 'VMC Adventure 800',
    category: 'Приключенческие',
    icon: '🏔️',
  },
  {
    id: 'vmc-touring-750',
    name: 'VMC Touring 750',
    category: 'Туристические',
    icon: '🌍',
  },
  {
    id: 'vmc-urban-400',
    name: 'VMC Urban 400',
    category: 'Нейкед',
    icon: '🏙️',
  },
];

// Главные разделы навигации
const navigationItems = [
  {
    title: 'Главная',
    url: '/',
    icon: Home,
  },
  {
    title: 'Новости',
    url: '/news',
    icon: FileText,
  },
  {
    title: 'Регламенты',
    url: '/regulations',
    icon: FileText,
  },
  {
    title: 'Сотрудники',
    url: '/employees',
    icon: Users,
  },
  {
    title: 'Админ',
    url: '/admin',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="w-80">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            VMC
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VMC Moto</h1>
            <p className="text-sm text-gray-500">Обучающий портал</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* Приветствие */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            👋 Добро пожаловать!
          </h2>
          <p className="text-sm text-red-700">
            Выберите модель мотоцикла для изучения характеристик и продажных скриптов
          </p>
        </div>

        {/* Навигация */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold text-gray-800 mb-3">
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full justify-start"
                  >
                    <Link to={item.url} className="flex items-center space-x-3 p-3 rounded-lg">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Модели мотоциклов */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold text-gray-800 mb-3 flex items-center">
            <Bike className="h-5 w-5 mr-2" />
            Модели мотоциклов
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {motorcycles.map((motorcycle) => (
                <SidebarMenuItem key={motorcycle.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === `/models/${motorcycle.id}`}
                    className="w-full justify-start"
                  >
                    <Link 
                      to={`/models/${motorcycle.id}`} 
                      className="flex items-center justify-between p-3 rounded-lg group hover:bg-red-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{motorcycle.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{motorcycle.name}</div>
                          <div className="text-xs text-gray-500">{motorcycle.category}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="text-center text-xs text-gray-500">
          © 2025 VMC Moto. Все права защищены.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 