import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Shield
} from 'lucide-react';
import MotorcycleSpecs from '../components/MotorcycleSpecs';
import { apiService, ModelPhoto } from '../services/api';

// Данные мотоциклов
const motorcycles = {
  'vmc-sport-450': {
    id: 'vmc-sport-450',
    name: 'VMC Sport 450',
    category: 'Мотоциклы',
    year: 2024,
    price: 'По запросу',
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
    category: 'Мотоциклы',
    year: 2024,
    price: 'По запросу',
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
    category: 'Эндуро',
    year: 2024,
    price: 'По запросу',
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
    icon: Zap,
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
  const { motorcycleId } = useParams<{ motorcycleId: string }>();
  const [activeTab, setActiveTab] = useState<'specs' | 'features'>('specs');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [photos, setPhotos] = useState<ModelPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  const motorcycle = motorcycleId ? motorcycles[motorcycleId as keyof typeof motorcycles] : null;

  // Загрузка фотографий модели
  useEffect(() => {
    const loadPhotos = async () => {
      if (motorcycle?.id) {
        // Попробуем получить численный ID из строкового ID
        const numericId = parseInt(motorcycle.id.split('-').pop() || '0');
        if (numericId > 0) {
          setIsLoadingPhotos(true);
          try {
            const modelPhotos = await apiService.getModelPhotos(numericId);
            setPhotos(modelPhotos.sort((a, b) => a.sort_order - b.sort_order));
          } catch (error) {
            console.error('Ошибка загрузки фотографий:', error);
            setPhotos([]);
          } finally {
            setIsLoadingPhotos(false);
          }
        }
      }
    };

    loadPhotos();
  }, [motorcycle?.id]);

  // Функция для получения URL фотографии
  const getPhotoUrl = (photo: ModelPhoto) => {
    return `/static/uploads/${photo.file_path}`;
  };

  // Получение основной фотографии или первой по порядку
  const primaryPhoto = photos.find(photo => photo.is_primary) || photos[0];
  const currentPhoto = photos[currentImageIndex] || primaryPhoto;

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
      // Двигатель
      { id: 1, spec_name: 'Тип двигателя', spec_value: '4-тактный одноцилиндровый', category: 'engine', sort_order: 1 },
      { id: 2, spec_name: 'Система охлаждения', spec_value: 'Жидкостное', category: 'engine', sort_order: 2 },
      { id: 3, spec_name: 'Система питания', spec_value: 'Электронный впрыск EFI', category: 'engine', sort_order: 3 },
      { id: 4, spec_name: 'Система зажигания', spec_value: 'Электронная CDI', category: 'engine', sort_order: 4 },
      { id: 5, spec_name: 'Коробка передач', spec_value: '6-ступенчатая', category: 'engine', sort_order: 5 },
      { id: 6, spec_name: 'Сцепление', spec_value: 'Многодисковое в масляной ванне', category: 'engine', sort_order: 6 },
      
      // Шасси и подвеска
      { id: 20, spec_name: 'Тип рамы', spec_value: 'Стальная трубчатая', category: 'chassis', sort_order: 1 },
      { id: 21, spec_name: 'Передняя подвеска', spec_value: 'Телескопическая вилка', category: 'chassis', sort_order: 2 },
      { id: 22, spec_name: 'Задняя подвеска', spec_value: 'Маятниковая с моноамортизатором', category: 'chassis', sort_order: 3 },
      { id: 23, spec_name: 'Ход передней подвески', spec_value: '300', spec_unit: 'мм', category: 'chassis', sort_order: 4 },
      { id: 24, spec_name: 'Ход задней подвески', spec_value: '280', spec_unit: 'мм', category: 'chassis', sort_order: 5 },
      
      // Тормозная система
      { id: 30, spec_name: 'Передний тормоз', spec_value: 'Дисковый 300мм', category: 'brakes', sort_order: 1 },
      { id: 31, spec_name: 'Задний тормоз', spec_value: 'Дисковый 240мм', category: 'brakes', sort_order: 2 },
      { id: 32, spec_name: 'ABS', spec_value: 'Есть', category: 'brakes', sort_order: 3 },
      
      // Колеса и шины
      { id: 40, spec_name: 'Переднее колесо', spec_value: '21" x 1.60', category: 'wheels', sort_order: 1 },
      { id: 41, spec_name: 'Заднее колесо', spec_value: '18" x 2.15', category: 'wheels', sort_order: 2 },
      { id: 42, spec_name: 'Передняя шина', spec_value: '90/90-21 54H', category: 'wheels', sort_order: 3 },
      { id: 43, spec_name: 'Задняя шина', spec_value: '120/80-18 62H', category: 'wheels', sort_order: 4 },
      
      // Габариты и масса
      { id: 50, spec_name: 'Длина', spec_value: '2150', spec_unit: 'мм', category: 'dimensions', sort_order: 1 },
      { id: 51, spec_name: 'Ширина', spec_value: '850', spec_unit: 'мм', category: 'dimensions', sort_order: 2 },
      { id: 52, spec_name: 'Высота', spec_value: '1200', spec_unit: 'мм', category: 'dimensions', sort_order: 3 },
      { id: 53, spec_name: 'Высота сиденья', spec_value: '830', spec_unit: 'мм', category: 'dimensions', sort_order: 4 },
      { id: 54, spec_name: 'Колесная база', spec_value: '1450', spec_unit: 'мм', category: 'dimensions', sort_order: 5 },
      { id: 55, spec_name: 'Дорожный просвет', spec_value: '250', spec_unit: 'мм', category: 'dimensions', sort_order: 6 },
      
      // Электрооборудование
      { id: 60, spec_name: 'Фара', spec_value: 'LED', category: 'electrical', sort_order: 1 },
      { id: 61, spec_name: 'Задний фонарь', spec_value: 'LED', category: 'electrical', sort_order: 2 },
      { id: 62, spec_name: 'Поворотники', spec_value: 'LED', category: 'electrical', sort_order: 3 },
      { id: 63, spec_name: 'Приборная панель', spec_value: 'Цифровая LCD', category: 'electrical', sort_order: 4 },
      { id: 64, spec_name: 'Аккумулятор', spec_value: '12V 8Ah', category: 'electrical', sort_order: 5 },
      
      // Дополнительные особенности
      { id: 70, spec_name: 'Объем топливного бака', spec_value: '9.5', spec_unit: 'л', category: 'features', sort_order: 1 },
      { id: 71, spec_name: 'Запуск', spec_value: 'Электростартер', category: 'features', sort_order: 2 },
      { id: 72, spec_name: 'Защита двигателя', spec_value: 'Есть', category: 'features', sort_order: 3 },
      { id: 73, spec_name: 'Ветровое стекло', spec_value: 'Регулируемое', category: 'features', sort_order: 4 }
    ];

    if (motorcycleId.includes('450')) {
      baseSpecs.push(
        { id: 10, spec_name: 'Объем двигателя', spec_value: '450', spec_unit: 'куб.см', category: 'engine', sort_order: 7 },
        { id: 11, spec_name: 'Максимальная мощность', spec_value: '45', spec_unit: 'л.с.', category: 'engine', sort_order: 8 },
        { id: 12, spec_name: 'Максимальный крутящий момент', spec_value: '38', spec_unit: 'Нм', category: 'engine', sort_order: 9 },
        { id: 56, spec_name: 'Снаряженная масса', spec_value: '165', spec_unit: 'кг', category: 'dimensions', sort_order: 7 },
        { id: 80, spec_name: 'Максимальная скорость', spec_value: '180', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 81, spec_name: 'Расход топлива', spec_value: '3.5', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
      );
    } else if (motorcycleId.includes('650')) {
      baseSpecs.push(
        { id: 10, spec_name: 'Объем двигателя', spec_value: '650', spec_unit: 'куб.см', category: 'engine', sort_order: 7 },
        { id: 11, spec_name: 'Максимальная мощность', spec_value: '65', spec_unit: 'л.с.', category: 'engine', sort_order: 8 },
        { id: 12, spec_name: 'Максимальный крутящий момент', spec_value: '58', spec_unit: 'Нм', category: 'engine', sort_order: 9 },
        { id: 56, spec_name: 'Снаряженная масса', spec_value: '220', spec_unit: 'кг', category: 'dimensions', sort_order: 7 },
        { id: 80, spec_name: 'Максимальная скорость', spec_value: '160', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 81, spec_name: 'Расход топлива', spec_value: '3.2', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
      );
    } else if (motorcycleId.includes('800')) {
      baseSpecs.push(
        { id: 10, spec_name: 'Объем двигателя', spec_value: '800', spec_unit: 'куб.см', category: 'engine', sort_order: 7 },
        { id: 11, spec_name: 'Максимальная мощность', spec_value: '80', spec_unit: 'л.с.', category: 'engine', sort_order: 8 },
        { id: 12, spec_name: 'Максимальный крутящий момент', spec_value: '68', spec_unit: 'Нм', category: 'engine', sort_order: 9 },
        { id: 56, spec_name: 'Снаряженная масса', spec_value: '190', spec_unit: 'кг', category: 'dimensions', sort_order: 7 },
        { id: 80, spec_name: 'Максимальная скорость', spec_value: '170', spec_unit: 'км/ч', category: 'performance', sort_order: 1 },
        { id: 81, spec_name: 'Расход топлива', spec_value: '3.2', spec_unit: 'л/100км', category: 'performance', sort_order: 2 }
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
            <div className="aspect-[4/3] rounded-xl overflow-hidden relative shadow-lg bg-gray-100">
              {currentPhoto ? (
                <img
                  src={getPhotoUrl(currentPhoto)}
                  alt={motorcycle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${motorcycle.color} flex items-center justify-center`}>
                  <motorcycle.icon className="w-40 h-40 text-white/30" />
                </div>
              )}
              
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

              {/* Навигация между фотографиями */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Индикатор позиции */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Миниатюры изображений */}
            {photos.length > 0 && (
              <div className="grid grid-cols-6 gap-2">
                {photos.slice(0, 6).map((photo, index) => (
                  <button
                    key={photo.id}
                    className={`aspect-square rounded-lg overflow-hidden relative ${
                      currentImageIndex === index ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={getPhotoUrl(photo)}
                      alt={`${motorcycle.name} - фото ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {photo.is_primary && (
                      <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-1">
                        <div className="w-1 h-1 bg-yellow-900 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
                {photos.length > 6 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{photos.length - 6}
                  </div>
                )}
              </div>
            )}

            {/* Загрузка фотографий */}
            {isLoadingPhotos && (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Загрузка фотографий...</div>
              </div>
            )}

            {/* Сообщение об отсутствии фотографий */}
            {!isLoadingPhotos && photos.length === 0 && (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Фотографии не загружены</div>
              </div>
            )}
          </div>

          {/* Правая колонка - Информация */}
          <div className="space-y-4">
            {/* Заголовок */}
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-red-600">{motorcycle.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">{motorcycle.name}</h1>
            </div>

            {/* Описание модели */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Описание</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {motorcycle.fullDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Табы с дополнительной информацией */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'specs', label: 'Характеристики' },
                { id: 'features', label: 'Скрипт продаж' }
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
                specs={getSpecs(motorcycle.id)}
              />
            )}

            {activeTab === 'features' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-6">
                  📋 Скрипт продаж для менеджеров
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-3">Введение:</h4>
                    <p className="text-blue-800 bg-white rounded-lg p-4">{motorcycle.salesScript.intro}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-900 mb-3">Преимущества:</h4>
                    <div className="bg-white rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-2">
                        {motorcycle.salesScript.benefits.map((benefit, index) => (
                          <li key={index} className="text-blue-800">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-900 mb-3">Ответы на возражения:</h4>
                    <div className="space-y-3">
                      {motorcycle.salesScript.objections.map((objection, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-2">
                            ❓ {objection.question}
                          </p>
                          <p className="text-gray-700">
                            ✅ {objection.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-900 mb-3">Закрытие сделки:</h4>
                    <p className="text-blue-800 font-medium bg-white rounded-lg p-4">{motorcycle.salesScript.closing}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
} 