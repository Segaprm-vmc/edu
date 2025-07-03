import { 
  TrendingUp, 
  Users, 
  Bike, 
  FileText, 
  ArrowRight,
  Eye,
  Heart,
  MessageCircle,
  Activity,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Общие продажи',
      value: '2,847',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Активные клиенты',
      value: '1,234',
      change: '+8.3%',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Модели в каталоге',
      value: '5',
      change: 'Новинки',
      icon: Bike,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      title: 'Материалы',
      value: '89',
      change: '+15.2%',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  const recentModels = [
    {
      id: 'vmc-sport-450',
      name: 'VMC Sport 450',
      category: 'Спортивные',
      image: '🏍️',
      views: 1234,
      likes: 89,
      status: 'Популярная'
    },
    {
      id: 'vmc-cruiser-650',
      name: 'VMC Cruiser 650',
      category: 'Круизеры',
      image: '🛣️',
      views: 987,
      likes: 76,
      status: 'Новинка'
    },
    {
      id: 'vmc-adventure-800',
      name: 'VMC Adventure 800',
      category: 'Приключенческие',
      image: '🏔️',
      views: 756,
      likes: 54,
      status: 'Топ продаж'
    }
  ];

  const recentNews = [
    {
      id: 1,
      title: 'Новая модель VMC Adventure 800 в продаже',
      excerpt: 'Представляем новейшую модель для приключенческих поездок...',
      date: '2 часа назад',
      author: 'Команда VMC',
      comments: 12
    },
    {
      id: 2,
      title: 'Обновление технических характеристик',
      excerpt: 'Актуализированы спецификации всех моделей мотоциклов...',
      date: '5 часов назад',
      author: 'Технический отдел',
      comments: 8
    },
    {
      id: 3,
      title: 'Тренинг для менеджеров по продажам',
      excerpt: 'Запланирован новый курс обучения продажам мотоциклов...',
      date: '1 день назад',
      author: 'HR отдел',
      comments: 23
    }
  ];

  const quickActions = [
    {
      title: 'Добавить новость',
      description: 'Создать новую публикацию',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: '/news/create'
    },
    {
      title: 'Аналитика продаж',
      description: 'Просмотреть отчеты',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      action: '/analytics'
    },
    {
      title: 'Управление моделями',
      description: 'Редактировать каталог',
      icon: Bike,
      color: 'from-red-500 to-red-600',
      action: '/models'
    },
    {
      title: 'База сотрудников',
      description: 'Контакты команды',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      action: '/employees'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок страницы */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Добро пожаловать в VMC Education Portal
              </h1>
              <p className="mt-2 text-gray-600">
                Управляйте образовательными материалами и мотоциклами VMC
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Pro Manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-white rounded-2xl p-6 ${stat.bgColor} border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Быстрые действия */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Быстрые действия</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="group p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg group-hover:shadow-lg transition-shadow`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Популярные модели */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Популярные модели</h2>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Все модели
                </button>
              </div>
              <div className="space-y-4">
                {recentModels.map((model) => (
                  <div key={model.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl">{model.image}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600">{model.category}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{model.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{model.likes}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {model.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Последние новости */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Последние новости</h2>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Все новости
            </button>
          </div>
          <div className="space-y-4">
            {recentNews.map((news) => (
              <div key={news.id} className="border-l-4 border-red-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 hover:text-red-600 cursor-pointer">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">{news.excerpt}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{news.author}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{news.comments} комментариев</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 