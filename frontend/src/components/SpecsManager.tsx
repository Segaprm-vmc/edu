import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Save, X, Settings2 } from 'lucide-react';

// Интерфейс характеристики
interface MotorcycleSpec {
  id: number;
  modelId: string;
  spec_name: string;
  spec_value: string;
  spec_unit?: string;
  category: string;
  sort_order: number;
}

// Интерфейс модели
interface MotorcycleModel {
  id: string;
  name: string;
  category: string;
}

interface SpecsManagerProps {
  models: MotorcycleModel[];
}

const SpecsManager: React.FC<SpecsManagerProps> = ({ models }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [specs, setSpecs] = useState<MotorcycleSpec[]>([]);
  const [filteredSpecs, setFilteredSpecs] = useState<MotorcycleSpec[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSpec, setEditingSpec] = useState<MotorcycleSpec | null>(null);
  const [formData, setFormData] = useState({
    spec_name: '',
    spec_value: '',
    spec_unit: '',
    category: '',
    sort_order: 1
  });

  // Категории характеристик
  const specCategories = [
    { id: 'engine', name: 'Двигатель' },
    { id: 'chassis', name: 'Шасси и подвеска' },
    { id: 'brakes', name: 'Тормозная система' },
    { id: 'wheels', name: 'Колеса и шины' },
    { id: 'dimensions', name: 'Габариты и масса' },
    { id: 'electrical', name: 'Электрооборудование' },
    { id: 'performance', name: 'Характеристики производительности' },
    { id: 'features', name: 'Дополнительные особенности' },
    { id: 'other', name: 'Прочие характеристики' }
  ];

  // Загрузка характеристик для выбранной модели
  useEffect(() => {
    if (selectedModelId) {
      // Генерируем базовые характеристики для выбранной модели
      const mockSpecs: MotorcycleSpec[] = [
        { id: 1, modelId: selectedModelId, spec_name: 'Тип двигателя', spec_value: '4-тактный одноцилиндровый', category: 'engine', sort_order: 1 },
        { id: 2, modelId: selectedModelId, spec_name: 'Объем двигателя', spec_value: '450', spec_unit: 'куб.см', category: 'engine', sort_order: 2 },
        { id: 3, modelId: selectedModelId, spec_name: 'Максимальная мощность', spec_value: '45', spec_unit: 'л.с.', category: 'engine', sort_order: 3 },
        { id: 4, modelId: selectedModelId, spec_name: 'Система охлаждения', spec_value: 'Жидкостное', category: 'engine', sort_order: 4 },
        { id: 5, modelId: selectedModelId, spec_name: 'Коробка передач', spec_value: '6-ступенчатая', category: 'engine', sort_order: 5 },
        
        { id: 10, modelId: selectedModelId, spec_name: 'Тип рамы', spec_value: 'Стальная трубчатая', category: 'chassis', sort_order: 1 },
        { id: 11, modelId: selectedModelId, spec_name: 'Передняя подвеска', spec_value: 'Телескопическая вилка', category: 'chassis', sort_order: 2 },
        { id: 12, modelId: selectedModelId, spec_name: 'Задняя подвеска', spec_value: 'Маятниковая с моноамортизатором', category: 'chassis', sort_order: 3 },
        
        { id: 20, modelId: selectedModelId, spec_name: 'Передний тормоз', spec_value: 'Дисковый 300мм', category: 'brakes', sort_order: 1 },
        { id: 21, modelId: selectedModelId, spec_name: 'Задний тормоз', spec_value: 'Дисковый 240мм', category: 'brakes', sort_order: 2 },
        { id: 22, modelId: selectedModelId, spec_name: 'ABS', spec_value: 'Есть', category: 'brakes', sort_order: 3 },
        
        { id: 30, modelId: selectedModelId, spec_name: 'Длина', spec_value: '2150', spec_unit: 'мм', category: 'dimensions', sort_order: 1 },
        { id: 31, modelId: selectedModelId, spec_name: 'Ширина', spec_value: '850', spec_unit: 'мм', category: 'dimensions', sort_order: 2 },
        { id: 32, modelId: selectedModelId, spec_name: 'Высота', spec_value: '1200', spec_unit: 'мм', category: 'dimensions', sort_order: 3 },
        { id: 33, modelId: selectedModelId, spec_name: 'Снаряженная масса', spec_value: '165', spec_unit: 'кг', category: 'dimensions', sort_order: 4 }
      ];
      
      setSpecs(mockSpecs);
    } else {
      setSpecs([]);
    }
  }, [selectedModelId]);

  // Фильтрация характеристик
  useEffect(() => {
    let filtered = specs;
    
    if (searchTerm) {
      filtered = specs.filter(spec =>
        spec.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.spec_value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSpecs(filtered);
  }, [specs, searchTerm]);

  // Получение названия категории
  const getCategoryName = (categoryId: string) => {
    const category = specCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Группировка характеристик по категориям
  const groupedSpecs = filteredSpecs.reduce((acc, spec) => {
    const category = spec.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(spec);
    return acc;
  }, {} as Record<string, MotorcycleSpec[]>);

  // Обработчики формы
  const handleAddSpec = () => {
    setEditingSpec(null);
    setFormData({
      spec_name: '',
      spec_value: '',
      spec_unit: '',
      category: 'engine',
      sort_order: Math.max(...specs.map(s => s.sort_order), 0) + 1
    });
    setShowForm(true);
  };

  const handleEditSpec = (spec: MotorcycleSpec) => {
    setEditingSpec(spec);
    setFormData({
      spec_name: spec.spec_name,
      spec_value: spec.spec_value,
      spec_unit: spec.spec_unit || '',
      category: spec.category,
      sort_order: spec.sort_order
    });
    setShowForm(true);
  };

  const handleSaveSpec = () => {
    if (!selectedModelId || !formData.spec_name || !formData.spec_value) {
      return;
    }

    const newSpec: MotorcycleSpec = {
      id: editingSpec ? editingSpec.id : Math.max(...specs.map(s => s.id), 0) + 1,
      modelId: selectedModelId,
      spec_name: formData.spec_name,
      spec_value: formData.spec_value,
      spec_unit: formData.spec_unit || undefined,
      category: formData.category,
      sort_order: formData.sort_order
    };

    if (editingSpec) {
      setSpecs(specs.map(s => s.id === editingSpec.id ? newSpec : s));
    } else {
      setSpecs([...specs, newSpec]);
    }

    setShowForm(false);
    setEditingSpec(null);
  };

  const handleDeleteSpec = (id: number) => {
    setSpecs(specs.filter(s => s.id !== id));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSpec(null);
  };

  return (
    <div className="space-y-6">
      {/* Выбор модели */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Выберите модель для управления характеристиками
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Выберите модель</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.category})
              </option>
            ))}
          </select>
          
          {selectedModelId && (
            <div className="flex items-center text-sm text-gray-600">
              <Settings2 className="w-4 h-4 mr-2" />
              Характеристик: {specs.length}
            </div>
          )}
        </div>
      </div>

      {selectedModelId && (
        <>
          {/* Панель управления */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Поиск характеристик..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <button
                  onClick={handleAddSpec}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить характеристику</span>
                </button>
              </div>
            </div>

            {/* Список характеристик по категориям */}
            <div className="p-6">
              {Object.keys(groupedSpecs).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedSpecs).map(([categoryId, categorySpecs]) => (
                    <div key={categoryId}>
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        {getCategoryName(categoryId)} ({categorySpecs.length})
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categorySpecs
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(spec => (
                            <div key={spec.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900 text-sm">{spec.spec_name}</h5>
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => handleEditSpec(spec)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSpec(spec.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-700">
                                <span className="font-semibold">{spec.spec_value}</span>
                                {spec.spec_unit && (
                                  <span className="text-gray-500 ml-1">{spec.spec_unit}</span>
                                )}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Характеристики не найдены' : 'Нет характеристик'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Попробуйте изменить поисковый запрос'
                      : 'Добавьте первую характеристику для этой модели'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddSpec}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Добавить характеристику
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Модальное окно формы */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSpec ? 'Редактировать характеристику' : 'Добавить характеристику'}
              </h3>
              <button
                onClick={handleCancelForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название характеристики *
                </label>
                <input
                  type="text"
                  value={formData.spec_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, spec_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Объем двигателя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Значение *
                </label>
                <input
                  type="text"
                  value={formData.spec_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, spec_value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="450"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Единица измерения
                </label>
                <input
                  type="text"
                  value={formData.spec_unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, spec_unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="куб.см"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {specCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveSpec}
                disabled={!formData.spec_name || !formData.spec_value}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecsManager; 