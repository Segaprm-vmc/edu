# Все модели удалены по запросу пользователя. Добавляйте новые модели ниже. 

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class Motorcycle(Base):
    __tablename__ = "motorcycles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    photos = relationship("MotorcyclePhoto", back_populates="motorcycle", cascade="all, delete-orphan")

class MotorcyclePhoto(Base):
    __tablename__ = "motorcycle_photos"
    id = Column(Integer, primary_key=True, index=True)
    motorcycle_id = Column(Integer, ForeignKey("motorcycles.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    motorcycle = relationship("Motorcycle", back_populates="photos") 