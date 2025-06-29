import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Проверяем аутентификацию из localStorage
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  // Если не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Если авторизован, отображаем дочерние компоненты
  return <>{children}</>;
};

export default ProtectedRoute; 