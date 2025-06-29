import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const NewsPage: React.FC = () => {
  const mockNews = [
    {
      id: 1,
      title: 'Новая модель VMC Sport 500 уже в продаже',
      excerpt: 'Представляем новый спортивный мотоцикл с улучшенными характеристиками и современным дизайном',
      date: '2024-01-15',
      author: 'Иван Петров',
      image: '/images/news-1.jpg'
    },
    {
      id: 2,
      title: 'Обновления в сервисном обслуживании',
      excerpt: 'Новые стандарты качества и расширенная гарантия на все модели мотоциклов',
      date: '2024-01-10',
      author: 'Мария Смирнова',
      image: '/images/news-2.jpg'
    },
    {
      id: 3,
      title: 'Участие в выставке Мото-2024',
      excerpt: 'VMC примет участие в крупнейшей мотовыставке года с презентацией новых моделей',
      date: '2024-01-05',
      author: 'Алексей Волков',
      image: '/images/news-3.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Новости <span className="text-red-600">VMC</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Актуальная информация о компании, новых продуктах и событиях
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockNews.map(article => (
            <article key={article.id} className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-shadow group">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-6xl text-gray-400">📰</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(article.date).toLocaleDateString('ru-RU')}</span>
                  <span className="mx-2">•</span>
                  <User className="h-4 w-4 mr-1" />
                  <span>{article.author}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {article.excerpt}
                </p>
                
                <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
                  Читать далее
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state if no news */}
        {mockNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Новостей пока нет
            </h3>
            <p className="text-gray-500">
              Следите за обновлениями
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 