import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Zap,
  Shield
} from 'lucide-react';
import MotorcycleSpecs from '../components/MotorcycleSpecs';

// Данные мотоциклов
const motorcycles = {
  'vmc-sport-450': {
    id: 'vmc-sport-450',
    name: 'VMC Sport 450',
    category: 'Спортивные',
    year: 2024,
    price: 'По запросу',
    rating: 4.8,
    description: 'Спортивный мотоцикл для динамичной езды',
    fullDescription: 'VMC Sport 450 — это воплощение спортивного духа и передовых технологий. Разработанный для тех, кто ценит скорость и маневренность, этот мотоцикл обеспечивает незабываемые впечатления от каждой поездки.',
    features: [
      'Мощный двигатель 450cc',
      'Спортивная посадка',
      'Карбоновые детали',
      'LED-освещение',
      'Цифровая приборная панель'
    ],
    color: 'from-red-500 to-red-600',
    icon: Zap,
    salesScript: {
      intro: 'VMC Sport 450 - это идеальный выбор для тех, кто хочет почувствовать адреналин скорости!',
      benefits: [
        'Превосходная управляемость благодаря низкому центру тяжести',
        'Экономичный расход топлива - всего 3.5 л/100км',
        'Стильный дизайн, который выделит вас из толпы',
        'Надежная тормозная система с ABS'
      ],
      objections: [
        {
          question: 'Не слишком ли мощный для новичка?',
          answer: 'VMC Sport 450 имеет режимы езды, включая режим для начинающих, который ограничивает мощность.'
        },
        {
          question: 'Какая гарантия?',
          answer: 'Мы предоставляем 3 года гарантии и бесплатное ТО в первый год.'
        }
      ],
      closing: 'Готовы ли вы стать владельцем этого великолепного мотоцикла уже сегодня?'
    }
  },
  'vmc-cruiser-650': {
    id: 'vmc-cruiser-650',
    name: 'VMC Cruiser 650',
    category: 'Круизеры',
    year: 2024,
    price: 'По запросу',
    rating: 4.6,
    description: 'Комфортный круизер для дальних поездок',
    fullDescription: 'VMC Cruiser 650 создан для тех, кто ценит комфорт и стиль в дальних путешествиях. Классический дизайн сочетается с современными технологиями.',
    features: [
      'Двигатель 650cc V-twin',
      'Удобная посадка',
      'Хромированные детали',
      'Багажная система',
      'Круиз-контроль'
    ],
    color: 'from-blue-500 to-blue-600',
    icon: Shield,
    salesScript: {
      intro: 'VMC Cruiser 650 - ваш надежный спутник в любых путешествиях!',
      benefits: [
        'Комфортная посадка для поездок любой дальности',
        'Мощный и надежный двигатель V-twin',
        'Классический дизайн, который никогда не выйдет из моды',
        'Отличная устойчивость на трассе'
      ],
      objections: [
        {
          question: 'Не слишком ли тяжелый?',
          answer: 'Несмотря на солидный вес, мотоцикл отлично сбалансирован и легко управляется.'
        }
      ],
      closing: 'Позвольте себе насладиться свободой дороги с VMC Cruiser 650!'
    }
  },
  'vmc-adventure-800': {
    id: 'vmc-adventure-800',
    name: 'VMC Adventure 800',
    category: 'Приключенческие',
    year: 2024,
    price: 'По запросу',
    rating: 4.9,
    description: 'Приключенческий мотоцикл для любых дорог',
    fullDescription: 'VMC Adventure 800 — универсальный мотоцикл для истинных искателей приключений. Одинаково уверенно чувствует себя как на асфальте, так и на бездорожье.',
    features: [
      'Мощный двигатель 800cc',
      'Регулируемая подвеска',
      'Защита двигателя',
      'LED-фары',
      'Система ABS и трекшн-контроль'
    ],
    color: 'from-green-500 to-green-600',
    icon: Star,
    salesScript: {
      intro: 'VMC Adventure 800 откроет для вас мир безграничных возможностей!',
      benefits: [
        'Универсальность: отлично подходит для города и бездорожья',
        'Надежность в любых условиях',
        'Большой запас хода',
        'Современные системы безопасности'
      ],
      objections: [
        {
          question: 'Сложно ли обслуживать?',
          answer: 'VMC Adventure 800 спроектирован с учетом простоты обслуживания. Большинство работ можно выполнить в любом сервисе.'
        }
      ],
      closing: 'Готовы отправиться в незабываемое приключение?'
    }
  }
};

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSalesScript, setShowSalesScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'features'>('specs');

  const motorcycle = id ? motorcycles[id as keyof typeof motorcycles] : null;

  if (!motorcycle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Модель не найдена</h2>
          <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
            ← Вернуться к списку моделей
          </Link>
        </div>
      </div>
    );
  }

  // Генерируем характеристики на основе модели
  const getSpecs = (motorcycleId: string) => {
    const baseSpecs = [
      { id: 1, spec_name: 'Тип двигателя', spec_value: '4-тактный', category: 'engine', sort_order: 1 },
      { id: 4, spec_name: 'Длина', spec_value: '2150', spec_unit: 'мм', category: 'dimensions', sort_order: 1 },
      { id: 5, spec_name: 'Ширина', spec_value: '850', spec_unit: 'мм', category: 'dimensions', sort_order: 2 },
      { id: 6, spec_name: 'Высота', spec_value: '1200', spec_unit: 'мм', category: 'dimensions', sort_order: 3 },
    ];

    if (motorcycleId.includes('450')) {
      baseSpecs.push(
        { id: 2, spec_name: 'Объем двигателя', spec_value: '450', spec_unit: 'куб.см', category: 'engine', sort_order: 2 },
        { id: 3, spec_name: 'Максимальная мощность', spec_value: '45', spec_unit: 'л.с.', category: 'engine', sort_order: 3 },
        { id: 7, spec_name: 'Снаряженная масса', spec_value: '165', spec_unit: 'кг', category: 'dimensions', sort_order: 4 },
        { id: 8, spec_name: 'Максимальная скорость', spec_value: '180', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 9, spec_name: 'Расход топлива', spec_value: '3.5', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
      );
    } else if (motorcycleId.includes('650')) {
      baseSpecs.push(
        { id: 2, spec_name: 'Объем двигателя', spec_value: '650', spec_unit: 'куб.см', category: 'engine', sort_order: 2 },
        { id: 3, spec_name: 'Максимальная мощность', spec_value: '65', spec_unit: 'л.с.', category: 'engine', sort_order: 3 },
        { id: 7, spec_name: 'Снаряженная масса', spec_value: '220', spec_unit: 'кг', category: 'dimensions', sort_order: 4 },
        { id: 8, spec_name: 'Максимальная скорость', spec_value: '160', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 9, spec_name: 'Расход топлива', spec_value: '3.2', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
      );
    } else if (motorcycleId.includes('800')) {
      baseSpecs.push(
        { id: 2, spec_name: 'Объем двигателя', spec_value: '800', spec_unit: 'куб.см', category: 'engine', sort_order: 2 },
        { id: 3, spec_name: 'Максимальная мощность', spec_value: '80', spec_unit: 'л.с.', category: 'engine', sort_order: 3 },
        { id: 7, spec_name: 'Снаряженная масса', spec_value: '190', spec_unit: 'кг', category: 'dimensions', sort_order: 4 },
        { id: 8, spec_name: 'Максимальная скорость', spec_value: '170', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 9, spec_name: 'Расход топлива', spec_value: '3.2', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
      );
    }

    return baseSpecs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
              Модели мотоциклов
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{motorcycle.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - Изображения */}
          <div className="space-y-4">
            {/* Основное изображение */}
            <div className={`aspect-video bg-gradient-to-br ${motorcycle.color} rounded-xl overflow-hidden relative flex items-center justify-center shadow-lg`}>
              <motorcycle.icon className="w-32 h-32 text-white/30" />
              
              {/* Кнопки действий */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Индикатор статуса */}
              <div className="absolute top-4 left-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Доступен
                </span>
              </div>
            </div>

            {/* Миниатюры изображений */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <button
                  key={index}
                  className={`aspect-square bg-gradient-to-br ${motorcycle.color} rounded-lg overflow-hidden relative flex items-center justify-center ${
                    currentImageIndex === index ? 'ring-2 ring-red-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <motorcycle.icon className="w-6 h-6 text-white/50" />
                </button>
              ))}
            </div>
          </div>

          {/* Правая колонка - Информация */}
          <div className="space-y-6">
            {/* Заголовок и рейтинг */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-600">{motorcycle.category}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{motorcycle.rating}</span>
                  <span className="text-xs text-gray-400">(245 отзывов)</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{motorcycle.name}</h1>
              <p className="text-lg text-gray-600">{motorcycle.description}</p>
            </div>

            {/* Описание модели */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Описание</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {motorcycle.fullDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Табы с дополнительной информацией */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'specs', label: 'Характеристики' },
                { id: 'features', label: 'Особенности' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'specs' && (
              <MotorcycleSpecs 
                modelName={motorcycle.name}
                specs={getSpecs(motorcycle.id)}
              />
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {motorcycle.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-3 h-3 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Подробное описание особенности {feature.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Скрипт продаж для менеджеров */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <button
            onClick={() => setShowSalesScript(!showSalesScript)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-blue-900">
              📋 Скрипт продаж для менеджеров
            </h3>
            {showSalesScript ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600" />
            )}
          </button>
          
          {showSalesScript && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Введение:</h4>
                <p className="text-blue-800">{motorcycle.salesScript.intro}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Преимущества:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {motorcycle.salesScript.benefits.map((benefit, index) => (
                    <li key={index} className="text-blue-800">{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Ответы на возражения:</h4>
                {motorcycle.salesScript.objections.map((objection, index) => (
                  <div key={index} className="bg-white rounded p-3 mb-2">
                    <p className="font-medium text-gray-900 mb-1">
                      ❓ {objection.question}
                    </p>
                    <p className="text-gray-700">
                      ✅ {objection.answer}
                    </p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Закрытие сделки:</h4>
                <p className="text-blue-800 font-medium">{motorcycle.salesScript.closing}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 