from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request, Query, Body, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, update, delete, func, desc
from typing import List, Optional
import os
import uuid
import shutil
import pandas as pd
from datetime import datetime, timedelta
import json
import mimetypes
from pathlib import Path
from fastapi_websocket_pubsub import PubSubEndpoint

from app.db.database import get_db, sessionmanager
from app.models import database as db_models
from app.models import schemas
from app.core.config import settings
from app.services.auth import auth_service, audit_service
from app.services.file_manager import save_uploaded_file, delete_file
from app.models.database import Motorcycle, MotorcyclePhoto

router = APIRouter()
security = HTTPBearer()

UPLOAD_DIR = "app/static/uploads"

# --- PubSubEndpoint с поддержкой Redis ---
endpoint = PubSubEndpoint(broadcaster="redis://localhost:6379")

# Регистрируем WebSocket маршрут
@router.websocket("/pubsub")
async def websocket_pubsub(websocket: WebSocket):
    await endpoint.main_loop(websocket)

async def get_db():
    async with sessionmanager.session() as session:
        yield session

# ============================================================================
# DEPENDENCY для проверки аутентификации
# ============================================================================

async def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> db_models.AdminUser:
    """Получение текущего пользователя админки"""
    user = await auth_service.get_current_user(db, credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен или пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def check_permission(
    permission: str,
    current_user: db_models.AdminUser = Depends(get_current_admin_user)
):
    """Проверка разрешений пользователя"""
    user_permissions = current_user.role.permissions or []
    if not auth_service.check_permissions(user_permissions, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для выполнения этого действия"
        )
    return current_user

# ============================================================================
# АУТЕНТИФИКАЦИЯ И УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
# ============================================================================

@router.post("/auth/login", response_model=schemas.TokenResponse)
async def admin_login(
    request: Request,
    login_data: schemas.LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Вход в админ панель"""
    # Сначала проверяем старый способ аутентификации для обратной совместимости
    if login_data.username == "admin" and login_data.password == settings.ADMIN_PASSWORD:
        # Создаем временного пользователя для старой системы
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_service.create_access_token(
            data={"user_id": 0, "username": "admin", "role": "admin"},
            expires_delta=access_token_expires
        )
        
        # Логируем вход
        await audit_service.log_action(
            db=db,
            user_id=0,
            action="login",
            description="Вход через старую систему аутентификации",
            request=request
        )
        
        # Возвращаем с mock пользователем
        mock_user = schemas.AdminUserSimple(
            id=0,
            username="admin",
            email="admin@vmcmoto.ru",
            full_name="Администратор",
            is_active=True
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": mock_user
        }
    
    # Новая система аутентификации
    user = await auth_service.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        # Логируем неудачную попытку входа
        await audit_service.log_action(
            db=db,
            user_id=0,
            action="failed_login",
            description=f"Неудачная попытка входа для пользователя: {login_data.username}",
            request=request,
            request_data={"username": login_data.username}
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создание токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    if login_data.remember_me:
        access_token_expires = timedelta(days=30)  # Увеличиваем срок при "запомнить меня"
    
    access_token = auth_service.create_access_token(
        data={
            "user_id": user.id,
            "username": user.username,
            "role": user.role.name
        },
        expires_delta=access_token_expires
    )
    
    # Логируем успешный вход
    await audit_service.log_action(
        db=db,
        user_id=user.id,
        action="login",
        description=f"Успешный вход пользователя {user.username}",
        request=request
    )
    
    # Подготовка данных пользователя для ответа
    user_data = schemas.AdminUserSimple(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds()),
        "user": user_data
    }

@router.post("/auth/logout")
async def admin_logout(
    request: Request,
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Выход из админ панели"""
    # Логируем выход
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="logout",
        description=f"Выход пользователя {current_user.username}",
        request=request
    )
    
    return {"message": "Успешный выход"}

@router.get("/auth/me", response_model=schemas.CurrentUser)
async def get_current_user_info(
    current_user: db_models.AdminUser = Depends(get_current_admin_user)
):
    """Получение информации о текущем пользователе"""
    permissions = current_user.role.permissions or []
    
    return schemas.CurrentUser(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        permissions=permissions
    )

# ============================================================================
# DASHBOARD И СТАТИСТИКА
# ============================================================================

@router.get("/dashboard", response_model=schemas.DashboardData)
async def get_dashboard_data(
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение данных для dashboard"""
    
    # Статистика по основным сущностям
    stats_queries = {
        "total_models": select(func.count(db_models.Model.id)),
        "total_news": select(func.count(db_models.News.id)),
        "total_employees": select(func.count(db_models.Employee.id)),
        "total_regulations": select(func.count(db_models.Regulation.id)),
        "active_models": select(func.count(db_models.Model.id)).where(db_models.Model.is_active == True),
        "published_news": select(func.count(db_models.News.id)).where(db_models.News.is_published == True),
    }
    
    stats = {}
    for key, query in stats_queries.items():
        result = await db.execute(query)
        stats[key] = result.scalar() or 0
    
    # Статистика файлов
    file_stats_query = select(
        func.count(db_models.FileManager.id),
        func.coalesce(func.sum(db_models.FileManager.file_size), 0)
    )
    file_result = await db.execute(file_stats_query)
    file_count, total_file_size = file_result.first()
    
    stats["recent_uploads"] = file_count or 0
    stats["total_file_size"] = total_file_size or 0
    
    # Последние активности
    activities_query = select(db_models.AdminAuditLog).options(
        selectinload(db_models.AdminAuditLog.user)
    ).order_by(desc(db_models.AdminAuditLog.created_at)).limit(10)
    
    activities_result = await db.execute(activities_query)
    activities = activities_result.scalars().all()
    
    recent_activities = [
        schemas.RecentActivity(
            action=activity.action,
            resource_type=activity.resource_type or "system",
            resource_name=activity.description or "Неизвестно",
            user_name=activity.user.username if activity.user else "Система",
            created_at=activity.created_at
        )
        for activity in activities
    ]
    
    # Топ моделей (с фото)
    top_models_query = select(db_models.Model).options(
        selectinload(db_models.Model.photos)
    ).where(db_models.Model.is_active == True).order_by(
        desc(db_models.Model.created_at)
    ).limit(5)
    
    top_models_result = await db.execute(top_models_query)
    top_models = [
        {
            "id": model.id,
            "name": model.name,
            "category": model.category,
            "photo_count": len(model.photos),
            "created_at": model.created_at.isoformat() if model.created_at else None
        }
        for model in top_models_result.scalars().all()
    ]
    
    # Использование файлов по типам
    file_usage_query = select(
        db_models.FileManager.file_type,
        func.count(db_models.FileManager.id),
        func.coalesce(func.sum(db_models.FileManager.file_size), 0)
    ).group_by(db_models.FileManager.file_type)
    
    file_usage_result = await db.execute(file_usage_query)
    file_usage = {}
    for file_type, count, size in file_usage_result.all():
        file_usage[file_type or "unknown"] = {
            "count": count,
            "size": size
        }
    
    return schemas.DashboardData(
        stats=schemas.DashboardStats(**stats),
        recent_activities=recent_activities,
        top_models=top_models,
        file_usage=file_usage
    )

# ============================================================================
# ФАЙЛОВЫЙ МЕНЕДЖЕР
# ============================================================================

@router.get("/files", response_model=List[schemas.FileManager])
async def get_files(
    filter_params: schemas.FileManagerFilter = Depends(),
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка файлов"""
    query = select(db_models.FileManager).options(
        selectinload(db_models.FileManager.uploaded_by_user)
    )
    
    # Применение фильтров
    if filter_params.search:
        search_pattern = f"%{filter_params.search}%"
        query = query.where(
            or_(
                db_models.FileManager.filename.ilike(search_pattern),
                db_models.FileManager.original_filename.ilike(search_pattern),
                db_models.FileManager.alt_text.ilike(search_pattern)
            )
        )
    
    if filter_params.file_type:
        query = query.where(db_models.FileManager.file_type == filter_params.file_type)
    
    if filter_params.folder:
        query = query.where(db_models.FileManager.folder == filter_params.folder)
    
    if filter_params.uploaded_by:
        query = query.where(db_models.FileManager.uploaded_by == filter_params.uploaded_by)
    
    # Пагинация
    offset = (filter_params.page - 1) * filter_params.size
    query = query.order_by(desc(db_models.FileManager.created_at)).offset(offset).limit(filter_params.size)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/files/upload", response_model=schemas.FileManager)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("uploads"),
    alt_text: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Загрузка файла"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")
    
    # Определение типа файла
    mime_type, _ = mimetypes.guess_type(file.filename)
    file_type = "unknown"
    
    if mime_type:
        if mime_type.startswith("image/"):
            file_type = "image"
        elif mime_type.startswith("video/"):
            file_type = "video"
        elif mime_type.startswith("audio/"):
            file_type = "audio"
        elif mime_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            file_type = "document"
    
    # Сохранение файла
    try:
        file_path = await save_uploaded_file(file, folder)
        file_size = 0
        
        # Получение размера файла
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
        
        # Обработка тегов
        file_tags = []
        if tags:
            file_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # Создание записи в БД
        db_file = db_models.FileManager(
            filename=file.filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            file_type=file_type,
            alt_text=alt_text,
            description=description,
            tags=file_tags,
            folder=folder,
            uploaded_by=current_user.id
        )
        
        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)
        
        # Логирование
        await audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="upload",
            resource_type="file",
            resource_id=str(db_file.id),
            description=f"Загружен файл: {file.filename}",
            request=request,
            request_data={
                "filename": file.filename,
                "folder": folder,
                "file_size": file_size
            }
        )
        
        # Перезагружаем с пользователем
        await db.refresh(db_file, ["uploaded_by_user"])
        return db_file
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

# ============================================================================
# BULK ОПЕРАЦИИ
# ============================================================================

@router.post("/bulk/models", response_model=schemas.BulkResult)
async def bulk_action_models(
    bulk_action: schemas.BulkAction,
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Массовые операции с моделями"""
    success_count = 0
    errors = []
    
    for model_id in bulk_action.ids:
        try:
            if bulk_action.action == "delete":
                query = select(db_models.Model).where(db_models.Model.id == model_id)
                result = await db.execute(query)
                model = result.scalars().first()
                if model:
                    await db.delete(model)
                    success_count += 1
            
            elif bulk_action.action == "activate":
                await db.execute(
                    update(db_models.Model)
                    .where(db_models.Model.id == model_id)
                    .values(is_active=True)
                )
                success_count += 1
            
            elif bulk_action.action == "deactivate":
                await db.execute(
                    update(db_models.Model)
                    .where(db_models.Model.id == model_id)
                    .values(is_active=False)
                )
                success_count += 1
            
        except Exception as e:
            errors.append(f"Ошибка для модели {model_id}: {str(e)}")
    
    await db.commit()
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action=f"bulk_{bulk_action.action}",
        resource_type="model",
        description=f"Массовая операция '{bulk_action.action}' для {len(bulk_action.ids)} моделей",
        request=request,
        request_data=bulk_action.model_dump()
    )
    
    return schemas.BulkResult(
        success=success_count,
        failed=len(errors),
        total=len(bulk_action.ids),
        errors=errors
    )

@router.get("/motorcycles")
async def get_motorcycles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Motorcycle))
    motorcycles = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in motorcycles]

@router.post("/motorcycles")
async def create_motorcycle(data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    moto = Motorcycle(name=name)
    db.add(moto)
    await db.commit()
    await db.refresh(moto)
    # --- Публикуем событие о создании мотоцикла ---
    endpoint.publish(["motorcycle_update"], {"id": moto.id, "name": moto.name})
    return {"id": moto.id, "name": moto.name}

@router.post("/motorcycles/{motorcycle_id}/photos")
async def upload_motorcycle_photo(motorcycle_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # Проверка, что мотоцикл существует
    moto = await db.get(Motorcycle, motorcycle_id)
    if not moto:
        raise HTTPException(status_code=404, detail="Мотоцикл не найден")
    # Сохраняем файл
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    # Добавляем запись в БД
    photo = MotorcyclePhoto(motorcycle_id=motorcycle_id, filename=file.filename, file_path=file_path)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return {"id": photo.id, "filename": photo.filename, "file_path": photo.file_path}

@router.get("/motorcycles/{motorcycle_id}/photos")
async def get_motorcycle_photos(motorcycle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MotorcyclePhoto).where(MotorcyclePhoto.motorcycle_id == motorcycle_id))
    photos = result.scalars().all()
    return [{"id": p.id, "filename": p.filename, "file_path": p.file_path} for p in photos] 