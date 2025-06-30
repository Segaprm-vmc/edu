from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional, List
import datetime

class Base(DeclarativeBase):
    pass

class Model(Base):
    __tablename__ = "models"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    sales_script: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Отношения
    videos: Mapped[List["ModelVideo"]] = relationship("ModelVideo", back_populates="model", cascade="all, delete-orphan")
    photos: Mapped[List["ModelPhoto"]] = relationship("ModelPhoto", back_populates="model", cascade="all, delete-orphan")
    specs: Mapped[List["ModelSpec"]] = relationship("ModelSpec", back_populates="model", cascade="all, delete-orphan")

class ModelVideo(Base):
    __tablename__ = "model_videos"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("models.id"))
    title: Mapped[Optional[str]] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(500))
    video_type: Mapped[Optional[str]] = mapped_column(String(50))  # youtube, vk, instagram, tiktok
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    model: Mapped["Model"] = relationship("Model", back_populates="videos")

class ModelPhoto(Base):
    __tablename__ = "model_photos"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("models.id"))
    filename: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[Optional[str]] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[Optional[int]]
    is_primary: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    model: Mapped["Model"] = relationship("Model", back_populates="photos")

class ModelSpec(Base):
    __tablename__ = "model_specs"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("models.id"))
    spec_name: Mapped[str] = mapped_column(String(255))
    spec_value: Mapped[str] = mapped_column(String(500))
    spec_unit: Mapped[Optional[str]] = mapped_column(String(50))
    category: Mapped[Optional[str]] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    model: Mapped["Model"] = relationship("Model", back_populates="specs")

class News(Base):
    __tablename__ = "news"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    author: Mapped[Optional[str]] = mapped_column(String(255))
    is_published: Mapped[bool] = mapped_column(default=False)
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Отношения
    photos: Mapped[List["NewsPhoto"]] = relationship("NewsPhoto", back_populates="news", cascade="all, delete-orphan")
    documents: Mapped[List["NewsDocument"]] = relationship("NewsDocument", back_populates="news", cascade="all, delete-orphan")

class NewsPhoto(Base):
    __tablename__ = "news_photos"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    news_id: Mapped[int] = mapped_column(ForeignKey("news.id"))
    filename: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[Optional[str]] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[Optional[int]]
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    news: Mapped["News"] = relationship("News", back_populates="photos")

class NewsDocument(Base):
    __tablename__ = "news_documents"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    news_id: Mapped[int] = mapped_column(ForeignKey("news.id"))
    filename: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[Optional[int]]
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    news: Mapped["News"] = relationship("News", back_populates="documents")

class Regulation(Base):
    __tablename__ = "regulations"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    is_published: Mapped[bool] = mapped_column(default=False)
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Отношения
    photos: Mapped[List["RegulationPhoto"]] = relationship("RegulationPhoto", back_populates="regulation", cascade="all, delete-orphan")
    documents: Mapped[List["RegulationDocument"]] = relationship("RegulationDocument", back_populates="regulation", cascade="all, delete-orphan")

class RegulationPhoto(Base):
    __tablename__ = "regulation_photos"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    regulation_id: Mapped[int] = mapped_column(ForeignKey("regulations.id"))
    filename: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[Optional[str]] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[Optional[int]]
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    regulation: Mapped["Regulation"] = relationship("Regulation", back_populates="photos")

class RegulationDocument(Base):
    __tablename__ = "regulation_documents"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    regulation_id: Mapped[int] = mapped_column(ForeignKey("regulations.id"))
    filename: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[Optional[int]]
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Отношения
    regulation: Mapped["Regulation"] = relationship("Regulation", back_populates="documents")

class Employee(Base):
    __tablename__ = "employees"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    position: Mapped[str] = mapped_column(String(255))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    description: Mapped[Optional[str]] = mapped_column(Text)
    photo_path: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

class SectionVisibility(Base):
    __tablename__ = "section_visibility"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    section_name: Mapped[str] = mapped_column(String(50), unique=True)  # news, regulations, employees
    is_visible: Mapped[bool] = mapped_column(default=True)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now()) 