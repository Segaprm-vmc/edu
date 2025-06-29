import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  FileText, 
  BookOpen, 
  Wrench, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Eye,
  Lock
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Простая проверка пароля для демонстрации
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Административная панель
            </h2>
            <p className="text-gray-600 mt-2">
              Введите пароль для доступа
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Введите пароль..."
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Войти
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Для демонстрации используйте пароль: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      name: 'Модели мотоциклов', 
      value: '67', 
      icon: Wrench, 
      color: 'bg-blue-500',
      change: '+3 за месяц'
    },
    { 
      name: 'Новостей', 
      value: '24', 
      icon: FileText, 
      color: 'bg-green-500',
      change: '+5 за неделю'
    },
    { 
      name: 'Документов', 
      value: '156', 
      icon: BookOpen, 
      color: 'bg-purple-500',
      change: '+12 за месяц'
    },
    { 
      name: 'Сотрудников', 
      value: '42', 
      icon: Users, 
      color: 'bg-orange-500',
      change: '+2 за квартал'
    }
  ];

  const quickActions = [
    {
      name: 'Добавить модель',
      description: 'Создать новую модель мотоцикла',
      icon: Plus,
      color: 'bg-red-500'
    },
    {
      name: 'Загрузить Excel',
      description: 'Импорт характеристик из Excel',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      name: 'Экспорт данных',
      description: 'Скачать данные в Excel',
      icon: Download,
      color: 'bg-green-500'
    },
    {
      name: 'Просмотр сайта',
      description: 'Перейти к публичной части',
      icon: Eye,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Административная панель <span className="text-red-600">VMC</span>
              </h1>
              <p className="text-gray-600">Управление контентом образовательного портала</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{stat.name}</h3>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="ml-2 text-sm text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                className="bg-white p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Models Management */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Управление моделями</h3>
              <button className="text-red-600 hover:text-red-700">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {['VMC Sport 450', 'VMC Cruiser 650', 'VMC Adventure 800'].map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{model}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-red-600 hover:text-red-700 font-medium">
              Просмотреть все модели
            </button>
          </div>

          {/* Content Management */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Управление контентом</h3>
              <button className="text-red-600 hover:text-red-700">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Последние новости</span>
                </div>
                <span className="text-sm text-gray-500">3 черновика</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Регламенты</span>
                </div>
                <span className="text-sm text-gray-500">12 документов</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Сотрудники</span>
                </div>
                <span className="text-sm text-gray-500">42 профиля</span>
              </div>
            </div>
            <button className="w-full mt-4 text-center text-red-600 hover:text-red-700 font-medium">
              Управление контентом
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 