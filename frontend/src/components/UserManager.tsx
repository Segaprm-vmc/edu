import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  Settings
} from 'lucide-react';

// Интерфейсы
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role_id: number;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  failed_login_attempts: number;
  created_at: string;
  role?: Role;
}

interface UserForm {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role_id: number;
  is_active: boolean;
  is_verified: boolean;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: 0,
    is_active: true,
    is_verified: false
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock данные
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@vmcmoto.ru',
          full_name: 'Главный администратор',
          role_id: 1,
          is_active: true,
          is_verified: true,
          last_login: '2024-01-15T10:30:00Z',
          failed_login_attempts: 0,
          created_at: '2024-01-01T00:00:00Z',
          role: {
            id: 1,
            name: 'admin',
            description: 'Полный доступ к системе',
            permissions: ['admin', 'manage_users', 'manage_models', 'manage_files'],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: 2,
          username: 'moderator',
          email: 'moderator@vmcmoto.ru',
          full_name: 'Модератор контента',
          role_id: 2,
          is_active: true,
          is_verified: true,
          last_login: '2024-01-14T15:20:00Z',
          failed_login_attempts: 0,
          created_at: '2024-01-05T00:00:00Z',
          role: {
            id: 2,
            name: 'moderator',
            description: 'Модерация контента',
            permissions: ['manage_models', 'manage_files', 'moderate_content'],
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Mock данные ролей
      const mockRoles: Role[] = [
        {
          id: 1,
          name: 'admin',
          description: 'Полный доступ к системе',
          permissions: ['admin', 'manage_users', 'manage_models', 'manage_files'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'moderator',
          description: 'Модерация контента',
          permissions: ['manage_models', 'manage_files', 'moderate_content'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'editor',
          description: 'Редактирование контента',
          permissions: ['edit_content', 'manage_models'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      setRoles(mockRoles);
    } catch (error) {
      console.error('Ошибка загрузки ролей:', error);
    }
  };

  const handleUserSelect = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;

    switch (action) {
      case 'activate':
        // Активация пользователей
        setUsers(prev => prev.map(user => 
          selectedUsers.has(user.id) ? { ...user, is_active: true } : user
        ));
        break;
      case 'deactivate':
        // Деактивация пользователей
        setUsers(prev => prev.map(user => 
          selectedUsers.has(user.id) ? { ...user, is_active: false } : user
        ));
        break;
      case 'verify':
        // Верификация пользователей
        setUsers(prev => prev.map(user => 
          selectedUsers.has(user.id) ? { ...user, is_verified: true } : user
        ));
        break;
      case 'delete':
        if (confirm(`Удалить ${selectedUsers.size} пользователей?`)) {
          setUsers(prev => prev.filter(user => !selectedUsers.has(user.id)));
        }
        break;
    }
    setSelectedUsers(new Set());
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role_id: roles[0]?.id || 0,
      is_active: true,
      is_verified: false
    });
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role_id: user.role_id,
      is_active: user.is_active,
      is_verified: user.is_verified
    });
    setShowUserForm(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Обновление пользователя
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { 
                ...user, 
                ...userForm,
                role: roles.find(r => r.id === userForm.role_id)
              } 
            : user
        ));
      } else {
        // Создание нового пользователя
        const newUser: User = {
          id: Date.now(),
          ...userForm,
          failed_login_attempts: 0,
          created_at: new Date().toISOString(),
          role: roles.find(r => r.id === userForm.role_id)
        };
        setUsers(prev => [...prev, newUser]);
      }
      setShowUserForm(false);
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (user: User) => {
    if (!user.is_active) {
      return <UserX className="w-4 h-4 text-red-500" />;
    } else if (!user.is_verified) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <UserCheck className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.username.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query) &&
        !(user.full_name && user.full_name.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Фильтр по роли
    if (filterRole && user.role_id !== filterRole) {
      return false;
    }

    // Фильтр по статусу
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;
    if (filterStatus === 'verified' && !user.is_verified) return false;
    if (filterStatus === 'unverified' && user.is_verified) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-gray-600">Пользователи, роли и права доступа</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить пользователя</span>
        </button>
      </div>

      {/* Панель фильтрации */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Фильтр по роли */}
          <select
            value={filterRole || ''}
            onChange={(e) => setFilterRole(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Все роли</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>

          {/* Фильтр по статусу */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="verified">Верифицированные</option>
            <option value="unverified">Неверифицированные</option>
          </select>

          {/* Массовые действия */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-600">
                Выбрано: {selectedUsers.size}
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Активировать
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Деактивировать
              </button>
              <button
                onClick={() => handleBulkAction('verify')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Верифицировать
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={() => {
                      if (selectedUsers.size === filteredUsers.length) {
                        setSelectedUsers(new Set());
                      } else {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Последний вход
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role.name)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(user)}
                      <span className="text-sm text-gray-900">
                        {!user.is_active ? 'Неактивен' : 
                         !user.is_verified ? 'Не верифицирован' : 'Активен'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleString('ru-RU')
                      : 'Никогда'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-red-600 hover:text-red-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Удалить пользователя?')) {
                          setUsers(prev => prev.filter(u => u.id !== user.id));
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Форма создания/редактирования пользователя */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
            </h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Полное имя
                </label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль
                </label>
                <select
                  value={userForm.role_id}
                  onChange={(e) => setUserForm({...userForm, role_id: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({...userForm, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Активен</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userForm.is_verified}
                    onChange={(e) => setUserForm({...userForm, is_verified: e.target.checked})}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Верифицирован</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
                >
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager; 