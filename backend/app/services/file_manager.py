import os
import uuid
import shutil
import aiofiles
from fastapi import UploadFile, HTTPException
from typing import Optional
from PIL import Image
from app.core.config import settings

async def save_uploaded_file(file: UploadFile, subfolder: str = "") -> str:
    """Сохранение загруженного файла"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Имя файла не может быть пустым")
    
    # Проверка размера файла
    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"Размер файла превышает максимально допустимый ({settings.MAX_FILE_SIZE} байт)"
        )
    
    # Проверка расширения файла
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.ALLOWED_IMAGE_EXTENSIONS and file_extension not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимое расширение файла: {file_extension}"
        )
    
    # Создание уникального имени файла
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Создание пути для сохранения
    upload_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Сохранение файла
    try:
        async with aiofiles.open(file_path, 'wb') as buffer:
            await buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения файла: {str(e)}")
    
    # Возвращаем относительный путь
    return os.path.join(subfolder, unique_filename).replace(os.sep, '/')

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

def delete_file(file_path: str) -> bool:
    """Удаление файла"""
    if not file_path:
        return True
    
    full_path = os.path.join(settings.UPLOAD_DIR, file_path)
    
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
        return True
    except Exception as e:
        print(f"Ошибка удаления файла {full_path}: {str(e)}")
        return False

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