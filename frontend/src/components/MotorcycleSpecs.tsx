import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

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
  onSpecEdit,
  isAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Группировка характеристик по категориям
  const specsByCategory = useMemo(() => {
    const categories: Record<string, MotorcycleSpec[]> = {};

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
    if (!searchTerm) {
      return specsByCategory;
    }

    const filtered: Record<string, MotorcycleSpec[]> = {};
    
    Object.entries(specsByCategory).forEach(([category, categorySpecs]) => {
      const matchingSpecs = categorySpecs.filter(spec =>
        spec.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.spec_value.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingSpecs.length > 0) {
        filtered[category] = matchingSpecs;
      }
    });

    return filtered;
  }, [specsByCategory, searchTerm]);

  const categoryNames: Record<string, string> = {
    engine: 'Двигатель',
    chassis: 'Шасси и подвеска',
    brakes: 'Тормозная система',
    wheels: 'Колеса и шины',
    dimensions: 'Габариты и масса',
    electrical: 'Электрооборудование',
    performance: 'Характеристики производительности',
    features: 'Дополнительные особенности',
    other: 'Прочие характеристики'
  };

  return (
    <div className="w-full max-w-none">
      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Поиск характеристик..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          />
        </div>
      </div>

      {/* Таблицы характеристик по категориям */}
      <div className="space-y-8">
        {Object.entries(filteredSpecs).map(([category, categorySpecs]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Заголовок категории */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {categoryNames[category] || category}
              </h3>
            </div>

            {/* Таблица характеристик */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Характеристика
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Значение
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Действия
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorySpecs.map((spec, index) => (
                    <tr 
                      key={spec.id} 
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spec.spec_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="font-semibold">{spec.spec_value}</span>
                        {spec.spec_unit && (
                          <span className="ml-1 text-gray-500">{spec.spec_unit}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => onSpecEdit?.(spec)}
                            className="text-red-600 hover:text-red-900 font-medium"
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
        ))}
      </div>

      {/* Общая статистика */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{specs.length}</div>
            <div className="text-sm text-gray-600">Всего</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {specsByCategory.engine?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Двигатель</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {specsByCategory.chassis?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Шасси</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {specsByCategory.brakes?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Тормоза</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {specsByCategory.electrical?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Электрика</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {specsByCategory.dimensions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Габариты</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleSpecs; 