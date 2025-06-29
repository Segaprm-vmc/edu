import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Download, Upload } from 'lucide-react';
import { clsx } from 'clsx';

interface MotorcycleSpec {
  id: number;
  spec_name: string;
  spec_value: string;
  spec_unit?: string;
  category?: string;
  sort_order?: number;
}

interface MotorcycleSpecsProps {
  modelName: string;
  specs: MotorcycleSpec[];
  imageUrl?: string;
  onSpecEdit?: (spec: MotorcycleSpec) => void;
  isAdmin?: boolean;
}

const MotorcycleSpecs: React.FC<MotorcycleSpecsProps> = ({
  modelName,
  specs,
  imageUrl,
  onSpecEdit,
  isAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['engine', 'dimensions']));

  // Группировка характеристик по категориям
  const specsByCategory = useMemo(() => {
    const categories: Record<string, MotorcycleSpec[]> = {
      engine: [],
      dimensions: [],
      performance: [],
      features: [],
      other: []
    };

    specs.forEach(spec => {
      const category = spec.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(spec);
    });

    // Сортировка внутри каждой категории
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    });

    return categories;
  }, [specs]);

  // Фильтрация характеристик
  const filteredSpecs = useMemo(() => {
    if (!searchTerm && selectedCategory === 'all') {
      return specsByCategory;
    }

    const filtered: Record<string, MotorcycleSpec[]> = {};
    
    Object.entries(specsByCategory).forEach(([category, categorySpecs]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) {
        return;
      }

      const matchingSpecs = categorySpecs.filter(spec =>
        spec.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.spec_value.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingSpecs.length > 0) {
        filtered[category] = matchingSpecs;
      }
    });

    return filtered;
  }, [specsByCategory, searchTerm, selectedCategory]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryNames: Record<string, string> = {
    engine: 'Двигатель',
    dimensions: 'Габариты и вес',
    performance: 'Характеристики',
    features: 'Особенности',
    other: 'Прочее'
  };

  const categoryColors: Record<string, string> = {
    engine: 'border-red-500 bg-red-50',
    dimensions: 'border-blue-500 bg-blue-50',
    performance: 'border-green-500 bg-green-50',
    features: 'border-purple-500 bg-purple-50',
    other: 'border-gray-500 bg-gray-50'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Заголовок модели */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-moto-dark mb-2">
          <span className="text-red-600">VMC</span> {modelName}
        </h1>
        <p className="text-moto-gray">Технические характеристики</p>
      </div>

      {/* Поиск и фильтры */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-moto-gray h-5 w-5" />
          <input
            type="text"
            placeholder="Поиск характеристик..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Все категории</option>
            {Object.entries(categoryNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          {isAdmin && (
            <>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Импорт Excel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Экспорт
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Изображение мотоцикла с интерактивными точками */}
        <div className="relative">
          {imageUrl ? (
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-medium">
              <img
                src={imageUrl}
                alt={`${modelName} схема`}
                className="w-full h-auto object-contain"
              />
              
              {/* Интерактивные маркеры частей мотоцикла */}
              <div className="absolute top-1/4 left-1/3 group">
                <div className="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:scale-125 transition-transform"></div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Двигатель
                </div>
              </div>
              
              <div className="absolute top-1/3 right-1/4 group">
                <div className="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform"></div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Топливный бак
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center text-moto-gray">
                <div className="text-6xl mb-4">🏍️</div>
                <p>Изображение модели</p>
                <p className="text-sm">будет добавлено позже</p>
              </div>
            </div>
          )}
        </div>

        {/* Таблицы характеристик по категориям */}
        <div className="space-y-4">
          {Object.entries(filteredSpecs).map(([category, categorySpecs]) => (
            <div key={category} className={clsx(
              'border-2 rounded-xl overflow-hidden transition-all duration-200',
              categoryColors[category] || 'border-gray-500 bg-gray-50'
            )}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-moto-dark">
                    {categoryNames[category] || category}
                  </h3>
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                    {categorySpecs.length}
                  </span>
                </div>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="h-5 w-5 text-moto-gray" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-moto-gray" />
                )}
              </button>

              {expandedCategories.has(category) && (
                <div className="px-6 pb-4">
                  <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Характеристика
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Значение
                          </th>
                          {isAdmin && (
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Действия
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categorySpecs.map((spec) => (
                          <tr 
                            key={spec.id} 
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-moto-dark">
                              {spec.spec_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-moto-gray">
                              <span className="font-semibold">{spec.spec_value}</span>
                              {spec.spec_unit && (
                                <span className="ml-1 text-gray-500">{spec.spec_unit}</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => onSpecEdit?.(spec)}
                                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                  Изменить
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Статистика внизу в стиле VMC */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-moto-dark text-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">{specs.length}</div>
          <div className="text-sm opacity-80">Характеристик</div>
        </div>
        <div className="bg-red-600 text-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">
            {specsByCategory.engine?.length || 0}
          </div>
          <div className="text-sm opacity-80">Двигатель</div>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">
            {specsByCategory.dimensions?.length || 0}
          </div>
          <div className="text-sm opacity-80">Габариты</div>
        </div>
        <div className="bg-green-600 text-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">
            {specsByCategory.performance?.length || 0}
          </div>
          <div className="text-sm opacity-80">Производительность</div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleSpecs; 