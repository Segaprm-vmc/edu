import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  Star, 
  Trash2, 
  Move, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { ModelPhoto } from '../services/api';

interface PhotoManagerProps {
  photos: ModelPhoto[];
  onPhotosChange: (photos: ModelPhoto[]) => void;
  onUploadPhoto: (file: File) => Promise<void>;
  onDeletePhoto: (photoId: number) => Promise<void>;
  onSetPrimary: (photoId: number) => Promise<void>;
  onReorderPhotos: (photoIds: number[]) => Promise<void>;
  isLoading?: boolean;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onPhotosChange,
  onUploadPhoto,
  onDeletePhoto,
  onSetPrimary,
  onReorderPhotos,
  isLoading = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка загрузки файлов
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
          alert(`Файл ${file.name} не является изображением`);
          continue;
        }

        // Проверка размера (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой (максимум 10MB)`);
          continue;
        }

        await onUploadPhoto(file);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке фотографий');
    } finally {
      setUploading(false);
    }
  }, [onUploadPhoto]);

  // Drag and Drop для загрузки
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Drag and Drop для изменения порядка
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverReorder = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropReorder = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Удаляем перетаскиваемый элемент
    newPhotos.splice(draggedIndex, 1);
    
    // Вставляем в новую позицию
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    // Обновляем локальное состояние
    onPhotosChange(newPhotos);
    
    // Отправляем новый порядок на сервер
    try {
      await onReorderPhotos(newPhotos.map(photo => photo.id));
    } catch (error) {
      console.error('Ошибка изменения порядка:', error);
      // Возвращаем старый порядок в случае ошибки
      onPhotosChange(photos);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await onSetPrimary(photoId);
    } catch (error) {
      console.error('Ошибка установки основной фотографии:', error);
      alert('Ошибка при установке основной фотографии');
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту фотографию?')) {
      return;
    }

    try {
      await onDeletePhoto(photoId);
    } catch (error) {
      console.error('Ошибка удаления фотографии:', error);
      alert('Ошибка при удалении фотографии');
    }
  };

  const getPhotoUrl = (photo: ModelPhoto) => {
    return `/static/uploads/${photo.file_path}`;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Фотографии модели ({photos.length})
        </h3>
      </div>

      {/* Зона загрузки */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || isLoading}
        />
        
        <div className="space-y-2">
          <Upload className={`mx-auto h-10 w-10 ${uploading ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Загрузка...' : 'Перетащите фотографии сюда или нажмите для выбора'}
            </p>
            <p className="text-xs text-gray-500">
              Поддерживаются JPG, PNG, WebP до 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Сетка фотографий */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative group bg-white rounded-lg border-2 transition-all ${
                dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              } ${photo.is_primary ? 'ring-2 ring-yellow-400' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverReorder(e, index)}
              onDrop={(e) => handleDropReorder(e, index)}
            >
              {/* Основное изображение */}
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={getPhotoUrl(photo)}
                  alt={photo.original_filename || 'Фото модели'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Бейдж основной фотографии */}
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Основная</span>
                  </div>
                )}

                {/* Индикатор перетаскивания */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black bg-opacity-50 text-white p-1 rounded">
                    <Move className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Информация и действия */}
              <div className="p-3 space-y-2">
                <div className="text-xs text-gray-500 truncate">
                  {photo.original_filename}
                </div>
                
                {/* Действия */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSetPrimary(photo.id)}
                    disabled={photo.is_primary}
                    className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
                      photo.is_primary
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>{photo.is_primary ? 'Основная' : 'Сделать основной'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {photos.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет фотографий</h3>
          <p className="text-gray-500 mb-4">
            Загрузите первые фотографии для этой модели
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Загрузить фотографии
          </button>
        </div>
      )}

      {/* Подсказка */}
      {photos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Как управлять фотографиями:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Перетаскивайте фотографии для изменения порядка отображения</li>
                <li>Нажмите "Сделать основной" чтобы установить главную фотографию</li>
                <li>Основная фотография будет отображаться в карточке модели</li>
                <li>Поддерживаются форматы: JPG, PNG, WebP</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoManager; 