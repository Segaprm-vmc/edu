from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib

from app.core.config import settings
from app.models import database as db_models
from app.models import schemas

# Контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Сервис аутентификации и авторизации"""
    
    def __init__(self):
        self.pwd_context = pwd_context
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Проверка пароля против хеша"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Получение хеша пароля"""
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Создание JWT токена доступа"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[dict]:
        """Проверка JWT токена"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: int = payload.get("user_id")
            if user_id is None:
                return None
            return payload
        except JWTError:
            return None

    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> Optional[db_models.AdminUser]:
        """Аутентификация пользователя"""
        try:
            # Поиск пользователя
            query = select(db_models.AdminUser).where(
                db_models.AdminUser.username == username,
                db_models.AdminUser.is_active == True
            ).options(
                selectinload(db_models.AdminUser.role)
            )
            result = await db.execute(query)
            user = result.scalars().first()
            
            if not user:
                return None
                
            # Проверка блокировки аккаунта
            if user.locked_until and user.locked_until > datetime.utcnow():
                raise HTTPException(
                    status_code=423,
                    detail=f"Аккаунт заблокирован до {user.locked_until.strftime('%H:%M %d.%m.%Y')}"
                )
            
            # Проверка пароля
            if not self.verify_password(password, user.password_hash):
                # Увеличиваем счетчик неудачных попыток
                await self._handle_failed_login(db, user)
                return None
            
            # Сброс счетчика неудачных попыток при успешном входе
            await self._handle_successful_login(db, user)
            
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            return None

    async def _handle_failed_login(self, db: AsyncSession, user: db_models.AdminUser):
        """Обработка неудачной попытки входа"""
        user.failed_login_attempts += 1
        
        # Блокировка после 5 неудачных попыток
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            
        await db.commit()

    async def _handle_successful_login(self, db: AsyncSession, user: db_models.AdminUser):
        """Обработка успешного входа"""
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        await db.commit()

    def check_permissions(self, user_permissions: List[str], required_permission: str) -> bool:
        """Проверка разрешений пользователя"""
        if "admin" in user_permissions:  # Админ имеет все права
            return True
        return required_permission in user_permissions

    async def get_current_user(self, db: AsyncSession, token: str) -> Optional[db_models.AdminUser]:
        """Получение текущего пользователя по токену"""
        payload = self.verify_token(token)
        if not payload:
            return None
            
        user_id = payload.get("user_id")
        if not user_id:
            return None
            
        query = select(db_models.AdminUser).where(
            db_models.AdminUser.id == user_id,
            db_models.AdminUser.is_active == True
        ).options(
            selectinload(db_models.AdminUser.role)
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def create_user(self, db: AsyncSession, user_data: schemas.AdminUserCreate, created_by_id: int) -> db_models.AdminUser:
        """Создание нового пользователя"""
        # Проверка уникальности username и email
        existing_query = select(db_models.AdminUser).where(
            (db_models.AdminUser.username == user_data.username) |
            (db_models.AdminUser.email == user_data.email)
        )
        existing = await db.execute(existing_query)
        if existing.scalars().first():
            raise HTTPException(
                status_code=400,
                detail="Пользователь с таким username или email уже существует"
            )
        
        # Хеширование пароля
        hashed_password = self.get_password_hash(user_data.password)
        
        # Создание пользователя
        db_user = db_models.AdminUser(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=hashed_password,
            role_id=user_data.role_id,
            is_active=user_data.is_active,
            is_verified=user_data.is_verified,
            created_by=created_by_id
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def change_password(self, db: AsyncSession, user: db_models.AdminUser, old_password: str, new_password: str):
        """Смена пароля пользователя"""
        if not self.verify_password(old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Неверный текущий пароль")
        
        user.password_hash = self.get_password_hash(new_password)
        user.password_changed_at = datetime.utcnow()
        await db.commit()

class AuditService:
    """Сервис логирования действий"""
    
    @staticmethod
    async def log_action(
        db: AsyncSession,
        user_id: int,
        action: str,
        resource_type: str = None,
        resource_id: str = None,
        description: str = None,
        request: Request = None,
        request_data: dict = None
    ):
        """Логирование действия пользователя"""
        try:
            # Извлечение данных из запроса
            ip_address = None
            user_agent = None
            
            if request:
                ip_address = request.client.host if request.client else None
                user_agent = request.headers.get("User-Agent")
            
            # Очистка чувствительных данных
            clean_request_data = None
            if request_data:
                clean_request_data = {
                    k: v for k, v in request_data.items() 
                    if k not in ['password', 'password_hash', 'token', 'secret']
                }
            
            # Создание записи в логах
            audit_log = db_models.AdminAuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id else None,
                description=description,
                ip_address=ip_address,
                user_agent=user_agent,
                request_data=clean_request_data
            )
            
            db.add(audit_log)
            await db.commit()
            
        except Exception as e:
            # Не прерываем выполнение основной логики из-за ошибки логирования
            print(f"Ошибка логирования: {e}")

# Экземпляры сервисов
auth_service = AuthService()
audit_service = AuditService()

# Функции обратной совместимости
def verify_admin_password(password: str) -> bool:
    """Проверка простого пароля администратора (для обратной совместимости)"""
    return password == settings.ADMIN_PASSWORD

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля против хеша"""
    return auth_service.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Получение хеша пароля"""
    return auth_service.get_password_hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена доступа"""
    return auth_service.create_access_token(data, expires_delta)

def verify_token(token: str) -> Optional[dict]:
    """Проверка JWT токена"""
    return auth_service.verify_token(token) 