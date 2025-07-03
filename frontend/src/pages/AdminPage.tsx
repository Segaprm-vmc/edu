import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Edit3,
  Trash2,
  Search,
  ArrowLeft,
  Bike
} from 'lucide-react';
import ModelForm from '../components/ModelForm';
import CategoryManager from '../components/CategoryManager';

// Интерфейс модели мотоцикла
interface MotorcycleModel {
  id: string;
  name: string;
  category: string;
  year: number;
  price: string;
  description: string;
  fullDescription: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс категории
interface Category {
  id: string;
  name: string;
  count: number;
}

// Категории по умолчанию (всегда доступны)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'motorcycles', name: 'Мотоциклы', count: 0 },
  { id: 'enduro', name: 'Эндуро', count: 0 },
  { id: 'scooters', name: 'Скутеры', count: 0 },
  { id: 'mopeds', name: 'Мопеды', count: 0 },
  { id: 'pitbikes', name: 'Питбайки', count: 0 }
];

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAdminAuthenticated') === 'true'
  );
  const [activeTab, setActiveTab] = useState<'models' | 'categories'>('models');
  const [models, setModels] = useState<MotorcycleModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedModel, setSelectedModel] = useState<MotorcycleModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const navigate = useNavigate();

  // Проверка аутентификации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Загрузка категорий
  useEffect(() => {
    setCategories([...DEFAULT_CATEGORIES]);
  }, []);

  // Загрузка моделей (пока мок данные)
  useEffect(() => {
    const mockModels: MotorcycleModel[] = [
      {
        id: 'vmc-sport-450',
        name: 'VMC Sport 450',
        category: 'Мотоциклы',
        year: 2024,
        price: 'По запросу',
        description: 'Спортивный мотоцикл для динамичной езды',
        fullDescription: 'VMC Sport 450 — это воплощение спортивного духа и передовых технологий.',
        features: ['Мощный двигатель 450cc', 'Спортивная посадка', 'LED-освещение'],
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'vmc-cruiser-650',
        name: 'VMC Cruiser 650',
        category: 'Мотоциклы',
        year: 2024,
        price: 'По запросу',
        description: 'Комфортный круизер для дальних поездок',
        fullDescription: 'VMC Cruiser 650 создан для тех, кто ценит комфорт в путешествиях.',
        features: ['Двигатель V-twin 650cc', 'Удобная посадка', 'Хромированные детали'],
        isActive: true,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 'vmc-adventure-800',
        name: 'VMC Adventure 800',
        category: 'Эндуро',
        year: 2024,
        price: 'По запросу',
        description: 'Приключенческий мотоцикл для любых дорог',
        fullDescription: 'VMC Adventure 800 — универсальный мотоцикл для искателей приключений.',
        features: ['Мощный двигатель 800cc', 'Регулируемая подвеска', 'Защита двигателя'],
        isActive: true,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-05'
      },
      {
        id: 'vmc-enduro-250',
        name: 'VMC Enduro 250',
        category: 'Эндуро',
        year: 2024,
        price: 'По запросу',
        description: 'Настоящий внедорожник для бездорожья',
        fullDescription: 'VMC Enduro 250 создан для покорения самых сложных маршрутов.',
        features: ['Двигатель 250cc', 'Длинноходная подвеска', 'Защита двигателя'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 'vmc-scooter-150',
        name: 'VMC Scooter 150',
        category: 'Скутеры',
        year: 2024,
        price: 'По запросу',
        description: 'Идеальный городской транспорт',
        fullDescription: 'VMC Scooter 150 — экономичный и маневренный скутер для города.',
        features: ['Двигатель 150cc', 'Автоматическая трансмиссия', 'Большой багажник'],
        isActive: true,
        createdAt: '2023-12-25',
        updatedAt: '2023-12-25'
      }
    ];
    setModels(mockModels);
  }, []);

  // Фильтрация моделей
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчики
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin/login');
  };

  const handleEditModel = (model: MotorcycleModel) => {
    setSelectedModel(model);
    setShowModelForm(true);
  };

  const handleDeleteModel = (modelId: string) => {
    setModelToDelete(modelId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (modelToDelete) {
      setModels(models.filter(m => m.id !== modelToDelete));
      setModelToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleSaveModel = (modelData: MotorcycleModel) => {
    if (selectedModel) {
      // Редактирование существующей модели
      setModels(prevModels => 
        prevModels.map(m => m.id === selectedModel.id ? modelData : m)
      );
    } else {
      // Добавление новой модели
      setModels(prevModels => [...prevModels, modelData]);
    }
    
    // Закрываем форму
    setShowModelForm(false);
    setSelectedModel(null);
  };

  const handleCancelForm = () => {
    setShowModelForm(false);
    setSelectedModel(null);
  };

  // Вычисляем категории с актуальными счетчиками
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: models.filter(model => model.category === category.name).length
  }));



  if (!isAuthenticated) {
    return null; // Переход к login page происходит в useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Админ панель <span className="text-red-600">VMC Moto</span>
                </h1>
                <p className="text-sm text-gray-600">Управление моделями мотоциклов</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">На сайт</span>
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Навигация */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('models');
                  setSelectedModel(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'models'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bike className="w-4 h-4" />
                  <span>Модели ({models.length})</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>🏷️</span>
                  <span>Категории ({categoriesWithCounts.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Контент */}
        {activeTab === 'models' && (
          <div>
            {/* Панель управления */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Поиск моделей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    setSelectedModel(null);
                    setShowModelForm(true);
                  }}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить модель</span>
                </button>
              </div>
            </div>

            {/* Список моделей */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Модели мотоциклов ({filteredModels.length})
                </h3>
              </div>

              {filteredModels.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredModels.map((model) => (
                    <div key={model.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                              <Bike className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{model.category}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  model.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {model.isActive ? 'Активна' : 'Неактивна'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600 text-sm">{model.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            model.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {model.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                          <button
                            onClick={() => handleEditModel(model)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Bike className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Модели не найдены</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Начните с добавления первой модели'}
                  </p>
                  {!searchTerm && (
                    <button 
                      onClick={() => {
                        setSelectedModel(null);
                        setShowModelForm(true);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Добавить первую модель
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManager 
            categories={categoriesWithCounts} 
            onCategoriesChange={setCategories}
          />
        )}
      </div>

      {/* Модальное окно формы модели */}
      {showModelForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ModelForm
              model={selectedModel}
              categories={categoriesWithCounts.map(cat => cat.name)}
              onSave={handleSaveModel}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Подтвердите удаление
            </h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить эту модель? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 