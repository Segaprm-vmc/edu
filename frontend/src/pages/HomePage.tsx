import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Settings, Users, FileText, Wrench } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                <span className="text-red-600">VMC</span> motomy
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 mt-4">
                Образовательный портал
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Полная база знаний о мотоциклах VMC для менеджеров. 
                Технические характеристики, новости, регламенты и все необходимое для работы.
              </p>
            </div>
            
            <div className="mt-10">
              {/* Navigation Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/models"
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-medium hover:shadow-hard transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-600 ring-4 ring-white">
                      <Wrench className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Модели мотоциклов
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      60-70 моделей с подробными техническими характеристиками, 
                      фотографиями и видео материалами
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </Link>

                <Link
                  to="/news"
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-medium hover:shadow-hard transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                      <FileText className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Новости
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Актуальная информация о новых продуктах, обновлениях 
                      и событиях компании
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </Link>

                <Link
                  to="/regulations"
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-medium hover:shadow-hard transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                      <BookOpen className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Регламенты
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Нормативные документы, инструкции и правила 
                      работы с продукцией
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </Link>

                <Link
                  to="/employees"
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-medium hover:shadow-hard transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                      <Users className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Сотрудники
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Контакты и информация о сотрудниках компании, 
                      их специализации и обязанности
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </Link>

                <Link
                  to="/admin"
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-medium hover:shadow-hard transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-600 ring-4 ring-white">
                      <Settings className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Административная панель
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Управление контентом, загрузка файлов, 
                      редактирование информации
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Возможности портала
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Все необходимые инструменты для эффективной работы менеджера
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  База знаний
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Полная информация о всех моделях мотоциклов
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Документооборот
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Загрузка и хранение документов и регламентов
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Команда
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Контакты сотрудников и их специализации
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Технические данные
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Подробные характеристики и спецификации
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 