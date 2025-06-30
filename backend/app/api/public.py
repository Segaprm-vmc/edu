from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_
from typing import List, Optional
from app.db.database import get_db
from app.models import database as db_models
from app.models import schemas

router = APIRouter()

# Эндпоинты для проверки видимости разделов
@router.get("/sections/visibility", response_model=dict)
async def get_sections_visibility(db: AsyncSession = Depends(get_db)):
    """Получить настройки видимости разделов"""
    result = await db.execute(select(db_models.SectionVisibility))
    sections = result.scalars().all()
    visibility = {}
    
    # Значения по умолчанию
    default_sections = ["news", "regulations", "employees"]
    for section in default_sections:
        visibility[section] = True
    
    # Обновляем настройками из БД
    for section in sections:
        visibility[section.section_name] = section.is_visible
    
    return visibility

# Эндпоинты для моделей мотоциклов
@router.get("/models", response_model=List[schemas.Model])
async def get_models(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    is_active: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Получить список моделей мотоциклов"""
    query = select(db_models.Model).options(
        selectinload(db_models.Model.photos),
        selectinload(db_models.Model.specs),
        selectinload(db_models.Model.videos)
    ).filter(db_models.Model.is_active == is_active)
    
    if search:
        query = query.filter(
            or_(
                db_models.Model.name.ilike(f"%{search}%"),
                db_models.Model.description.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(db_models.Model.sort_order, db_models.Model.name)
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    models = result.scalars().all()
    
    return models

@router.get("/models/{model_id}", response_model=schemas.Model)
async def get_model(model_id: int, db: AsyncSession = Depends(get_db)):
    """Получить модель мотоцикла по ID"""
    query = select(db_models.Model).options(
        selectinload(db_models.Model.photos),
        selectinload(db_models.Model.specs),
        selectinload(db_models.Model.videos)
    ).filter(
        and_(
            db_models.Model.id == model_id,
            db_models.Model.is_active == True
        )
    )
    
    result = await db.execute(query)
    model = result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    return model

@router.get("/models/{model_id}/specs", response_model=List[schemas.ModelSpec])
async def get_model_specs(
    model_id: int,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Получить характеристики модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    query = select(db_models.ModelSpec).filter(db_models.ModelSpec.model_id == model_id)
    
    if category:
        query = query.filter(db_models.ModelSpec.category == category)
    
    if search:
        query = query.filter(
            or_(
                db_models.ModelSpec.spec_name.ilike(f"%{search}%"),
                db_models.ModelSpec.spec_value.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(db_models.ModelSpec.sort_order, db_models.ModelSpec.spec_name)
    result = await db.execute(query)
    specs = result.scalars().all()
    
    return specs

@router.get("/models/{model_id}/photos", response_model=List[schemas.ModelPhoto])
async def get_model_photos(model_id: int, db: AsyncSession = Depends(get_db)):
    """Получить фотографии модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    query = select(db_models.ModelPhoto).filter(
        db_models.ModelPhoto.model_id == model_id
    ).order_by(db_models.ModelPhoto.sort_order)
    
    result = await db.execute(query)
    photos = result.scalars().all()
    
    return photos

@router.get("/models/{model_id}/videos", response_model=List[schemas.ModelVideo])
async def get_model_videos(model_id: int, db: AsyncSession = Depends(get_db)):
    """Получить видео модели"""
    # Проверяем существование модели
    model_query = select(db_models.Model).filter(db_models.Model.id == model_id)
    model_result = await db.execute(model_query)
    model = model_result.scalars().first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    query = select(db_models.ModelVideo).filter(
        db_models.ModelVideo.model_id == model_id
    ).order_by(db_models.ModelVideo.sort_order)
    
    result = await db.execute(query)
    videos = result.scalars().all()
    
    return videos

@router.get("/models/filter")
async def filter_models(
    specs: Optional[str] = Query(None, description="JSON строка с фильтрами по характеристикам"),
    db: AsyncSession = Depends(get_db)
):
    """Фильтрация моделей по характеристикам"""
    import json
    
    if not specs:
        return {"models": [], "filters": {}}
    
    try:
        filters = json.loads(specs)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Неверный формат JSON в параметре specs")
    
    # Получаем все активные модели
    models_query = select(db_models.Model).filter(db_models.Model.is_active == True)
    
    # Применяем фильтры по характеристикам
    for spec_name, spec_value in filters.items():
        if spec_value:
            # Подзапрос для поиска моделей с нужной характеристикой
            subquery = select(db_models.ModelSpec.model_id).filter(
                and_(
                    db_models.ModelSpec.spec_name == spec_name,
                    db_models.ModelSpec.spec_value.ilike(f"%{spec_value}%")
                )
            )
            
            models_query = models_query.filter(db_models.Model.id.in_(subquery))
    
    models_query = models_query.order_by(db_models.Model.sort_order, db_models.Model.name)
    result = await db.execute(models_query)
    models = result.scalars().all()
    
    return {
        "models": [schemas.Model.model_validate(model) for model in models],
        "total": len(models),
        "filters_applied": filters
    }

# Эндпоинты для новостей
@router.get("/news", response_model=List[schemas.News])
async def get_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Получить список новостей"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "news"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел новостей недоступен")
    
    query = select(db_models.News).filter(db_models.News.is_published == True)
    
    if search:
        query = query.filter(
            or_(
                db_models.News.title.ilike(f"%{search}%"),
                db_models.News.content.ilike(f"%{search}%"),
                db_models.News.summary.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(db_models.News.published_at.desc(), db_models.News.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    news_items = result.scalars().all()
    
    return news_items

@router.get("/news/{news_id}", response_model=schemas.News)
async def get_news_item(news_id: int, db: AsyncSession = Depends(get_db)):
    """Получить новость по ID"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "news"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел новостей недоступен")
    
    query = select(db_models.News).filter(
        and_(
            db_models.News.id == news_id,
            db_models.News.is_published == True
        )
    )
    
    result = await db.execute(query)
    news_item = result.scalars().first()
    
    if not news_item:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    
    return news_item

# Эндпоинты для регламентов
@router.get("/regulations", response_model=List[schemas.Regulation])
async def get_regulations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Получить список регламентов"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "regulations"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел регламентов недоступен")
    
    query = select(db_models.Regulation).filter(db_models.Regulation.is_published == True)
    
    if category:
        query = query.filter(db_models.Regulation.category == category)
    
    if search:
        query = query.filter(
            or_(
                db_models.Regulation.title.ilike(f"%{search}%"),
                db_models.Regulation.content.ilike(f"%{search}%"),
                db_models.Regulation.summary.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(db_models.Regulation.published_at.desc(), db_models.Regulation.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    regulations = result.scalars().all()
    
    return regulations

@router.get("/regulations/{regulation_id}", response_model=schemas.Regulation)
async def get_regulation(regulation_id: int, db: AsyncSession = Depends(get_db)):
    """Получить регламент по ID"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "regulations"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел регламентов недоступен")
    
    query = select(db_models.Regulation).filter(
        and_(
            db_models.Regulation.id == regulation_id,
            db_models.Regulation.is_published == True
        )
    )
    
    result = await db.execute(query)
    regulation = result.scalars().first()
    
    if not regulation:
        raise HTTPException(status_code=404, detail="Регламент не найден")
    
    return regulation

# Эндпоинты для сотрудников
@router.get("/employees", response_model=List[schemas.Employee])
async def get_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    position: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Получить список сотрудников"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "employees"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел сотрудников недоступен")
    
    query = select(db_models.Employee).filter(db_models.Employee.is_active == True)
    
    if position:
        query = query.filter(db_models.Employee.position.ilike(f"%{position}%"))
    
    if search:
        query = query.filter(
            or_(
                db_models.Employee.first_name.ilike(f"%{search}%"),
                db_models.Employee.last_name.ilike(f"%{search}%"),
                db_models.Employee.position.ilike(f"%{search}%"),
                db_models.Employee.description.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(db_models.Employee.sort_order, db_models.Employee.last_name, db_models.Employee.first_name)
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    employees = result.scalars().all()
    
    return employees

@router.get("/employees/{employee_id}", response_model=schemas.Employee)
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    """Получить сотрудника по ID"""
    # Проверяем видимость раздела
    section_query = select(db_models.SectionVisibility).filter(
        db_models.SectionVisibility.section_name == "employees"
    )
    section_result = await db.execute(section_query)
    section_vis = section_result.scalars().first()
    
    if section_vis and not section_vis.is_visible:
        raise HTTPException(status_code=404, detail="Раздел сотрудников недоступен")
    
    query = select(db_models.Employee).filter(
        and_(
            db_models.Employee.id == employee_id,
            db_models.Employee.is_active == True
        )
    )
    
    result = await db.execute(query)
    employee = result.scalars().first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    
    return employee 