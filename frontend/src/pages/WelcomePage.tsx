import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Users, FileText, Trophy, Clock, Star } from 'lucide-react';

export default function WelcomePage() {
  const stats = [
    {
      label: 'Моделей мотоциклов',
      value: '5',
      icon: Bike,
      color: 'bg-blue-500',
    },
    {
      label: 'Новостей',
      value: '12',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Сотрудников',
      value: '25',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Лет опыта',
      value: '15',
      icon: Trophy,
      color: 'bg-yellow-500',
    },
  ];

  const quickActions = [
    {
      title: 'Изучить модели',
      description: 'Просмотр каталога мотоциклов VMC',
      link: '/models/vmc-sport-450',
      icon: '🏍️',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
    },
    {
      title: 'Последние новости',
      description: 'Узнать о новых поступлениях',
      link: '/news',
      icon: '📰',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      title: 'Контакты команды',
      description: 'Связаться с коллегами',
      link: '/employees',
      icon: '👥',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            VMC
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Добро пожаловать в VMC Moto
            </h1>
            <p className="text-xl text-gray-600">
              Образовательный портал для менеджеров по продажам
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">
              {new Date().toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <p className="text-red-100">
            Готовы изучать новые мотоциклы и совершенствовать навыки продаж?
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Быстрые действия */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Star className="h-6 w-6 text-yellow-500 mr-2" />
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`block p-6 rounded-xl border-2 transition-all duration-200 ${action.color}`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{action.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Информационные блоки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* О компании */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">О VMC Moto</h3>
          <p className="text-gray-600 mb-4">
            VMC Moto - ведущий производитель мотоциклов с более чем 15-летним опытом. 
            Мы специализируемся на создании высококачественных мотоциклов для различных целей.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Спортивные мотоциклы для гонок
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Туристические модели для дальних поездок
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Городские мотоциклы для ежедневного использования
            </li>
          </ul>
        </div>

        {/* Советы для менеджеров */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            💡 Советы для эффективных продаж
          </h3>
          <ul className="space-y-3 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">1.</span>
              Изучите технические характеристики каждой модели
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">2.</span>
              Определите потребности клиента перед рекомендацией
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">3.</span>
              Используйте продажные скрипты из раздела моделей
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">4.</span>
              Подчеркивайте уникальные особенности VMC
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 