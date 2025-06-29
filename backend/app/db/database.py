from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncEngine, 
    AsyncSession, 
    async_sessionmaker,
    create_async_engine
)
from sqlalchemy.pool import AsyncAdaptedQueuePool
from app.core.config import settings

class DatabaseSessionManager:
    """Manages asynchronous DB sessions with connection pooling."""
    
    def __init__(self) -> None:
        self.engine: Optional[AsyncEngine] = None
        self.session_factory: Optional[async_sessionmaker[AsyncSession]] = None

    def init_db(self) -> None:
        """Initialize the database engine and session factory."""
        self.engine = create_async_engine(
            settings.DATABASE_URL,
            poolclass=AsyncAdaptedQueuePool,
            pool_size=settings.POOL_SIZE,
            max_overflow=settings.MAX_OVERFLOW,
            pool_pre_ping=True,
            pool_recycle=settings.POOL_RECYCLE,
            echo=settings.DEBUG,
        )

        self.session_factory = async_sessionmaker(
            self.engine,
            expire_on_commit=False,
            autoflush=False,
            class_=AsyncSession,
        )

    async def close(self) -> None:
        """Dispose of the database engine."""
        if self.engine:
            await self.engine.dispose()
            self.engine = None
            self.session_factory = None

    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Yield a database session."""
        if not self.session_factory:
            raise RuntimeError("Database session factory is not initialized.")

        async with self.session_factory() as session:
            try:
                yield session
            except Exception as e:
                await session.rollback()
                raise RuntimeError(f"Database session error: {e!r}") from e

# Global instance
sessionmanager = DatabaseSessionManager()

# Dependency для получения сессии базы данных
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Database dependency for FastAPI endpoints."""
    async with sessionmanager.get_session() as session:
        yield session

# Создание всех таблиц
async def create_tables():
    """Create all database tables."""
    from app.models.database import Base
    
    if not sessionmanager.engine:
        raise RuntimeError("Database engine is not initialized.")
    
    async with sessionmanager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all) 