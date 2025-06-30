import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

// Системные категории (нельзя удалить)
const DEFAULT_CATEGORY_IDS = ['motorcycles', 'enduro', 'scooters', 'mopeds', 'pitbikes'];

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCategoriesChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  // Обработчики
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setError('');
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    // Защита системных категорий от редактирования
    if (DEFAULT_CATEGORY_IDS.includes(category.id)) {
      alert('Системные категории нельзя редактировать. Они имеют фиксированные названия.');
      return;
    }

    setEditingCategory(category);
    setFormData({ name: category.name });
    setError('');
    setShowForm(true);
  };

  const handleSaveCategory = () => {
    const name = formData.name.trim();
    
    if (!name) {
      setError('Название категории обязательно');
      return;
    }

    // Проверка на уникальность
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== editingCategory?.id
    );
    
    if (existingCategory) {
      setError('Категория с таким названием уже существует');
      return;
    }

    let updatedCategories: Category[];
    
    if (editingCategory) {
      // Редактирование
      updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name }
          : cat
      );
    } else {
      // Добавление
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name,
        count: 0
      };
      updatedCategories = [...categories, newCategory];
    }

    onCategoriesChange(updatedCategories);
    setShowForm(false);
    setEditingCategory(null);
    setError('');
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Защита системных категорий от удаления
    if (DEFAULT_CATEGORY_IDS.includes(categoryId)) {
      alert('Системные категории нельзя удалить. Они всегда доступны для выбора.');
      return;
    }

    const category = categories.find(cat => cat.id === categoryId);
    
    if (category && category.count > 0) {
      if (!confirm(`В категории "${category.name}" есть ${category.count} модели(ей). Вы уверены, что хотите удалить категорию?`)) {
        return;
      }
    }

    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    onCategoriesChange(updatedCategories);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setError('');
    setFormData({ name: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              Управление категориями ({categories.length})
            </h3>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить категорию</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const isSystemCategory = DEFAULT_CATEGORY_IDS.includes(category.id);
              return (
                <div key={category.id} className={`rounded-lg p-4 border ${
                  isSystemCategory 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        {isSystemCategory && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Системная
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {category.count} модели(ей)
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!isSystemCategory && (
                        <>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {isSystemCategory && (
                        <div className="text-xs text-blue-600 px-2 py-1">
                          Защищена
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет категорий</h3>
            <p className="text-gray-500 mb-4">
              Создайте первую категорию для организации моделей
            </p>
            <button
              onClick={handleAddCategory}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Добавить первую категорию
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно формы */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
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
                  Название категории *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Спортивные мотоциклы"
                  autoFocus
                />
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Информация:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Системные категории (Мотоциклы, Эндуро, Скутеры, Мопеды, Питбайки) всегда доступны</li>
                  <li>• Вы можете добавлять дополнительные пользовательские категории</li>
                  <li>• Системные категории нельзя удалить или переименовать</li>
                </ul>
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
                onClick={handleSaveCategory}
                disabled={!formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingCategory ? 'Обновить' : 'Создать'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 