import os
import uuid
import shutil
import aiofiles
import mimetypes
from pathlib import Path
from typing import Optional, List, Tuple
from datetime import datetime
from fastapi import UploadFile, HTTPException
from PIL import Image
import asyncio

from app.core.config import settings

class FileManagerService:
    """Сервис для управления файлами"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_image_types = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
        self.allowed_document_types = {'application/pdf', 'application/msword', 
                                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
        self.allowed_video_types = {'video/mp4', 'video/mov', 'video/avi', 'video/wmv'}
        self.allowed_audio_types = {'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac'}
        
        # Создаем базовые папки
        self._create_directories()
    
    def _create_directories(self):
        """Создание необходимых директорий"""
        directories = ['uploads', 'images', 'documents', 'videos', 'audio', 'thumbnails']
        for directory in directories:
            dir_path = self.upload_dir / directory
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def _generate_filename(self, original_filename: str) -> str:
        """Генерация уникального имени файла"""
        file_extension = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{unique_id}{file_extension}"
    
    def _validate_file(self, file: UploadFile) -> Tuple[bool, str]:
        """Валидация файла"""
        if not file.filename:
            return False, "Имя файла не указано"
        
        # Получаем MIME тип
        mime_type, _ = mimetypes.guess_type(file.filename)
        if not mime_type:
            mime_type = file.content_type or 'application/octet-stream'
        
        # Проверяем разрешенные типы
        allowed_types = (
            self.allowed_image_types | 
            self.allowed_document_types | 
            self.allowed_video_types | 
            self.allowed_audio_types
        )
        
        if mime_type not in allowed_types:
            return False, f"Тип файла {mime_type} не поддерживается"
        
        return True, ""
    
    def _get_file_type(self, mime_type: str) -> str:
        """Определение типа файла"""
        if mime_type in self.allowed_image_types:
            return 'image'
        elif mime_type in self.allowed_video_types:
            return 'video'
        elif mime_type in self.allowed_audio_types:
            return 'audio'
        elif mime_type in self.allowed_document_types:
            return 'document'
        else:
            return 'unknown'
    
    async def save_uploaded_file(self, file: UploadFile, folder: str = 'uploads') -> Tuple[str, int, str]:
        """
        Сохранение загруженного файла
        Возвращает: (file_path, file_size, mime_type)
        """
        # Валидация файла
        is_valid, error_message = self._validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Получаем MIME тип
        mime_type, _ = mimetypes.guess_type(file.filename)
        if not mime_type:
            mime_type = file.content_type or 'application/octet-stream'
        
        # Генерируем уникальное имя файла
        new_filename = self._generate_filename(file.filename)
        
        # Определяем папку для сохранения
        file_type = self._get_file_type(mime_type)
        if folder == 'auto':
            folder = file_type + 's' if file_type != 'unknown' else 'uploads'
        
        # Создаем полный путь
        folder_path = self.upload_dir / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        file_path = folder_path / new_filename
        
        try:
            # Читаем и сохраняем файл
            content = await file.read()
            file_size = len(content)
            
            # Проверяем размер файла
            if file_size > self.max_file_size:
                raise HTTPException(
                    status_code=413, 
                    detail=f"Файл слишком большой. Максимальный размер: {self.max_file_size // 1024 // 1024}MB"
                )
            
            # Сохраняем файл
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            # Создаем миниатюру для изображений
            if file_type == 'image':
                await self._create_thumbnail(file_path, new_filename)
            
            return str(file_path), file_size, mime_type
            
        except Exception as e:
            # Удаляем файл в случае ошибки
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"Ошибка сохранения файла: {str(e)}")
    
    async def _create_thumbnail(self, file_path: Path, filename: str):
        """Создание миниатюры для изображения"""
        try:
            thumbnail_dir = self.upload_dir / 'thumbnails'
            thumbnail_dir.mkdir(exist_ok=True)
            thumbnail_path = thumbnail_dir / f"thumb_{filename}"
            
            # Создаем миниатюру в отдельном потоке
            await asyncio.get_event_loop().run_in_executor(
                None, self._create_thumbnail_sync, file_path, thumbnail_path
            )
        except Exception as e:
            print(f"Ошибка создания миниатюры: {e}")
    
    def _create_thumbnail_sync(self, file_path: Path, thumbnail_path: Path):
        """Синхронное создание миниатюры"""
        try:
            with Image.open(file_path) as img:
                # Конвертируем в RGB если необходимо
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Создаем миниатюру 300x300
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
        except Exception as e:
            print(f"Ошибка создания миниатюры: {e}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Удаление файла"""
        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                path.unlink()
                
                # Удаляем миниатюру если существует
                filename = path.name
                thumbnail_path = self.upload_dir / 'thumbnails' / f"thumb_{filename}"
                if thumbnail_path.exists():
                    thumbnail_path.unlink()
                
                return True
            return False
        except Exception as e:
            print(f"Ошибка удаления файла: {e}")
            return False
    
    def get_file_url(self, file_path: str, is_thumbnail: bool = False) -> str:
        """Получение URL файла"""
        # Преобразуем абсолютный путь в относительный
        path = Path(file_path)
        relative_path = path.relative_to(self.upload_dir)
        
        if is_thumbnail:
            filename = path.name
            return f"/static/uploads/thumbnails/thumb_{filename}"
        
        return f"/static/uploads/{relative_path}"
    
    def get_file_info(self, file_path: str) -> dict:
        """Получение информации о файле"""
        try:
            path = Path(file_path)
            if not path.exists():
                return {}
            
            stat = path.stat()
            mime_type, _ = mimetypes.guess_type(str(path))
            
            return {
                'size': stat.st_size,
                'created_at': datetime.fromtimestamp(stat.st_ctime),
                'modified_at': datetime.fromtimestamp(stat.st_mtime),
                'mime_type': mime_type,
                'file_type': self._get_file_type(mime_type or 'unknown')
            }
        except Exception:
            return {}
    
    async def move_file(self, old_path: str, new_folder: str, new_filename: Optional[str] = None) -> str:
        """Перемещение файла"""
        try:
            old_file_path = Path(old_path)
            if not old_file_path.exists():
                raise HTTPException(status_code=404, detail="Файл не найден")
            
            # Создаем новую папку если не существует
            new_folder_path = self.upload_dir / new_folder
            new_folder_path.mkdir(parents=True, exist_ok=True)
            
            # Определяем новое имя файла
            if new_filename:
                new_file_path = new_folder_path / new_filename
            else:
                new_file_path = new_folder_path / old_file_path.name
            
            # Перемещаем файл
            shutil.move(str(old_file_path), str(new_file_path))
            
            # Перемещаем миниатюру если существует
            old_thumbnail = self.upload_dir / 'thumbnails' / f"thumb_{old_file_path.name}"
            if old_thumbnail.exists():
                new_thumbnail = self.upload_dir / 'thumbnails' / f"thumb_{new_file_path.name}"
                shutil.move(str(old_thumbnail), str(new_thumbnail))
            
            return str(new_file_path)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка перемещения файла: {str(e)}")
    
    def get_folder_size(self, folder: str) -> int:
        """Получение размера папки в байтах"""
        try:
            folder_path = self.upload_dir / folder
            if not folder_path.exists():
                return 0
            
            total_size = 0
            for file_path in folder_path.rglob('*'):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
            
            return total_size
        except Exception:
            return 0
    
    def list_folders(self) -> List[str]:
        """Получение списка папок"""
        try:
            folders = []
            for item in self.upload_dir.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    folders.append(item.name)
            return sorted(folders)
        except Exception:
            return []
    
    async def cleanup_orphaned_files(self, existing_file_paths: List[str]):
        """Очистка файлов-сирот"""
        try:
            existing_paths = set(existing_file_paths)
            deleted_count = 0
            
            for folder in self.list_folders():
                folder_path = self.upload_dir / folder
                if folder == 'thumbnails':  # Пропускаем папку с миниатюрами
                    continue
                
                for file_path in folder_path.rglob('*'):
                    if file_path.is_file() and str(file_path) not in existing_paths:
                        await self.delete_file(str(file_path))
                        deleted_count += 1
            
            return deleted_count
        except Exception as e:
            print(f"Ошибка очистки файлов-сирот: {e}")
            return 0

# Экземпляр сервиса
file_manager_service = FileManagerService()

# Функции для обратной совместимости
async def save_uploaded_file(file: UploadFile, folder: str = 'uploads') -> str:
    """Сохранение загруженного файла (обратная совместимость)"""
    file_path, _, _ = await file_manager_service.save_uploaded_file(file, folder)
    return file_path

async def delete_file(file_path: str) -> bool:
    """Удаление файла (обратная совместимость)"""
    return await file_manager_service.delete_file(file_path)

def optimize_image(file_path: str, max_size: tuple = (1920, 1080), quality: int = 85):
    """
    Оптимизация изображения: изменение размера и сжатие
    
    Args:
        file_path: Путь к изображению
        max_size: Максимальный размер (ширина, высота)
        quality: Качество сжатия (1-100)
    """
    try:
        with Image.open(file_path) as img:
            # Конвертируем в RGB если RGBA
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Изменяем размер если изображение больше максимального
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Сохраняем с оптимизацией
            img.save(file_path, format='JPEG', quality=quality, optimize=True)
            
    except Exception as e:
        print(f"Ошибка оптимизации изображения {file_path}: {e}")

def get_file_info(file_path: str) -> Optional[dict]:
    """
    Получение информации о файле
    
    Args:
        file_path: Относительный путь к файлу от папки uploads
    
    Returns:
        Словарь с информацией о файле или None
    """
    try:
        full_path = os.path.join(settings.UPLOAD_DIR, file_path)
        if os.path.exists(full_path):
            stat = os.stat(full_path)
            return {
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
                "exists": True
            }
        return {"exists": False}
    except Exception as e:
        print(f"Ошибка получения информации о файле {file_path}: {e}")
        return None

def ensure_upload_directories():
    """Создание необходимых директорий для загрузки файлов"""
    categories = ["models", "news", "employees", "regulations", "documents"]
    file_types = ["image", "document"]
    
    for category in categories:
        for file_type in file_types:
            path = os.path.join(settings.UPLOAD_DIR, category, file_type)
            os.makedirs(path, exist_ok=True)

def get_file_url(file_path: Optional[str]) -> Optional[str]:
    """Получение URL файла"""
    if not file_path:
        return None
    return f"/static/uploads/{file_path}"

def validate_file_size(file_size: int) -> bool:
    """Проверка размера файла"""
    return file_size <= settings.MAX_FILE_SIZE

def validate_image_extension(filename: str) -> bool:
    """Проверка расширения изображения"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in settings.ALLOWED_IMAGE_EXTENSIONS

def validate_document_extension(filename: str) -> bool:
    """Проверка расширения документа"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in settings.ALLOWED_DOCUMENT_EXTENSIONS

def validate_image_file(file: UploadFile) -> bool:
    """Проверка, является ли файл изображением"""
    if not file.filename:
        return False
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    return file_extension in settings.ALLOWED_IMAGE_EXTENSIONS

def validate_document_file(file: UploadFile) -> bool:
    """Проверка, является ли файл документом"""
    if not file.filename:
        return False
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    return file_extension in settings.ALLOWED_DOCUMENT_EXTENSIONS

async def save_multiple_files(files: list[UploadFile], subfolder: str = "") -> list[str]:
    """Сохранение нескольких файлов"""
    saved_files = []
    
    for file in files:
        try:
            file_path = await save_uploaded_file(file, subfolder)
            saved_files.append(file_path)
        except Exception as e:
            # Удаляем уже сохраненные файлы в случае ошибки
            for saved_file in saved_files:
                delete_file(saved_file)
            raise e
    
    return saved_files

def get_file_size(file_path: str) -> Optional[int]:
    """Получение размера файла"""
    if not file_path:
        return None
    
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    
    try:
        if os.path.exists(full_path):
            return os.path.getsize(full_path)
    except Exception:
        pass
    
    return None

def cleanup_temp_files():
    """Очистка временных файлов"""
    # Можно реализовать логику очистки старых неиспользуемых файлов
    pass 