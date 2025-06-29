import React, { useState } from 'react';
import { Download, Search, FileText, Folder, Calendar } from 'lucide-react';

const RegulationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockRegulations = [
    {
      id: 1,
      title: 'Инструкция по техническому обслуживанию',
      description: 'Полное руководство по обслуживанию мотоциклов VMC',
      category: 'technical',
      date: '2024-01-01',
      size: '2.5 MB',
      type: 'PDF'
    },
    {
      id: 2,
      title: 'Гарантийные обязательства',
      description: 'Условия гарантии и правила гарантийного обслуживания',
      category: 'warranty',
      date: '2024-01-01',
      size: '1.2 MB',
      type: 'PDF'
    },
    {
      id: 3,
      title: 'Правила эксплуатации',
      description: 'Основные требования по безопасной эксплуатации',
      category: 'safety',
      date: '2023-12-15',
      size: '3.1 MB',
      type: 'PDF'
    },
    {
      id: 4,
      title: 'Сертификаты соответствия',
      description: 'Документы подтверждающие соответствие стандартам',
      category: 'certificates',
      date: '2023-11-20',
      size: '5.8 MB',
      type: 'ZIP'
    }
  ];

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'technical', label: 'Техническая документация' },
    { value: 'warranty', label: 'Гарантия' },
    { value: 'safety', label: 'Безопасность' },
    { value: 'certificates', label: 'Сертификаты' }
  ];

  const filteredRegulations = mockRegulations.filter(regulation => {
    const matchesSearch = regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || regulation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Регламенты и документы <span className="text-red-600">VMC</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Нормативные документы, инструкции и правила работы с продукцией
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Поиск документов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredRegulations.map(regulation => (
            <div key={regulation.id} className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {regulation.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {regulation.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(regulation.date).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-1" />
                        {regulation.type}
                      </div>
                      <div>
                        Размер: {regulation.size}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <button className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredRegulations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Документы не найдены
            </h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulationsPage; 