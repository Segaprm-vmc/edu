from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Database - изменено на SQLite для разработки
    DATABASE_URL: str = "sqlite+aiosqlite:///./vmcmoto_edu.db"
    
    # Database Pool Settings (не применимо для SQLite, но оставляем для совместимости)
    POOL_SIZE: int = 10
    MAX_OVERFLOW: int = 20
    POOL_RECYCLE: int = 3600  # 1 hour
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-123456789"
    ADMIN_PASSWORD: str = "admin123"  # Простой пароль для админки
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File storage
    UPLOAD_DIR: str = "app/static/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    ALLOWED_DOCUMENT_EXTENSIONS: set = {".pdf", ".doc", ".docx", ".xls", ".xlsx"}
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # App
    PROJECT_NAME: str = "VMC Moto Education Portal"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings() 