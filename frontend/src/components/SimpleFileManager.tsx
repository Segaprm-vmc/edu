import React, { useState, useEffect } from 'react';
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Download,
  Search,
  Grid,
  List,
  Check,
  X,
  Plus
} from 'lucide-react';

interface FileItem {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  folder: string;
  created_at: string;
  uploaded_by_user?: {
    username: string;
    full_name?: string;
  };
}

const SimpleFileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Mock данные
      const mockFiles: FileItem[] = [
        {
          id: 1,
          filename: 'bike_1.jpg',
          original_filename: 'VMC_Sport_650_Front.jpg',
          file_size: 2048576,
          file_type: 'image',
          folder: 'images',
          created_at: '2024-01-15T10:30:00Z',
          uploaded_by_user: { username: 'admin', full_name: 'Администратор' }
        },
        {
          id: 2,
          filename: 'manual.pdf',
          original_filename: 'VMC_User_Manual.pdf',
          file_size: 5242880,
          file_type: 'document',
          folder: 'documents',
          created_at: '2024-01-14T15:20:00Z',
          uploaded_by_user: { username: 'admin', full_name: 'Администратор' }
        }
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    switch (type) {
      case 'image': return <Image className={`${iconClass} text-green-600`} />;
      case 'video': return <Video className={`${iconClass} text-purple-600`} />;
      case 'audio': return <Music className={`${iconClass} text-yellow-600`} />;
      case 'document': return <FileText className={`${iconClass} text-blue-600`} />;
      default: return <File className={`${iconClass} text-gray-600`} />;
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

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (confirm(`Удалить ${selectedFiles.size} файлов?`)) {
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
    }
  };

  const filteredFiles = files.filter(file => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return file.original_filename.toLowerCase().includes(query);
    }
    return true;
  });

  const FileCard: React.FC<{ file: FileItem }> = ({ file }) => (
    <div 
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        selectedFiles.has(file.id) ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
      }`}
      onClick={() => handleFileSelect(file)}
    >
      {/* Чекбокс */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          selectedFiles.has(file.id) ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
        }`}>
          {selectedFiles.has(file.id) && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Превью */}
      <div className="aspect-square p-4 flex items-center justify-center relative">
        {file.file_type === 'image' ? (
          <img 
            src={`/uploads/${file.folder}/${file.filename}`} 
            alt={file.original_filename}
            className="max-w-full max-h-full object-contain rounded"
          />
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon(file.file_type)}
            <span className="text-xs text-gray-500">
              {file.filename.split('.').pop()?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {file.original_filename}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{formatFileSize(file.file_size)}</span>
          <span className="text-xs text-gray-500">
            {new Date(file.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  );

  const UploadZone: React.FC = () => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <div>
        <p className="text-lg font-medium text-gray-900">Перетащите файлы сюда</p>
        <p className="text-sm text-gray-500 mt-1">
          или <span className="text-red-600 font-medium">выберите файлы</span> для загрузки
        </p>
      </div>
      <input
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          // Здесь будет логика загрузки
          console.log('Файлы выбраны:', e.target.files);
          setShowUpload(false);
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
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
          <p className="text-gray-600">Управление файлами и медиа</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>Загрузить</span>
        </button>
      </div>

      {/* Зона загрузки */}
      {showUpload && (
        <div className="mb-6 p-6 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Загрузка файлов</h2>
            <button onClick={() => setShowUpload(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <UploadZone />
        </div>
      )}

      {/* Панель управления */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Поиск */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск файлов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Режим просмотра */}
          <div className="flex items-center space-x-4">
            {selectedFiles.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Выбрано: {selectedFiles.size}</span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Удалить</span>
                </button>
              </div>
            )}
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Список файлов */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Файлы не найдены</h3>
          <p className="text-gray-600">Загрузите первые файлы</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-2'
        }>
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleFileManager; 