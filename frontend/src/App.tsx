import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';

// Импорт страниц
import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import NewsPage from './pages/NewsPage';
import RegulationsPage from './pages/RegulationsPage';
import EmployeesPage from './pages/EmployeesPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SidebarDemoPage from './pages/SidebarDemoPage';
import ProtectedRoute from './components/ProtectedRoute';

// Loading компонент
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
      <p className="text-white text-lg">Загрузка VMC Portal...</p>
    </div>
  </div>
);

// Error Boundary для отладки
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Произошла ошибка</h1>
            <p className="mb-4">Проверьте консоль для подробностей</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Страница входа администратора без MainLayout */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Защищённая админ панель без MainLayout */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Демонстрационная страница сайдбара */}
            <Route path="/sidebar-demo" element={<SidebarDemoPage />} />
            
            {/* Обычные страницы с MainLayout */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<ModelsPage />} />
                  <Route path="/models" element={<ModelsPage />} />
                  <Route path="/models/:id" element={<ModelDetailPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/regulations" element={<RegulationsPage />} />
                  <Route path="/employees" element={<EmployeesPage />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 