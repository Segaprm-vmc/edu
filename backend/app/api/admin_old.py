from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, update, delete
from typing import List, Optional
import os
import uuid
import shutil
import pandas as pd
from datetime import datetime, timedelta
import json

from app.db.database import get_db
from app.models import database as db_models
from app.models import schemas
from app.core.config import settings
from app.services.auth import verify_admin_password, create_access_token
from app.services.file_manager import save_uploaded_file, delete_file
from app.services.excel_import import import_specs_from_excel

router = APIRouter()
security = HTTPBearer()

# Dependency для проверки аутентификации админа
async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Проверка токена администратора"""
    from jose import JWTError, jwt
    
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        admin_type: str = payload.get("sub")
        if admin_type != "admin":
            raise HTTPException(status_code=401, detail="Недействительный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    
    return True

# Аутентификация
@router.post("/login", response_model=schemas.Token)
async def admin_login(admin_data: schemas.LoginRequest):
    """Вход в админ панель"""
    if not verify_admin_password(admin_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "admin"}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Загрузка файлов
@router.post("/upload/image", response_model=schemas.FileUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(...),  # models, news, employees, regulations
    admin: bool = Depends(get_current_admin)
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
            filepath=filepath,
            size=file.size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

@router.post("/upload/document", response_model=schemas.FileUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),  # news, regulations
    admin: bool = Depends(get_current_admin)
):
    """Загрузка документа"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")
    
    # Проверка расширения файла
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый формат файла. Разрешены: {', '.join(settings.ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Проверка размера файла
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Файл слишком большой")
    
    try:
        filepath = await save_uploaded_file(file, category, "document")
        return schemas.FileUploadResponse(
            filename=file.filename,
            filepath=filepath,
            size=file.size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

# CRUD для моделей мотоциклов
@router.get("/models", response_model=List[schemas.Model])
async def get_admin_models(
    skip: int = 0,
    limit: int = 100,
    admin: bool = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить все модели для админки"""
    query = select(db_models.Model).order_by(db_models.Model.sort_order, db_models.Model.name).offset(skip).limit(limit)
    result = await db.execute(query)
    models = result.scalars().all()
    return models

@router.post("/models", response_model=schemas.Model)
async def create_model(
    model: schemas.ModelCreate,
    admin: bool = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Создать новую модель"""
    db_model = db_models.Model(**model.model_dump())
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    return db_model

@router.put("/models/{model_id}", response_model=schemas.Model)
async def update_model(
    model_id: int,
    model: schemas.ModelUpdate,
    admin: bool = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
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
    return db_model

@router.delete("/models/{model_id}")
async def delete_model(
    model_id: int,
    admin: bool = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Удалить модель"""
    query = select(db_models.Model).filter(db_models.Model.id == model_id)
    result = await db.execute(query)
    db_model = result.scalars().first()
    
    if not db_model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    await db.delete(db_model)
    await db.commit()
    return {"message": "Модель удалена"}

# CRUD для фотографий моделей
@router.post("/models/{model_id}/photos", response_model=schemas.ModelPhoto)
async def upload_model_photo(
    model_id: int,
    file: UploadFile = File(...),
    admin: bool = Depends(get_current_admin),
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
    admin: bool = Depends(get_current_admin),
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
    admin: bool = Depends(get_current_admin),
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
    admin: bool = Depends(get_current_admin),
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
    admin: bool = Depends(get_current_admin),
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

# CRUD для видео моделей
@router.post("/models/{model_id}/videos", response_model=schemas.ModelVideo)
async def create_model_video(
    model_id: int,
    video: schemas.ModelVideoBase,
    admin: bool = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Добавить видео к модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    video_data = video.model_dump()
    video_data["model_id"] = model_id
    db_video = db_models.ModelVideo(**video_data)
    db.add(db_video)
    await db.commit()
    await db.refresh(db_video)
    return db_video

@router.put("/videos/{video_id}", response_model=schemas.ModelVideo)
async def update_model_video(
    video_id: int,
    video: schemas.ModelVideoUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить видео модели"""
    db_video = db.query(db_models.ModelVideo).filter(db_models.ModelVideo.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Видео не найдено")
    
    update_data = video.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_video, field, value)
    
    db.commit()
    db.refresh(db_video)
    return db_video

@router.delete("/videos/{video_id}")
async def delete_model_video(
    video_id: int,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить видео модели"""
    db_video = db.query(db_models.ModelVideo).filter(db_models.ModelVideo.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Видео не найдено")
    
    db.delete(db_video)
    db.commit()
    return {"message": "Видео удалено"}

# CRUD для характеристик моделей
@router.post("/models/{model_id}/specs", response_model=schemas.ModelSpec)
async def create_model_spec(
    model_id: int,
    spec: schemas.ModelSpecBase,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Добавить характеристику к модели"""
    # Проверяем существование модели
    model = db.query(db_models.Model).filter(db_models.Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    spec_data = spec.dict()
    spec_data["model_id"] = model_id
    db_spec = db_models.ModelSpec(**spec_data)
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec

@router.put("/specs/{spec_id}", response_model=schemas.ModelSpec)
async def update_model_spec(
    spec_id: int,
    spec: schemas.ModelSpecUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить характеристику модели"""
    db_spec = db.query(db_models.ModelSpec).filter(db_models.ModelSpec.id == spec_id).first()
    if not db_spec:
        raise HTTPException(status_code=404, detail="Характеристика не найдена")
    
    update_data = spec.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_spec, field, value)
    
    db.commit()
    db.refresh(db_spec)
    return db_spec

@router.delete("/specs/{spec_id}")
async def delete_model_spec(
    spec_id: int,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить характеристику модели"""
    db_spec = db.query(db_models.ModelSpec).filter(db_models.ModelSpec.id == spec_id).first()
    if not db_spec:
        raise HTTPException(status_code=404, detail="Характеристика не найдена")
    
    db.delete(db_spec)
    db.commit()
    return {"message": "Характеристика удалена"}

# Import Excel для характеристик
@router.post("/models/{model_id}/specs/import")
async def import_model_specs(
    model_id: int,
    file: UploadFile = File(...),
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Импорт характеристик модели из Excel"""
    # Проверяем существование модели
    model = db.query(db_models.Model).filter(db_models.Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Файл должен быть в формате Excel")
    
    try:
        result = await import_specs_from_excel(file, model_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка импорта: {str(e)}")

# CRUD для новостей
@router.get("/news", response_model=List[schemas.News])
async def get_admin_news(
    skip: int = 0,
    limit: int = 50,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить все новости для админки"""
    news = db.query(db_models.News).order_by(db_models.News.created_at.desc()).offset(skip).limit(limit).all()
    return news

@router.post("/news", response_model=schemas.News)
async def create_news(
    news: schemas.NewsCreate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создать новость"""
    news_data = news.dict()
    if news_data.get("is_published"):
        news_data["published_at"] = datetime.now()
    
    db_news = db_models.News(**news_data)
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news

@router.put("/news/{news_id}", response_model=schemas.News)
async def update_news(
    news_id: int,
    news: schemas.NewsUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить новость"""
    db_news = db.query(db_models.News).filter(db_models.News.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    
    update_data = news.dict(exclude_unset=True)
    
    # Устанавливаем дату публикации при включении публикации
    if "is_published" in update_data and update_data["is_published"] and not db_news.published_at:
        update_data["published_at"] = datetime.now()
    
    for field, value in update_data.items():
        setattr(db_news, field, value)
    
    db.commit()
    db.refresh(db_news)
    return db_news

@router.delete("/news/{news_id}")
async def delete_news(
    news_id: int,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить новость"""
    db_news = db.query(db_models.News).filter(db_models.News.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    
    # Удаляем связанные файлы
    if db_news.photo_path:
        delete_file(db_news.photo_path)
    if db_news.document_path:
        delete_file(db_news.document_path)
    
    db.delete(db_news)
    db.commit()
    return {"message": "Новость удалена"}

# CRUD для регламентов (аналогично новостям)
@router.get("/regulations", response_model=List[schemas.Regulation])
async def get_admin_regulations(
    skip: int = 0,
    limit: int = 50,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить все регламенты для админки"""
    regulations = db.query(db_models.Regulation).order_by(db_models.Regulation.created_at.desc()).offset(skip).limit(limit).all()
    return regulations

@router.post("/regulations", response_model=schemas.Regulation)
async def create_regulation(
    regulation: schemas.RegulationCreate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создать регламент"""
    regulation_data = regulation.dict()
    if regulation_data.get("is_published"):
        regulation_data["published_at"] = datetime.now()
    
    db_regulation = db_models.Regulation(**regulation_data)
    db.add(db_regulation)
    db.commit()
    db.refresh(db_regulation)
    return db_regulation

@router.put("/regulations/{regulation_id}", response_model=schemas.Regulation)
async def update_regulation(
    regulation_id: int,
    regulation: schemas.RegulationUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить регламент"""
    db_regulation = db.query(db_models.Regulation).filter(db_models.Regulation.id == regulation_id).first()
    if not db_regulation:
        raise HTTPException(status_code=404, detail="Регламент не найден")
    
    update_data = regulation.dict(exclude_unset=True)
    
    # Устанавливаем дату публикации при включении публикации
    if "is_published" in update_data and update_data["is_published"] and not db_regulation.published_at:
        update_data["published_at"] = datetime.now()
    
    for field, value in update_data.items():
        setattr(db_regulation, field, value)
    
    db.commit()
    db.refresh(db_regulation)
    return db_regulation

@router.delete("/regulations/{regulation_id}")
async def delete_regulation(
    regulation_id: int,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить регламент"""
    db_regulation = db.query(db_models.Regulation).filter(db_models.Regulation.id == regulation_id).first()
    if not db_regulation:
        raise HTTPException(status_code=404, detail="Регламент не найден")
    
    # Удаляем связанные файлы
    if db_regulation.photo_path:
        delete_file(db_regulation.photo_path)
    if db_regulation.document_path:
        delete_file(db_regulation.document_path)
    
    db.delete(db_regulation)
    db.commit()
    return {"message": "Регламент удален"}

# CRUD для сотрудников
@router.get("/employees", response_model=List[schemas.Employee])
async def get_admin_employees(
    skip: int = 0,
    limit: int = 100,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить всех сотрудников для админки"""
    employees = db.query(db_models.Employee).order_by(db_models.Employee.sort_order, db_models.Employee.name).offset(skip).limit(limit).all()
    return employees

@router.post("/employees", response_model=schemas.Employee)
async def create_employee(
    employee: schemas.EmployeeCreate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создать сотрудника"""
    db_employee = db_models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/employees/{employee_id}", response_model=schemas.Employee)
async def update_employee(
    employee_id: int,
    employee: schemas.EmployeeUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить сотрудника"""
    db_employee = db.query(db_models.Employee).filter(db_models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    
    update_data = employee.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: int,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить сотрудника"""
    db_employee = db.query(db_models.Employee).filter(db_models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    
    # Удаляем связанное фото
    if db_employee.photo_path:
        delete_file(db_employee.photo_path)
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Сотрудник удален"}

# Управление видимостью разделов
@router.get("/sections/visibility", response_model=List[schemas.SectionVisibility])
async def get_admin_sections_visibility(
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить настройки видимости разделов"""
    sections = db.query(db_models.SectionVisibility).all()
    
    # Создаем разделы по умолчанию если их нет
    default_sections = ["news", "regulations", "employees"]
    existing_sections = {s.section_name for s in sections}
    
    for section_name in default_sections:
        if section_name not in existing_sections:
            new_section = db_models.SectionVisibility(section_name=section_name, is_visible=True)
            db.add(new_section)
            sections.append(new_section)
    
    db.commit()
    return sections

@router.put("/sections/{section_name}/visibility")
async def update_section_visibility(
    section_name: str,
    visibility: schemas.SectionVisibilityUpdate,
    admin: bool = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить видимость раздела"""
    section = db.query(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == section_name
    ).first()
    
    if not section:
        # Создаем новый раздел
        section = db_models.SectionVisibility(
            section_name=section_name,
            is_visible=visibility.is_visible,
            updated_by="admin"
        )
        db.add(section)
    else:
        section.is_visible = visibility.is_visible
        section.updated_by = "admin"
    
    db.commit()
    db.refresh(section)
    return {"message": f"Видимость раздела {section_name} обновлена"} 