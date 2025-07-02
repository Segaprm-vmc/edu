from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request, Query
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

from app.db.database import get_db
from app.models import database as db_models
from app.models import schemas
from app.core.config import settings
from app.services.auth import auth_service, audit_service
from app.services.file_manager import save_uploaded_file, delete_file
from app.services.excel_import import import_specs_from_excel

router = APIRouter()
security = HTTPBearer()

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
# УПРАВЛЕНИЕ РОЛЯМИ И ПОЛЬЗОВАТЕЛЯМИ
# ============================================================================

@router.get("/roles", response_model=List[schemas.AdminRole])
async def get_admin_roles(
    current_user: db_models.AdminUser = Depends(check_permission("manage_users")),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка ролей"""
    query = select(db_models.AdminRole).where(db_models.AdminRole.is_active == True)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/roles", response_model=schemas.AdminRole)
async def create_admin_role(
    role_data: schemas.AdminRoleCreate,
    current_user: db_models.AdminUser = Depends(check_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Создание новой роли"""
    # Проверка уникальности имени роли
    existing_query = select(db_models.AdminRole).where(db_models.AdminRole.name == role_data.name)
    existing = await db.execute(existing_query)
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Роль с таким именем уже существует")
    
    # Создание роли
    db_role = db_models.AdminRole(**role_data.model_dump())
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="create",
        resource_type="admin_role",
        resource_id=str(db_role.id),
        description=f"Создана роль: {db_role.name}",
        request=request,
        request_data=role_data.model_dump()
    )
    
    return db_role

@router.get("/users", response_model=List[schemas.AdminUser])
async def get_admin_users(
    filter_params: schemas.AdminUserFilter = Depends(),
    current_user: db_models.AdminUser = Depends(check_permission("manage_users")),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка пользователей админки"""
    query = select(db_models.AdminUser).options(
        selectinload(db_models.AdminUser.role)
    )
    
    # Применение фильтров
    if filter_params.search:
        search_pattern = f"%{filter_params.search}%"
        query = query.where(
            or_(
                db_models.AdminUser.username.ilike(search_pattern),
                db_models.AdminUser.email.ilike(search_pattern),
                db_models.AdminUser.full_name.ilike(search_pattern)
            )
        )
    
    if filter_params.role_id:
        query = query.where(db_models.AdminUser.role_id == filter_params.role_id)
    
    if filter_params.is_active is not None:
        query = query.where(db_models.AdminUser.is_active == filter_params.is_active)
    
    if filter_params.is_verified is not None:
        query = query.where(db_models.AdminUser.is_verified == filter_params.is_verified)
    
    # Пагинация
    offset = (filter_params.page - 1) * filter_params.size
    query = query.offset(offset).limit(filter_params.size)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/users", response_model=schemas.AdminUser)
async def create_admin_user(
    user_data: schemas.AdminUserCreate,
    current_user: db_models.AdminUser = Depends(check_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Создание нового пользователя админки"""
    db_user = await auth_service.create_user(db, user_data, current_user.id)
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="create",
        resource_type="admin_user",
        resource_id=str(db_user.id),
        description=f"Создан пользователь: {db_user.username}",
        request=request,
        request_data=user_data.model_dump(exclude={"password"})
    )
    
    # Перезагружаем с ролью
    await db.refresh(db_user, ["role"])
    return db_user

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
    current_user: db_models.AdminUser = Depends(check_permission("upload_files")),
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
# ЛОГИ И АУДИТ
# ============================================================================

@router.get("/audit-logs", response_model=List[schemas.AdminAuditLog])
async def get_audit_logs(
    filter_params: schemas.AdminAuditLogFilter = Depends(),
    current_user: db_models.AdminUser = Depends(check_permission("view_audit_logs")),
    db: AsyncSession = Depends(get_db)
):
    """Получение логов действий"""
    query = select(db_models.AdminAuditLog).options(
        selectinload(db_models.AdminAuditLog.user)
    )
    
    # Применение фильтров
    if filter_params.user_id:
        query = query.where(db_models.AdminAuditLog.user_id == filter_params.user_id)
    
    if filter_params.action:
        query = query.where(db_models.AdminAuditLog.action == filter_params.action)
    
    if filter_params.resource_type:
        query = query.where(db_models.AdminAuditLog.resource_type == filter_params.resource_type)
    
    if filter_params.date_from:
        query = query.where(db_models.AdminAuditLog.created_at >= filter_params.date_from)
    
    if filter_params.date_to:
        query = query.where(db_models.AdminAuditLog.created_at <= filter_params.date_to)
    
    # Пагинация
    offset = (filter_params.page - 1) * filter_params.size
    query = query.order_by(desc(db_models.AdminAuditLog.created_at)).offset(offset).limit(filter_params.size)
    
    result = await db.execute(query)
    return result.scalars().all()

# ============================================================================
# BULK ОПЕРАЦИИ
# ============================================================================

@router.post("/bulk/models", response_model=schemas.BulkResult)
async def bulk_action_models(
    bulk_action: schemas.BulkAction,
    current_user: db_models.AdminUser = Depends(check_permission("manage_models")),
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

# ============================================================================
# ОРИГИНАЛЬНЫЕ CRUD ОПЕРАЦИИ ДЛЯ МОДЕЛЕЙ (для обратной совместимости)
# ============================================================================

@router.get("/models", response_model=List[schemas.ModelSimple])
async def get_admin_models(
    skip: int = 0,
    limit: int = 100,
    current_user: db_models.AdminUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все модели для админки"""
    query = select(db_models.Model).order_by(db_models.Model.sort_order, db_models.Model.name).offset(skip).limit(limit)
    result = await db.execute(query)
    models = result.scalars().all()
    return models

@router.post("/models", response_model=schemas.ModelSimple)
async def create_model(
    model: schemas.ModelCreate,
    current_user: db_models.AdminUser = Depends(check_permission("manage_models")),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Создать новую модель"""
    db_model = db_models.Model(**model.model_dump())
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="create",
        resource_type="model",
        resource_id=str(db_model.id),
        description=f"Создана модель: {db_model.name}",
        request=request,
        request_data=model.model_dump()
    )
    
    return db_model

@router.put("/models/{model_id}", response_model=schemas.ModelSimple)
async def update_model(
    model_id: int,
    model: schemas.ModelUpdate,
    current_user: db_models.AdminUser = Depends(check_permission("manage_models")),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Обновить модель"""
    query = select(db_models.Model).filter(db_models.Model.id == model_id)
    result = await db.execute(query)
    db_model = result.scalars().first()
    
    if not db_model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    update_data = model.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_model, field, value)
    
    await db.commit()
    await db.refresh(db_model)
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="update",
        resource_type="model",
        resource_id=str(db_model.id),
        description=f"Обновлена модель: {db_model.name}",
        request=request,
        request_data=update_data
    )
    
    return db_model

@router.delete("/models/{model_id}")
async def delete_model(
    model_id: int,
    current_user: db_models.AdminUser = Depends(check_permission("manage_models")),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Удалить модель"""
    query = select(db_models.Model).filter(db_models.Model.id == model_id)
    result = await db.execute(query)
    db_model = result.scalars().first()
    
    if not db_model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    model_name = db_model.name
    await db.delete(db_model)
    await db.commit()
    
    # Логирование
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="delete",
        resource_type="model",
        resource_id=str(model_id),
        description=f"Удалена модель: {model_name}",
        request=request
    )
    
    return {"message": "Модель удалена"}

# Загрузка файлов
@router.post("/upload/image", response_model=schemas.FileUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(...),  # models, news, employees, regulations
    admin: bool = Depends(get_current_admin_user)
):
    """Загрузка изображения"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")
    
    # Проверка расширения файла
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый формат файла. Разрешены: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Проверка размера файла
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Файл слишком большой")
    
    try:
        filepath = await save_uploaded_file(file, category, "image")
        return schemas.FileUploadResponse(
            filename=file.filename,
            original_filename=file.filename,
            file_path=filepath,
            file_size=file.size,
            message="Файл успешно загружен"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

# CRUD для фотографий моделей
@router.post("/models/{model_id}/photos", response_model=schemas.ModelPhoto)
async def upload_model_photo(
    model_id: int,
    file: UploadFile = File(...),
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Загрузить фотографию для модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    # Проверка типа файла
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise HTTPException(
            status_code=400, 
            detail="Недопустимый формат файла. Разрешены: jpg, jpeg, png, webp"
        )
    
    try:
        # Сохраняем файл
        file_path = await save_uploaded_file(file, f"models/{model_id}")
        
        # Получаем размер файла
        file_content = await file.read()
        file_size = len(file_content)
        
        # Определяем порядок сортировки (следующий по счету)
        count_query = select(db_models.ModelPhoto).filter(
            db_models.ModelPhoto.model_id == model_id
        )
        count_result = await db.execute(count_query)
        max_sort = len(count_result.scalars().all())
        
        # Создаем запись в БД
        db_photo = db_models.ModelPhoto(
            model_id=model_id,
            filename=os.path.basename(file_path),
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            sort_order=max_sort + 1
        )
        
        db.add(db_photo)
        await db.commit()
        await db.refresh(db_photo)
        
        return db_photo
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

@router.get("/models/{model_id}/photos", response_model=List[schemas.ModelPhoto])
async def get_model_photos(
    model_id: int,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все фотографии модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    photos_query = select(db_models.ModelPhoto).filter(
        db_models.ModelPhoto.model_id == model_id
    ).order_by(db_models.ModelPhoto.sort_order)
    
    photos_result = await db.execute(photos_query)
    photos = photos_result.scalars().all()
    
    return photos

@router.put("/models/{model_id}/photos/order")
async def update_model_photos_order(
    model_id: int,
    photo_ids: List[int],
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить порядок фотографий модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    # Обновляем порядок для каждой фотографии
    for order, photo_id in enumerate(photo_ids, 1):
        photo_query = select(db_models.ModelPhoto).filter(
            db_models.ModelPhoto.id == photo_id,
            db_models.ModelPhoto.model_id == model_id
        )
        photo_result = await db.execute(photo_query)
        photo = photo_result.scalars().first()
        
        if photo:
            photo.sort_order = order
    
    await db.commit()
    return {"message": "Порядок фотографий обновлен"}

@router.put("/photos/{photo_id}/primary")
async def set_primary_photo(
    photo_id: int,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Установить фотографию как основную"""
    photo_query = select(db_models.ModelPhoto).filter(db_models.ModelPhoto.id == photo_id)
    photo_result = await db.execute(photo_query)
    photo = photo_result.scalars().first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Фотография не найдена")
    
    # Убираем флаг основной у всех фотографий этой модели
    update_query = update(db_models.ModelPhoto).where(
        db_models.ModelPhoto.model_id == photo.model_id
    ).values(is_primary=False)
    await db.execute(update_query)
    
    # Устанавливаем флаг основной для выбранной фотографии
    photo.is_primary = True
    
    await db.commit()
    return {"message": "Основная фотография установлена"}

@router.delete("/photos/{photo_id}")
async def delete_model_photo(
    photo_id: int,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить фотографию модели"""
    photo_query = select(db_models.ModelPhoto).filter(db_models.ModelPhoto.id == photo_id)
    photo_result = await db.execute(photo_query)
    photo = photo_result.scalars().first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Фотография не найдена")
    
    # Удаляем файл с диска
    delete_file(photo.file_path)
    
    # Удаляем запись из БД
    await db.delete(photo)
    await db.commit()
    
    return {"message": "Фотография удалена"}

# CRUD для характеристик моделей
@router.post("/models/{model_id}/specs", response_model=schemas.ModelSpec)
async def create_model_spec(
    model_id: int,
    spec: schemas.ModelSpecBase,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавить характеристику к модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    spec_data = spec.model_dump()
    spec_data["model_id"] = model_id
    db_spec = db_models.ModelSpec(**spec_data)
    db.add(db_spec)
    await db.commit()
    await db.refresh(db_spec)
    return db_spec

@router.put("/specs/{spec_id}", response_model=schemas.ModelSpec)
async def update_model_spec(
    spec_id: int,
    spec: schemas.ModelSpecUpdate,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить характеристику модели"""
    spec_query = select(db_models.ModelSpec).filter(db_models.ModelSpec.id == spec_id)
    spec_result = await db.execute(spec_query)
    db_spec = spec_result.scalars().first()
    
    if not db_spec:
        raise HTTPException(status_code=404, detail="Характеристика не найдена")
    
    update_data = spec.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_spec, field, value)
    
    await db.commit()
    await db.refresh(db_spec)
    return db_spec

@router.delete("/specs/{spec_id}")
async def delete_model_spec(
    spec_id: int,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить характеристику модели"""
    spec_query = select(db_models.ModelSpec).filter(db_models.ModelSpec.id == spec_id)
    spec_result = await db.execute(spec_query)
    db_spec = spec_result.scalars().first()
    
    if not db_spec:
        raise HTTPException(status_code=404, detail="Характеристика не найдена")
    
    await db.delete(db_spec)
    await db.commit()
    return {"message": "Характеристика удалена"}

@router.post("/models/{model_id}/specs/import")
async def import_model_specs(
    model_id: int,
    file: UploadFile = File(...),
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Импорт характеристик из Excel"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    return await import_specs_from_excel(file, model_id, db)

# Получение модели со всеми связанными данными
@router.get("/models/{model_id}/full", response_model=schemas.Model)
async def get_full_model(
    model_id: int,
    admin: bool = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить модель со всеми связанными данными"""
    query = select(db_models.Model).options(
        selectinload(db_models.Model.photos),
        selectinload(db_models.Model.specs),
        selectinload(db_models.Model.videos)
    ).filter(db_models.Model.id == model_id)
    
    result = await db.execute(query)
    model = result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    return model 