import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileImage,
  Settings,
  Activity,
  Clock,
  HardDrive,
  Eye,
  Plus,
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Zap,
  Calendar,
  Search
} from 'lucide-react';

// Интерфейсы для данных
interface DashboardStats {
  total_models: number;
  total_news: number;
  total_employees: number;
  total_regulations: number;
  active_models: number;
  published_news: number;
  recent_uploads: number;
  total_file_size: number;
}

interface RecentActivity {
  action: string;
  resource_type: string;
  resource_name: string;
  user_name: string;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  recent_activities: RecentActivity[];
  top_models: Array<{
    id: number;
    name: string;
    category: string;
    photo_count: number;
    created_at: string;
  }>;
  file_usage: Record<string, { count: number; size: number }>;
}

// Компонент статистической карточки
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  description?: string;
}> = ({ title, value, icon, trend, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {trend && (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  </div>
);

// Компонент активности
const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'update': return <Settings className="w-4 h-4 text-blue-600" />;
      case 'delete': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'login': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'upload': return <Upload className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return 'создал';
      case 'update': return 'обновил';
      case 'delete': return 'удалил';
      case 'login': return 'вошел в систему';
      case 'upload': return 'загрузил';
      default: return action;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        {getActionIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.user_name}</span>{' '}
          {getActionText(activity.action)}{' '}
          <span className="font-medium">{activity.resource_type}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {activity.resource_name}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(activity.created_at).toLocaleString('ru-RU')}
        </p>
      </div>
    </div>
  );
};

// Компонент использования файлов
const FileUsageChart: React.FC<{ fileUsage: Record<string, { count: number; size: number }> }> = ({ fileUsage }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(fileUsage).map(([type, data]) => (
        <div key={type} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getTypeIcon(type)}</span>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                {type}
              </span>
              <p className="text-sm text-gray-600 mt-1">{data.count} файлов</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{formatFileSize(data.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Основной компонент Dashboard
const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Здесь будет вызов API для получения данных dashboard
      // const response = await fetch('/api/admin/dashboard');
      // const data = await response.json();
      
      // Пока используем mock данные
      const mockData: DashboardData = {
        stats: {
          total_models: 45,
          total_news: 23,
          total_employees: 12,
          total_regulations: 8,
          active_models: 38,
          published_news: 18,
          recent_uploads: 156,
          total_file_size: 2847264821
        },
        recent_activities: [
          {
            action: 'create',
            resource_type: 'модель',
            resource_name: 'VMC Sport 650',
            user_name: 'Администратор',
            created_at: new Date().toISOString()
          },
          {
            action: 'upload',
            resource_type: 'файл',
            resource_name: 'bike_photo_1.jpg',
            user_name: 'Модератор',
            created_at: new Date(Date.now() - 300000).toISOString()
          }
        ],
        top_models: [
          { id: 1, name: 'VMC Sport 650', category: 'Спорт', photo_count: 8, created_at: '2024-01-15' },
          { id: 2, name: 'VMC Cruiser 800', category: 'Круизер', photo_count: 12, created_at: '2024-01-10' }
        ],
        file_usage: {
          image: { count: 125, size: 1847264821 },
          document: { count: 23, size: 567894123 },
          video: { count: 8, size: 432105658 }
        }
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Ошибка загрузки данных dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-200 rounded-xl h-96"></div>
            <div className="bg-gray-200 rounded-xl h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Обзор системы VMC Moto</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Экспорт</span>
            </button>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700"
            >
              <Zap className="w-4 h-4" />
              <span>Обновить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Всего моделей"
          value={dashboardData.stats.total_models}
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          description={`${dashboardData.stats.active_models} активных`}
        />
        <StatCard
          title="Новости"
          value={dashboardData.stats.total_news}
          icon={<FileImage className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          description={`${dashboardData.stats.published_news} опубликованных`}
        />
        <StatCard
          title="Сотрудники"
          value={dashboardData.stats.total_employees}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          description="В команде"
        />
        <StatCard
          title="Файлы"
          value={dashboardData.stats.recent_uploads}
          icon={<HardDrive className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
          description={formatFileSize(dashboardData.stats.total_file_size)}
        />
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Последние активности */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Последние активности</h2>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Все активности
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recent_activities.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recent_activities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Нет недавних активностей</p>
              </div>
            )}
          </div>
        </div>

        {/* Боковая панель с дополнительной информацией */}
        <div className="space-y-6">
          {/* Топ моделей */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Популярные модели</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.top_models.map((model) => (
                  <div key={model.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {model.photo_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Использование файлов */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Файлы по типам</h3>
            </div>
            <div className="p-6">
              <FileUsageChart fileUsage={dashboardData.file_usage} />
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Быстрые действия</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Добавить модель</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Загрузить файлы</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Настройки</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 