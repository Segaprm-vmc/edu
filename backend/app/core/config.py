from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Database - изменено на SQLite для разработки
    DATABASE_URL: str = "sqlite+aiosqlite:///./moto_education.db"
    
    # Database Pool Settings (не применимо для SQLite, но оставляем для совместимости)
    POOL_SIZE: int = 10
    MAX_OVERFLOW: int = 20
    POOL_RECYCLE: int = 3600  # 1 hour
    
    # Security
    SECRET_KEY: str = "supersecret"
    ADMIN_PASSWORD: str = "admin123"  # Простой пароль для админки
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File storage
    UPLOAD_DIR: str = "app/static/uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    ALLOWED_DOCUMENT_EXTENSIONS: set = {".pdf", ".doc", ".docx", ".xls", ".xlsx"}
    ALLOWED_VIDEO_EXTENSIONS: set = {".mp4", ".mov", ".avi", ".wmv", ".mkv"}
    ALLOWED_AUDIO_EXTENSIONS: set = {".mp3", ".wav", ".flac", ".aac", ".ogg"}
    
    # File Manager Settings
    THUMBNAIL_SIZE: tuple = (300, 300)
    THUMBNAIL_QUALITY: int = 85
    IMAGE_OPTIMIZATION_QUALITY: int = 85
    MAX_THUMBNAIL_SIZE: int = 500 * 1024  # 500KB for thumbnails
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # Для продакшена заменить на свой домен
    
    # App
    PROJECT_NAME: str = "VMC Moto Education Portal"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    API_V1_STR: str = "/api"
    
    class Config:
        env_file = ".env"

settings = Settings() 