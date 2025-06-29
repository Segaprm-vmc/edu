import pandas as pd
import uuid
import os
from typing import List, Dict, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.database import Model, ModelSpec
from app.core.config import settings
import aiofiles

async def import_specs_from_excel(
    file: UploadFile, 
    model_id: int, 
    session: AsyncSession,
    replace_existing: bool = False
) -> Dict[str, int]:
    """
    Импорт технических характеристик из Excel файла
    
    Ожидаемый формат Excel:
    - Колонка A: spec_name (название характеристики)
    - Колонка B: spec_value (значение)
    - Колонка C: spec_unit (единица измерения, опционально)
    """
    if not file.filename or not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Файл должен быть в формате Excel (.xlsx или .xls)")
    
    # Проверяем существование модели
    model_result = await session.execute(select(Model).where(Model.id == model_id))
    model = model_result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    try:
        # Читаем содержимое файла
        file_content = await file.read()
        
        # Создаем временный файл для pandas
        temp_filename = f"/tmp/{uuid.uuid4()}.xlsx"
        async with aiofiles.open(temp_filename, 'wb') as temp_file:
            await temp_file.write(file_content)
        
        # Читаем Excel файл
        df = pd.read_excel(temp_filename)
        
        # Удаляем временный файл
        os.remove(temp_filename)
        
        # Проверяем наличие обязательных колонок
        required_columns = ['spec_name', 'spec_value']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Отсутствуют обязательные колонки: {', '.join(missing_columns)}"
            )
        
        # Если нужно заменить существующие характеристики
        if replace_existing:
            await session.execute(delete(ModelSpec).where(ModelSpec.model_id == model_id))
        
        # Импортируем характеристики
        imported_count = 0
        updated_count = 0
        
        for index, row in df.iterrows():
            if pd.isna(row['spec_name']) or pd.isna(row['spec_value']):
                continue  # Пропускаем пустые строки
            
            spec_name = str(row['spec_name']).strip()
            spec_value = str(row['spec_value']).strip()
            spec_unit = str(row.get('spec_unit', '')).strip() if 'spec_unit' in df.columns and not pd.isna(row.get('spec_unit')) else None
            
            if not spec_name or not spec_value:
                continue
            
            # Проверяем, существует ли уже такая характеристика
            existing_spec_result = await session.execute(
                select(ModelSpec).where(
                    ModelSpec.model_id == model_id,
                    ModelSpec.spec_name == spec_name
                )
            )
            existing_spec = existing_spec_result.scalar_one_or_none()
            
            if existing_spec and not replace_existing:
                # Обновляем существующую характеристику
                existing_spec.spec_value = spec_value
                existing_spec.spec_unit = spec_unit
                updated_count += 1
            else:
                # Создаем новую характеристику
                new_spec = ModelSpec(
                    model_id=model_id,
                    spec_name=spec_name,
                    spec_value=spec_value,
                    spec_unit=spec_unit,
                    sort_order=index
                )
                session.add(new_spec)
                imported_count += 1
        
        await session.commit()
        
        return {
            "imported": imported_count,
            "updated": updated_count,
            "total_processed": imported_count + updated_count
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Excel файл пуст")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Ошибка чтения Excel файла")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при импорте: {str(e)}")

async def export_specs_to_excel(model_id: int, session: AsyncSession) -> bytes:
    """
    Экспорт технических характеристик модели в Excel файл
    """
    # Проверяем существование модели
    model_result = await session.execute(select(Model).where(Model.id == model_id))
    model = model_result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    # Получаем характеристики
    specs_result = await session.execute(
        select(ModelSpec)
        .where(ModelSpec.model_id == model_id)
        .order_by(ModelSpec.sort_order, ModelSpec.spec_name)
    )
    specs = specs_result.scalars().all()
    
    if not specs:
        raise HTTPException(status_code=404, detail="У модели нет технических характеристик")
    
    # Создаем DataFrame
    data = []
    for spec in specs:
        data.append({
            'spec_name': spec.spec_name,
            'spec_value': spec.spec_value,
            'spec_unit': spec.spec_unit or ''
        })
    
    df = pd.DataFrame(data)
    
    # Создаем временный файл для экспорта
    temp_filename = f"/tmp/{uuid.uuid4()}.xlsx"
    
    try:
        # Сохраняем в Excel
        with pd.ExcelWriter(temp_filename, engine='openpyxl') as writer:
            df.to_excel(
                writer, 
                sheet_name=f"Specs_{model.name[:20]}", 
                index=False,
                header=['Название характеристики', 'Значение', 'Единица измерения']
            )
        
        # Читаем файл в память
        with open(temp_filename, 'rb') as f:
            file_content = f.read()
        
        # Удаляем временный файл
        os.remove(temp_filename)
        
        return file_content
        
    except Exception as e:
        # Убираем временный файл в случае ошибки
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=f"Ошибка при экспорте: {str(e)}")

async def bulk_update_specs(
    specs_data: List[Dict[str, any]], 
    model_id: int, 
    session: AsyncSession
) -> Dict[str, int]:
    """
    Массовое обновление характеристик модели
    
    specs_data: список словарей с ключами spec_name, spec_value, spec_unit
    """
    # Проверяем существование модели
    model_result = await session.execute(select(Model).where(Model.id == model_id))
    model = model_result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Модель не найдена")
    
    updated_count = 0
    created_count = 0
    
    for spec_data in specs_data:
        spec_name = spec_data.get('spec_name')
        spec_value = spec_data.get('spec_value')
        spec_unit = spec_data.get('spec_unit')
        
        if not spec_name or not spec_value:
            continue
        
        # Ищем существующую характеристику
        existing_spec_result = await session.execute(
            select(ModelSpec).where(
                ModelSpec.model_id == model_id,
                ModelSpec.spec_name == spec_name
            )
        )
        existing_spec = existing_spec_result.scalar_one_or_none()
        
        if existing_spec:
            # Обновляем существующую
            existing_spec.spec_value = spec_value
            existing_spec.spec_unit = spec_unit
            updated_count += 1
        else:
            # Создаем новую
            new_spec = ModelSpec(
                model_id=model_id,
                spec_name=spec_name,
                spec_value=spec_value,
                spec_unit=spec_unit
            )
            session.add(new_spec)
            created_count += 1
    
    await session.commit()
    
    return {
        "updated": updated_count,
        "created": created_count,
        "total_processed": updated_count + created_count
    } 