import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Edit,
  Download,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  FolderPlus,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  Calendar,
  User,
  HardDrive,
  Tag
} from 'lucide-react';

// Интерфейсы
interface FileItem {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  alt_text?: string;
  description?: string;
  tags: string[];
  folder: string;
  is_public: boolean;
  uploaded_by?: number;
  created_at: string;
  uploaded_by_user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// Компонент превью файла
const FilePreview: React.FC<{ file: FileItem; onSelect: (file: FileItem) => void; isSelected: boolean }> = ({ 
  file, 
  onSelect, 
  isSelected 
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, mimeType?: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-green-600" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-600" />;
      case 'audio':
        return <Music className="w-8 h-8 text-yellow-600" />;
      case 'document':
        return <FileText className="w-8 h-8 text-blue-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getPreviewUrl = () => {
    if (file.file_type === 'image') {
      return `/uploads/${file.folder}/${file.filename}`;
    }
    return null;
  };

  return (
    <div 
      className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(file)}
    >
      {/* Чекбокс для выбора */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Меню действий */}
      <div className="absolute top-2 right-2 z-10">
        <button className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Превью файла */}
      <div className="aspect-square p-4 flex items-center justify-center">
        {getPreviewUrl() ? (
          <img 
            src={getPreviewUrl()} 
            alt={file.alt_text || file.filename}
            className="max-w-full max-h-full object-contain rounded"
          />
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon(file.file_type, file.mime_type)}
            <span className="text-xs text-gray-500 text-center truncate max-w-full">
              {file.filename.split('.').pop()?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Информация о файле */}
      <div className="p-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={file.original_filename}>
          {file.original_filename}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{formatFileSize(file.file_size)}</span>
          <span className="text-xs text-gray-500">
            {new Date(file.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
        
        {/* Теги */}
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {file.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {file.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{file.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Автор загрузки */}
        {file.uploaded_by_user && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            {file.uploaded_by_user.full_name || file.uploaded_by_user.username}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент загрузки файлов
const FileUploadZone: React.FC<{ onFilesUploaded: () => void }> = ({ onFilesUploaded }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [folder, setFolder] = useState('uploads');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    // Симуляция загрузки (в реальном приложении здесь будет API вызов)
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const uploadIndex = uploadProgress.length + i;
      
      try {
        // Симуляция прогресса загрузки
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => 
            prev.map((upload, index) => 
              index === uploadIndex ? { ...upload, progress } : upload
            )
          );
        }

        // Успешная загрузка
        setUploadProgress(prev => 
          prev.map((upload, index) => 
            index === uploadIndex ? { ...upload, status: 'success' } : upload
          )
        );
      } catch (error) {
        // Ошибка загрузки
        setUploadProgress(prev => 
          prev.map((upload, index) => 
            index === uploadIndex ? { 
              ...upload, 
              status: 'error', 
              error: 'Ошибка загрузки файла' 
            } : upload
          )
        );
      }
    }

    // Очистка прогресса через 3 секунды
    setTimeout(() => {
      setUploadProgress([]);
      onFilesUploaded();
    }, 3000);
  }, [uploadProgress.length, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
      'audio/*': ['.mp3', '.wav', '.flac'],
      'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
    },
    multiple: true
  });

  return (
    <div className="space-y-4">
      {/* Выбор папки */}
      <div className="flex items-center space-x-4">
        <label className="block text-sm font-medium text-gray-700">
          Папка для загрузки:
        </label>
        <select 
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="block border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="uploads">uploads</option>
          <option value="images">images</option>
          <option value="documents">documents</option>
          <option value="videos">videos</option>
        </select>
      </div>

      {/* Зона загрузки */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <Upload className={`w-12 h-12 mx-auto ${
            isDragActive ? 'text-red-500' : 'text-gray-400'
          }`} />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Отпустите файлы для загрузки' : 'Перетащите файлы сюда'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              или <span className="text-red-600 font-medium">выберите файлы</span> для загрузки
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Поддерживаются: изображения, видео, аудио, документы
            </p>
          </div>
        </div>
      </div>

      {/* Прогресс загрузки */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Загрузка файлов:</h4>
          {uploadProgress.map((upload, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {upload.status === 'uploading' && `${upload.progress}%`}
                    {upload.status === 'success' && <Check className="w-4 h-4 text-green-600" />}
                    {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      upload.status === 'success' ? 'bg-green-500' :
                      upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
                {upload.error && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Основной компонент файлового менеджера
const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadZone, setShowUploadZone] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Здесь будет API вызов
      // const response = await fetch('/api/admin/files');
      // const data = await response.json();
      
      // Mock данные
      const mockFiles: FileItem[] = [
        {
          id: 1,
          filename: 'bike_1.jpg',
          original_filename: 'VMC_Sport_650_Front.jpg',
          file_path: '/uploads/images/bike_1.jpg',
          file_size: 2048576,
          mime_type: 'image/jpeg',
          file_type: 'image',
          alt_text: 'VMC Sport 650 - вид спереди',
          description: 'Фотография мотоцикла VMC Sport 650',
          tags: ['мотоцикл', 'спорт', 'VMC'],
          folder: 'images',
          is_public: true,
          uploaded_by: 1,
          created_at: '2024-01-15T10:30:00Z',
          uploaded_by_user: {
            id: 1,
            username: 'admin',
            full_name: 'Администратор'
          }
        },
        {
          id: 2,
          filename: 'manual.pdf',
          original_filename: 'VMC_User_Manual.pdf',
          file_path: '/uploads/documents/manual.pdf',
          file_size: 5242880,
          mime_type: 'application/pdf',
          file_type: 'document',
          description: 'Руководство пользователя VMC',
          tags: ['документация', 'руководство'],
          folder: 'documents',
          is_public: false,
          uploaded_by: 1,
          created_at: '2024-01-14T15:20:00Z',
          uploaded_by_user: {
            id: 1,
            username: 'admin',
            full_name: 'Администратор'
          }
        }
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: FileItem) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (confirm(`Удалить ${selectedFiles.size} файлов?`)) {
      // Здесь будет API вызов для удаления
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
    }
  };

  // Фильтрация и сортировка файлов
  const filteredFiles = files
    .filter(file => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return file.original_filename.toLowerCase().includes(query) ||
               file.tags.some(tag => tag.toLowerCase().includes(query)) ||
               (file.description && file.description.toLowerCase().includes(query));
      }
      return true;
    })
    .filter(file => {
      if (filterType === 'all') return true;
      return file.file_type === filterType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.original_filename.toLowerCase();
          bValue = b.original_filename.toLowerCase();
          break;
        case 'size':
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Файловый менеджер</h1>
          <p className="text-gray-600">Управление файлами и медиа контентом</p>
        </div>
        <button
          onClick={() => setShowUploadZone(!showUploadZone)}
          className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
        >
          <Upload className="w-4 h-4" />
          <span>Загрузить файлы</span>
        </button>
      </div>

      {/* Зона загрузки */}
      {showUploadZone && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Загрузка файлов</h2>
            <button
              onClick={() => setShowUploadZone(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FileUploadZone onFilesUploaded={fetchFiles} />
        </div>
      )}

      {/* Панель управления */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Поиск */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Фильтры */}
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Все типы</option>
              <option value="image">Изображения</option>
              <option value="document">Документы</option>
              <option value="video">Видео</option>
              <option value="audio">Аудио</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'date' | 'size');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="date-desc">Дата ↓</option>
              <option value="date-asc">Дата ↑</option>
              <option value="name-asc">Имя ↑</option>
              <option value="name-desc">Имя ↓</option>
              <option value="size-desc">Размер ↓</option>
              <option value="size-asc">Размер ↑</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Массовые действия */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Выбрано: {selectedFiles.size} файлов
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {selectedFiles.size === filteredFiles.length ? 'Снять выделение' : 'Выбрать все'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1 bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3" />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Список файлов */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Файлы не найдены</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Загрузите первые файлы'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-2'
        }>
          {filteredFiles.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onSelect={handleFileSelect}
              isSelected={selectedFiles.has(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileManager; 