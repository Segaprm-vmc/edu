import React, { useState } from 'react';
import { Search, Mail, Phone, User, MapPin, Briefcase } from 'lucide-react';

const EmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const mockEmployees = [
    {
      id: 1,
      name: 'Иванов Иван Иванович',
      position: 'Главный инженер',
      department: 'engineering',
      email: 'ivanov@vmcmoto.ru',
      phone: '+7 (495) 123-45-67',
      location: 'Москва',
      specialization: 'Техническая поддержка, разработка новых моделей',
      avatar: '/images/avatars/ivanov.jpg'
    },
    {
      id: 2,
      name: 'Петрова Анна Сергеевна',
      position: 'Менеджер по продажам',
      department: 'sales',
      email: 'petrova@vmcmoto.ru',
      phone: '+7 (495) 123-45-68',
      location: 'Санкт-Петербург',
      specialization: 'Продажи, работа с клиентами, консультации',
      avatar: '/images/avatars/petrova.jpg'
    },
    {
      id: 3,
      name: 'Смирнов Алексей Владимирович',
      position: 'Начальник сервисного центра',
      department: 'service',
      email: 'smirnov@vmcmoto.ru',
      phone: '+7 (495) 123-45-69',
      location: 'Екатеринбург',
      specialization: 'Техническое обслуживание, ремонт, диагностика',
      avatar: '/images/avatars/smirnov.jpg'
    },
    {
      id: 4,
      name: 'Козлова Мария Андреевна',
      position: 'Специалист по маркетингу',
      department: 'marketing',
      email: 'kozlova@vmcmoto.ru',
      phone: '+7 (495) 123-45-70',
      location: 'Новосибирск',
      specialization: 'Маркетинговые исследования, реклама, PR',
      avatar: '/images/avatars/kozlova.jpg'
    }
  ];

  const departments = [
    { value: 'all', label: 'Все отделы' },
    { value: 'engineering', label: 'Инженерный отдел' },
    { value: 'sales', label: 'Отдел продаж' },
    { value: 'service', label: 'Сервисный центр' },
    { value: 'marketing', label: 'Отдел маркетинга' }
  ];

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Сотрудники <span className="text-red-600">VMC</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Контакты и информация о сотрудниках компании
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
                  placeholder="Поиск по имени, должности или специализации..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="lg:w-64">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow">
              {/* Avatar */}
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {employee.position}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <a 
                    href={`mailto:${employee.email}`}
                    className="hover:text-red-600 transition-colors"
                  >
                    {employee.email}
                  </a>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <a 
                    href={`tel:${employee.phone}`}
                    className="hover:text-red-600 transition-colors"
                  >
                    {employee.phone}
                  </a>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{employee.location}</span>
                </div>
              </div>

              {/* Specialization */}
              <div className="border-t pt-4">
                <div className="flex items-start">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Специализация:
                    </p>
                    <p className="text-sm text-gray-600">
                      {employee.specialization}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Сотрудники не найдены
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

export default EmployeesPage; 