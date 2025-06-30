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
  specs: MotorcycleSpec[];
  imageUrl?: string;
  onSpecEdit?: (spec: MotorcycleSpec) => void;
  isAdmin?: boolean;
}

const MotorcycleSpecs: React.FC<MotorcycleSpecsProps> = ({
  specs,
  onSpecEdit,
  isAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация характеристик
  const filteredSpecs = useMemo(() => {
    const sortedSpecs = [...specs].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    if (!searchTerm) {
      return sortedSpecs;
    }

    return sortedSpecs.filter(spec =>
      spec.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.spec_value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [specs, searchTerm]);

  return (
    <div className="w-full max-w-none">
      {/* Поиск */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Поиск характеристик..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Характеристики в виде единого блока */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Технические характеристики
            </h3>
            <span className="ml-2 bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {filteredSpecs.length}
            </span>
          </div>
        </div>

        {/* Характеристики в grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecs.map((spec) => (
              <div
                key={spec.id}
                className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      {spec.spec_name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      <span>{spec.spec_value}</span>
                      {spec.spec_unit && (
                        <span className="ml-1 text-base font-normal text-gray-500">
                          {spec.spec_unit}
                        </span>
                      )}
                    </dd>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => onSpecEdit?.(spec)}
                      className="opacity-0 group-hover:opacity-100 ml-2 text-red-600 hover:text-red-800 text-sm font-medium transition-opacity"
                    >
                      Изменить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Пустое состояние */}
      {filteredSpecs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            Характеристики не найдены
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Очистить поиск
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MotorcycleSpecs; 