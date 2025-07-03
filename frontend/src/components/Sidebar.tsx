import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Bike, 
  Star,
  Shield,
  Zap,
  Menu,
  MapPin,
  Grid3X3
} from 'lucide-react';

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
}

const categories: CategoryItem[] = [
  { id: 'all', label: 'Все категории', icon: Grid3X3, count: 7 },
  { id: 'motorcycle', label: 'Мотоциклы', icon: Zap, count: 2 },
  { id: 'enduro', label: 'Эндуро', icon: Star, count: 2 },
  { id: 'scooter', label: 'Скутеры', icon: Bike, count: 1 },
  { id: 'moped', label: 'Мопеды', icon: MapPin, count: 1 },
  { id: 'pitbike', label: 'Питбайки', icon: Shield, count: 1 },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // const location = useLocation(); // Commented out unused variable
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get('category') || 'all';

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
    setIsMobileOpen(false);
  };

  const CategoryItem = ({ item }: { item: CategoryItem }) => {
    const isActive = selectedCategory === item.id;

    return (
      <button
        onClick={() => handleCategoryClick(item.id)}
        className={`
          w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-left
          ${isActive 
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }
        `}
      >
        <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4 mr-3'} flex-shrink-0`} />
        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium">{item.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}>
              {item.count}
            </span>
          </>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black border-r border-gray-700">
      {/* Заголовок */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-4 border-b border-gray-700`}>
        {!isCollapsed ? (
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">VMC Moto</h1>
              <p className="text-gray-400 text-xs">Education Portal</p>
            </div>
          </Link>
        ) : (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center p-1 hover:bg-gray-700/30 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Bike className="w-6 h-6 text-white" />
            </div>
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Навигация по категориям */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-4`}>
        <div className="mb-4">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Категории техники
            </h2>
          )}
          <div className="space-y-1">
            {categories.map((item) => (
              <CategoryItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Статус */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-3 border-t border-gray-700`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {!isCollapsed && <span className="text-xs text-gray-400">Система активна</span>}
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

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 