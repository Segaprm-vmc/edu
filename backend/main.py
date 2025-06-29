from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import os
import logging
import sys

from app.core.config import settings
from app.db.database import sessionmanager, create_tables
from app.api import public, admin

# Настройка логирования
logging.basicConfig(
    stream=sys.stdout, 
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения.
    Инициализация БД при запуске, закрытие соединений при завершении.
    """
    logger.info("Starting application...")
    
    # Инициализация БД
    sessionmanager.init_db()
    
    # Создание таблиц (в продакшене лучше использовать Alembic)
    if settings.DEBUG:
        try:
            await create_tables()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
    
    logger.info("Application startup complete")
    
    yield
    
    # Cleanup при завершении
    logger.info("Shutting down application...")
    await sessionmanager.close()
    logger.info("Application shutdown complete")

# Создание приложения FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Подключение статических файлов
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount(
    "/static", 
    StaticFiles(directory=settings.UPLOAD_DIR), 
    name="static"
)

# Корневой эндпоинт
@app.get("/", response_class=HTMLResponse)
async def root():
    """Приветственная страница с описанием портала"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>VMC Moto Education Portal</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .link { color: #007bff; text-decoration: none; }
            .link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>VMC Moto Education Portal</h1>
            <p>Образовательный портал для менеджеров VMC Moto</p>
        </div>
        
        <div class="section">
            <h2>О портале</h2>
            <p>Добро пожаловать в образовательный портал VMC Moto! Здесь вы найдете:</p>
            <ul>
                <li>Подробную информацию о моделях мотоциклов</li>
                <li>Технические характеристики и фотографии</li>
                <li>Новости и регламенты</li>
                <li>Контакты сотрудников</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>Навигация</h2>
            <ul>
                <li><a href="/api/docs" class="link">API Документация</a></li>
                <li><a href="/api/models" class="link">Модели мотоциклов</a></li>
                <li><a href="/api/news" class="link">Новости</a></li>
                <li><a href="/api/regulations" class="link">Регламенты</a></li>
                <li><a href="/api/employees" class="link">Сотрудники</a></li>
            </ul>
        </div>
    </body>
    </html>
    """

# Подключение роутеров
app.include_router(public.router, prefix="/api", tags=["public"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Health check
@app.get("/health")
async def health_check():
    """Проверка состояния приложения"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    ) 