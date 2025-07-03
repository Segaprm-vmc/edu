import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import PhotoManager from './PhotoManager';
import SpecsExcelImport from './SpecsExcelImport';
import { apiService, ModelPhoto, ModelSpec } from '../services/api';

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
  photos?: ModelPhoto[];
  specs?: ModelSpec[];
}

interface ModelFormProps {
  model?: MotorcycleModel | null;
  categories: string[];
  onSave: (model: MotorcycleModel) => void;
  onCancel: () => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MotorcycleModel>>({
    name: model?.name || '',
    category: model?.category || '',
    description: model?.description || '',
    fullDescription: model?.fullDescription || '',
    features: model?.features || [''],
    isActive: model?.isActive ?? true
  });

  const [photos, setPhotos] = useState<ModelPhoto[]>(model?.photos || []);
  const [specs, setSpecs] = useState<ModelSpec[]>(model?.specs || []);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);

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

  // Загрузка характеристик для существующей модели
  useEffect(() => {
    const loadSpecs = async () => {
      if (model?.id && !isNaN(parseInt(model.id))) {
        setIsLoadingSpecs(true);
        try {
          const modelSpecs = await apiService.getModelSpecs(parseInt(model.id));
          setSpecs(modelSpecs);
        } catch (error) {
          console.error('Ошибка загрузки характеристик:', error);
        } finally {
          setIsLoadingSpecs(false);
        }
      }
    };

    loadSpecs();
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
        isActive: formData.isActive ?? true,
        createdAt: model?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        photos,
        specs
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

  // Функции для работы с фотографиями
  const handleUploadPhoto = async (file: File): Promise<void> => {
    if (!model?.id || isNaN(parseInt(model.id))) {
      alert('Сначала сохраните модель, чтобы загружать фотографии');
      return;
    }

    setIsLoadingPhotos(true);
    try {
      const newPhoto = await apiService.uploadModelPhoto(parseInt(model.id), file);
      setPhotos(prev => [...prev, newPhoto]);
    } catch (error) {
      console.error('Ошибка загрузки фотографии:', error);
      throw error;
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId: number): Promise<void> => {
    try {
      await apiService.deleteModelPhoto(photoId);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Ошибка удаления фотографии:', error);
      throw error;
    }
  };

  const handleSetPrimaryPhoto = async (photoId: number): Promise<void> => {
    try {
      await apiService.setPrimaryPhoto(photoId);
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        is_primary: photo.id === photoId
      })));
    } catch (error) {
      console.error('Ошибка установки основной фотографии:', error);
      throw error;
    }
  };

  const handleReorderPhotos = async (photoIds: number[]): Promise<void> => {
    if (!model?.id) return;
    
    try {
      await apiService.updatePhotosOrder(parseInt(model.id), photoIds);
      // Обновляем локальное состояние согласно новому порядку
      const reorderedPhotos = photoIds.map(id => 
        photos.find(photo => photo.id === id)!
      ).filter(Boolean);
      setPhotos(reorderedPhotos);
    } catch (error) {
      console.error('Ошибка изменения порядка фотографий:', error);
      throw error;
    }
  };

  // Загрузка фотографий для существующей модели
  useEffect(() => {
    const loadPhotos = async () => {
      if (model?.id && !isNaN(parseInt(model.id))) {
        setIsLoadingPhotos(true);
        try {
          const modelPhotos = await apiService.getModelPhotos(parseInt(model.id));
          setPhotos(modelPhotos);
        } catch (error) {
          console.error('Ошибка загрузки фотографий:', error);
        } finally {
          setIsLoadingPhotos(false);
        }
      }
    };

    loadPhotos();
  }, [model?.id]);

  // Обработчики для характеристик
  const handleUploadSpecs = async (newSpecs: ModelSpec[]): Promise<void> => {
    if (!model?.id || isNaN(parseInt(model.id))) {
      return;
    }

    setIsLoadingSpecs(true);
    try {
      for (const spec of newSpecs) {
        await apiService.createModelSpec(parseInt(model.id), spec);
      }
    } catch (error) {
      console.error('Ошибка загрузки характеристик:', error);
      throw error;
    } finally {
      setIsLoadingSpecs(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {model ? 'Редактировать модель' : 'Добавить новую модель'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* iOS-стайл тоггл активности */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Модель активна
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Отображается на сайте и доступна для просмотра
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                formData.isActive ? 'bg-red-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.isActive}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

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

          {/* Фотографии модели */}
          {model?.id && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <PhotoManager
                photos={photos}
                onPhotosChange={setPhotos}
                onUploadPhoto={handleUploadPhoto}
                onDeletePhoto={handleDeletePhoto}
                onSetPrimary={handleSetPrimaryPhoto}
                onReorderPhotos={handleReorderPhotos}
                isLoading={isLoadingPhotos}
              />
            </div>
          )}

          {/* Характеристики модели */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <SpecsExcelImport
              modelId={model?.id ? parseInt(model.id) : undefined}
              specs={specs}
              onSpecsChange={setSpecs}
              onUploadSpecs={handleUploadSpecs}
              isLoading={isLoadingSpecs}
            />
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
    </div>
  );
};

export default ModelForm; 