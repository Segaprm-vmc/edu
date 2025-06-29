from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime

# Базовые схемы
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Схемы для моделей мотоциклов
class ModelVideoBase(BaseModel):
    title: Optional[str] = None
    url: str
    video_type: Optional[str] = None
    sort_order: int = 0

class ModelVideoCreate(ModelVideoBase):
    model_id: int

class ModelVideoUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    video_type: Optional[str] = None
    sort_order: Optional[int] = None

class ModelVideo(ModelVideoBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    
    id: int
    model_id: int
    created_at: datetime

class ModelSpecBase(BaseModel):
    spec_name: str
    spec_value: str
    spec_unit: Optional[str] = None
    sort_order: int = 0

class ModelSpecCreate(ModelSpecBase):
    model_id: int

class ModelSpecUpdate(BaseModel):
    spec_name: Optional[str] = None
    spec_value: Optional[str] = None
    spec_unit: Optional[str] = None
    sort_order: Optional[int] = None

class ModelSpec(ModelSpecBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    
    id: int
    model_id: int
    created_at: datetime

class ModelPhotoBase(BaseModel):
    filename: str
    original_filename: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    is_primary: bool = False
    sort_order: int = 0

class ModelPhotoCreate(ModelPhotoBase):
    model_id: int

class ModelPhoto(ModelPhotoBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    
    id: int
    model_id: int
    created_at: datetime

class ModelBase(BaseModel):
    name: str
    description: Optional[str] = None
    sales_script: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class ModelCreate(ModelBase):
    pass

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sales_script: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class Model(ModelBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Связанные объекты
    videos: List[ModelVideo] = []
    photos: List[ModelPhoto] = []
    specs: List[ModelSpec] = []

# Схемы для новостей
class NewsPhotoBase(BaseModel):
    filename: str
    original_filename: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    sort_order: int = 0

class NewsPhoto(NewsPhotoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    news_id: int
    created_at: datetime

class NewsDocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    sort_order: int = 0

class NewsDocument(NewsDocumentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    news_id: int
    created_at: datetime

class NewsBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    author: Optional[str] = None
    is_published: bool = False

class NewsCreate(NewsBase):
    published_at: Optional[datetime] = None

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    author: Optional[str] = None
    is_published: Optional[bool] = None
    published_at: Optional[datetime] = None

class News(NewsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Связанные объекты
    photos: List[NewsPhoto] = []
    documents: List[NewsDocument] = []

# Схемы для регламентов
class RegulationPhotoBase(BaseModel):
    filename: str
    original_filename: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    sort_order: int = 0

class RegulationPhoto(RegulationPhotoBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    regulation_id: int
    created_at: datetime

class RegulationDocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    sort_order: int = 0

class RegulationDocument(RegulationDocumentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    regulation_id: int
    created_at: datetime

class RegulationBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = False

class RegulationCreate(RegulationBase):
    published_at: Optional[datetime] = None

class RegulationUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    published_at: Optional[datetime] = None

class Regulation(RegulationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Связанные объекты
    photos: List[RegulationPhoto] = []
    documents: List[RegulationDocument] = []

# Схемы для сотрудников
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    position: str
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    photo_path: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    photo_path: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class Employee(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v and '@' not in v:
            raise ValueError('Неверный формат email')
        return v

# Схемы для настроек видимости разделов
class SectionVisibilityBase(BaseModel):
    section_name: str
    is_visible: bool = True

class SectionVisibilityCreate(SectionVisibilityBase):
    pass

class SectionVisibilityUpdate(BaseModel):
    is_visible: Optional[bool] = None

class SectionVisibility(SectionVisibilityBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    updated_at: Optional[datetime] = None

# Схемы для аутентификации
class LoginRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Алиас для совместимости
Token = TokenResponse

# Схемы для загрузки файлов
class FileUploadResponse(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    message: str

# Схемы для импорта Excel
class ExcelImportResponse(BaseModel):
    imported: int
    updated: int
    total_processed: int
    message: str

class BulkSpecUpdate(BaseModel):
    specs: List[ModelSpecCreate]

# Схемы для фильтрации и поиска
class ModelFilter(BaseModel):
    search: Optional[str] = None
    specs: Optional[dict] = None  # Фильтр по характеристикам
    is_active: Optional[bool] = None
    page: int = 1
    size: int = 20

class NewsFilter(BaseModel):
    search: Optional[str] = None
    author: Optional[str] = None
    is_published: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    size: int = 20

class EmployeeFilter(BaseModel):
    search: Optional[str] = None  # Поиск по имени или должности
    position: Optional[str] = None
    is_active: Optional[bool] = None
    page: int = 1
    size: int = 20

# Общие схемы для ответов
class PaginatedResponse(BaseModel):
    items: List[BaseModel]
    total: int
    page: int
    size: int
    pages: int

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None 