import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Zap, Shield, Search, X, Bike, MapPin } from 'lucide-react';

interface MotorcycleModel {
  id: string;
  name: string;
  type: string;
  year: number;
  description: string;
  features: string[];
  price: string;
  icon: React.ElementType;
  color: string;
}

const motorcycleModels: MotorcycleModel[] = [
  {
    id: 'vmc-sport-450',
    name: 'VMC Sport 450',
    type: 'Мотоцикл',
    year: 2024,
    description: 'VMC Sport 450 — это воплощение спортивного духа и передовых технологий. Разработанный для тех, кто ценит скорость и маневренность, этот мотоцикл обеспечивает незабываемые впечатления от каждой поездки.',
    features: ['Мощный двигатель 450cc', 'Спортивная посадка', 'Карбоновые детали', 'LED-освещение', 'Цифровая приборная панель'],
    price: 'По запросу',
    icon: Zap,
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'vmc-cruiser-650',
    name: 'VMC Cruiser 650',
    type: 'Мотоцикл',
    year: 2024,
    description: 'VMC Cruiser 650 создан для комфортных дальних поездок. Сочетает в себе классический дизайн и современные технологии для максимального удовольствия от путешествий.',
    features: ['Двигатель 650cc', 'Комфортная посадка', 'Увеличенный топливный бак', 'Круиз-контроль', 'Система навигации'],
    price: 'По запросу',
    icon: Shield,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'vmc-adventure-800',
    name: 'VMC Adventure 800',
    type: 'Эндуро',
    year: 2024,
    description: 'VMC Adventure 800 — универсальный мотоцикл для любых дорог. От городских улиц до бездорожья, этот байк готов к любым приключениям.',
    features: ['Двигатель 800cc', 'Защита от падений', 'Регулируемая подвеска', 'Система ABS', 'Багажная система'],
    price: 'По запросу',
    icon: Star,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'vmc-scooter-150',
    name: 'VMC Scooter 150',
    type: 'Скутер',
    year: 2024,
    description: 'VMC Scooter 150 — идеальный городской транспорт. Экономичный, маневренный и стильный скутер для ежедневных поездок по городу.',
    features: ['Двигатель 150cc', 'Автоматическая трансмиссия', 'Большой багажник', 'LED-фары', 'Экономичный расход'],
    price: 'По запросу',
    icon: Bike,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'vmc-moped-50',
    name: 'VMC Moped 50',
    type: 'Мопед',
    year: 2024,
    description: 'VMC Moped 50 — легкий и удобный мопед для городских поездок. Не требует прав категории А, экономичный и надежный.',
    features: ['Двигатель 50cc', 'Легкий вес', 'Простое управление', 'Низкий расход топлива', 'Доступная цена'],
    price: 'По запросу',
    icon: MapPin,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'vmc-pitbike-125',
    name: 'VMC PitBike 125',
    type: 'Питбайк',
    year: 2024,
    description: 'VMC PitBike 125 — компактный и мощный питбайк для экстремального вождения. Отлично подходит для трюков и бездорожья.',
    features: ['Двигатель 125cc', 'Усиленная рама', 'Кроссовая резина', 'Короткая база', 'Спортивная подвеска'],
    price: 'По запросу',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'vmc-enduro-250',
    name: 'VMC Enduro 250',
    type: 'Эндуро',
    year: 2024,
    description: 'VMC Enduro 250 — настоящий внедорожник. Создан для покорения самых сложных маршрутов и бездорожья.',
    features: ['Двигатель 250cc', 'Длинноходная подвеска', 'Защита двигателя', 'Кроссовые покрышки', 'Высокий клиренс'],
    price: 'По запросу',
    icon: Star,
    color: 'from-teal-500 to-teal-600'
  }
];

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get('category') || 'all';

  // Фильтрация по категории и поиску
  const filteredModels = useMemo(() => {
    let filtered = motorcycleModels;
    
    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        'motorcycle': 'Мотоцикл',
        'enduro': 'Эндуро',
        'scooter': 'Скутер',
        'moped': 'Мопед',
        'pitbike': 'Питбайк'
      };
      
      const categoryName = categoryMap[selectedCategory];
      if (categoryName) {
        filtered = filtered.filter(model => model.type === categoryName);
      }
    }
    
    // Фильтрация по поиску
    if (searchQuery) {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase())) ||
        model.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  // Получить название выбранной категории для отображения
  const getCategoryDisplayName = (categoryId: string) => {
    const categoryNames: Record<string, string> = {
      'all': 'Все категории',
      'motorcycle': 'Мотоциклы',
      'enduro': 'Эндуро',
      'scooter': 'Скутеры',
      'moped': 'Мопеды',
      'pitbike': 'Питбайки'
    };
    return categoryNames[categoryId] || 'Все категории';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'Модели мотоциклов VMC' : getCategoryDisplayName(selectedCategory)}
          </h1>
          <p className="mt-2 text-gray-600">
            {selectedCategory === 'all' 
              ? 'Найдите идеальный мотоцикл для ваших потребностей'
              : `Модели в категории "${getCategoryDisplayName(selectedCategory)}"`
            }
          </p>
        </div>
      </div>

      {/* Поиск */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по названию, описанию или характеристикам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Результаты поиска */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {searchQuery ? 
                `Найдено: ${filteredModels.length} из ${motorcycleModels.length} моделей` :
                selectedCategory === 'all' 
                  ? `Всего моделей: ${motorcycleModels.length}`
                  : `Моделей в категории: ${filteredModels.length}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Список моделей */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredModels.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 hover:border-gray-300"
              >
                {/* Изображение-заглушка с градиентом */}
                <div className={`h-48 bg-gradient-to-r ${model.color} relative flex items-center justify-center`}>
                  <model.icon className="w-16 h-16 text-white opacity-80" />
                  
                  {/* Лейбл категории */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {model.type}
                    </span>
                  </div>
                </div>

                {/* Контент карточки */}
                <div className="p-6">
                  {/* Название */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {model.name}
                  </h3>

                  {/* Кнопка */}
                  <Link
                    to={`/models/${model.id}`}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Модели не найдены</h3>
            <p className="text-gray-600">
              {searchQuery ? 
                'Попробуйте изменить критерии поиска' : 
                'В выбранной категории пока нет моделей'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Очистить поиск
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 