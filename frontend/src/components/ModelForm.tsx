import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Upload, Image } from 'lucide-react';

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
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModelFormProps {
  model?: MotorcycleModel | null;
  categories: string[];
  onSave: (model: MotorcycleModel) => void;
  onCancel: () => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MotorcycleModel>>({
    name: '',
    category: '',
    description: '',
    fullDescription: '',
    features: [''],
    imageUrl: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Заполнение формы при редактировании
  useEffect(() => {
    if (model) {
      setFormData({
        ...model,
        features: model.features.length > 0 ? model.features : ['']
      });
    }
  }, [model]);

  // Валидация
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Название модели обязательно';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'Категория обязательна';
    }



    if (!formData.description?.trim()) {
      newErrors.description = 'Краткое описание обязательно';
    }

    if (!formData.fullDescription?.trim()) {
      newErrors.fullDescription = 'Полное описание обязательно';
    }

    // Проверка характеристик
    const validFeatures = formData.features?.filter(f => f.trim()) || [];
    if (validFeatures.length === 0) {
      newErrors.features = 'Добавьте хотя бы одну характеристику';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const validFeatures = formData.features?.filter(f => f.trim()) || [];
      
      const modelData: MotorcycleModel = {
        id: model?.id || `vmc-${formData.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: formData.name!,
        category: formData.category!,
        year: new Date().getFullYear(),
        price: 'По запросу',
        description: formData.description!,
        fullDescription: formData.fullDescription!,
        features: validFeatures,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive ?? true,
        createdAt: model?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      onSave(modelData);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Добавление новой категории
  const handleAddNewCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;

    if (!categories.includes(name)) {
      // Временно добавляем в список для использования в форме
      // В реальной ситуации это должно обновляться через родительский компонент
      setFormData(prev => ({ ...prev, category: name }));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Управление характеристиками
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f) || []
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {model ? `Редактировать "${model.name}"` : 'Добавить новую модель'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Название модели */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Название модели *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="VMC Sport 450"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Категория */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Категория *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                + Новая категория
              </button>
            </div>
            
            {!showAddCategory ? (
              <select
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Название новой категории"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Введите название и нажмите Enter или кнопку сохранения
                </p>
              </div>
            )}
            
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Описания */}
        <div className="space-y-4">
          {/* Краткое описание */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Краткое описание *
            </label>
            <input
              type="text"
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Спортивный мотоцикл для динамичной езды"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Полное описание */}
          <div>
            <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Полное описание *
            </label>
            <textarea
              id="fullDescription"
              rows={4}
              value={formData.fullDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.fullDescription ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Подробное описание модели, её особенностей и преимуществ..."
            />
            {errors.fullDescription && <p className="text-red-600 text-sm mt-1">{errors.fullDescription}</p>}
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ключевые характеристики *
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>

          <div className="space-y-3">
            {(formData.features || ['']).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={`Характеристика ${index + 1}`}
                />
                {(formData.features?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.features && <p className="text-red-600 text-sm mt-1">{errors.features}</p>}
        </div>

        {/* Изображение */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL изображения
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Загрузить</span>
            </button>
          </div>
          {formData.imageUrl && (
            <div className="mt-3">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Статус */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive ?? true}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Модель активна (отображается на сайте)
          </label>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModelForm; 