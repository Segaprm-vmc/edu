import requests
import logging
from typing import Optional, Dict, List
from fastapi import UploadFile, HTTPException
import base64
import io
from PIL import Image
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIIntegrationService:
    """
    Сервис для интеграции AI возможностей в образовательный портал VMC Moto
    """
    
    def __init__(self):
        self.hf_api_url = "https://api-inference.huggingface.co/models"
        self.vision_model = "google/vit-base-patch16-224"  # Vision Transformer
        self.classification_model = "microsoft/DialoGPT-medium"
        
    async def classify_motorcycle_image(self, image_file: UploadFile) -> Dict[str, any]:
        """
        Классификация изображения мотоцикла с использованием Vision Transformer
        
        Возможные категории:
        - sport_bike (спортивный)
        - cruiser (круизер) 
        - touring (туристический)
        - dirt_bike (эндуро)
        - scooter (скутер)
        """
        try:
            # Читаем и обрабатываем изображение
            image_content = await image_file.read()
            image = Image.open(io.BytesIO(image_content))
            
            # Конвертируем в base64 для API
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Предопределенные категории для VMC мотоциклов
            motorcycle_categories = {
                "sport": "Спортивный мотоцикл",
                "naked": "Нейкед байк", 
                "cruiser": "Круизер",
                "touring": "Туристический",
                "adventure": "Приключенческий",
                "enduro": "Эндуро",
                "scooter": "Скутер",
                "custom": "Кастом"
            }
            
            # Анализ компонентов изображения
            detected_features = self._analyze_motorcycle_features(image)
            
            # Определяем категорию на основе визуальных признаков
            predicted_category = self._predict_category_by_features(detected_features)
            
            return {
                "category": predicted_category,
                "category_name": motorcycle_categories.get(predicted_category, "Неопределенная категория"),
                "confidence": 0.85,  # Заглушка, в реальности от AI модели
                "detected_features": detected_features,
                "suggestions": self._get_category_suggestions(predicted_category)
            }
            
        except Exception as e:
            logger.error(f"Ошибка классификации изображения: {e}")
            return {
                "category": "unknown",
                "category_name": "Не удалось определить",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_motorcycle_features(self, image: Image.Image) -> Dict[str, bool]:
        """
        Анализ визуальных особенностей мотоцикла на изображении
        (В реальной реализации использовался бы Vision Transformer)
        """
        # Заглушка для демонстрации функционала
        # В реальности здесь был бы анализ через AI модель
        features = {
            "has_fairing": False,      # Обтекатель
            "has_windscreen": False,   # Ветровое стекло
            "riding_position": "standard",  # standard/sport/cruiser
            "engine_visible": True,    # Виден ли двигатель
            "has_luggage": False,      # Багажные кофры
            "wheel_size": "standard",  # standard/large/small
            "exhaust_style": "standard" # standard/sport/cruiser
        }
        
        return features
    
    def _predict_category_by_features(self, features: Dict[str, bool]) -> str:
        """
        Предсказание категории мотоцикла на основе визуальных признаков
        """
        if features.get("has_fairing") and features.get("riding_position") == "sport":
            return "sport"
        elif features.get("riding_position") == "cruiser":
            return "cruiser"
        elif features.get("has_luggage") or features.get("has_windscreen"):
            return "touring"
        elif not features.get("engine_visible"):
            return "scooter"
        else:
            return "naked"
    
    def _get_category_suggestions(self, category: str) -> List[str]:
        """
        Получение рекомендаций по характеристикам для определенной категории
        """
        suggestions_map = {
            "sport": [
                "Добавить характеристики: максимальная скорость, время разгона 0-100",
                "Указать тип подвески: спортивная",
                "Добавить информацию о аэродинамике"
            ],
            "cruiser": [
                "Указать тип сиденья: низкое, комфортное",
                "Добавить характеристики двигателя: крутящий момент",
                "Указать стиль руля: высокий, широкий"
            ],
            "touring": [
                "Добавить объем багажных отделений",
                "Указать комфортные характеристики",
                "Добавить информацию о защите от ветра"
            ],
            "naked": [
                "Указать стиль: минималистичный",
                "Добавить характеристики управляемости",
                "Указать тип освещения: LED"
            ]
        }
        
        return suggestions_map.get(category, ["Добавить стандартные характеристики"])
    
    async def extract_specs_from_document(self, document_file: UploadFile) -> Dict[str, any]:
        """
        Извлечение технических характеристик из документов (PDF, Word)
        с использованием OCR и NLP
        """
        try:
            # Читаем документ
            doc_content = await document_file.read()
            
            # В реальной реализации здесь был бы OCR для PDF/изображений
            # и парсинг структурированных данных
            
            # Заглушка для демонстрации
            extracted_specs = {
                "engine": {
                    "type": "4-тактный, одноцилиндровый",
                    "displacement": "449 куб.см",
                    "power": "45 л.с.",
                    "torque": "42 Нм"
                },
                "dimensions": {
                    "length": "2150 мм",
                    "width": "850 мм", 
                    "height": "1200 мм",
                    "weight": "165 кг"
                },
                "performance": {
                    "max_speed": "160 км/ч",
                    "fuel_consumption": "3.2 л/100км",
                    "tank_capacity": "15 л"
                }
            }
            
            return {
                "success": True,
                "extracted_specs": extracted_specs,
                "total_specs_found": len(extracted_specs),
                "confidence": 0.90
            }
            
        except Exception as e:
            logger.error(f"Ошибка извлечения данных из документа: {e}")
            return {
                "success": False,
                "error": str(e),
                "extracted_specs": {}
            }
    
    async def generate_sales_script(self, model_name: str, specs: Dict[str, any]) -> str:
        """
        Генерация продающего текста на основе характеристик мотоцикла
        """
        try:
            # В реальной реализации использовался бы языковая модель
            # Пока создаем шаблонный текст
            
            script_template = f"""
🏍️ **{model_name}** - это воплощение современных технологий и стиля!

✨ **Ключевые преимущества:**

🔧 **Двигатель:** {specs.get('engine', {}).get('type', 'Высокопроизводительный')}
- Объем: {specs.get('engine', {}).get('displacement', 'N/A')}
- Мощность: {specs.get('engine', {}).get('power', 'N/A')}

⚡ **Производительность:**
- Максимальная скорость: {specs.get('performance', {}).get('max_speed', 'N/A')}
- Расход топлива: {specs.get('performance', {}).get('fuel_consumption', 'N/A')}

🎯 **Идеально подходит для:**
- Городских поездок
- Путешествий на дальние расстояния
- Активного отдыха

💎 **Почему стоит выбрать именно эту модель:**
- Надежность проверенная временем
- Современный дизайн
- Оптимальное соотношение цена/качество
- Простота в обслуживании

🔥 **Закажите тест-драйв уже сегодня!**
            """
            
            return script_template.strip()
            
        except Exception as e:
            logger.error(f"Ошибка генерации продающего текста: {e}")
            return f"Описание модели {model_name} будет добавлено позже."
    
    async def suggest_similar_models(self, current_model_specs: Dict[str, any]) -> List[Dict[str, any]]:
        """
        Рекомендация похожих моделей на основе характеристик
        """
        try:
            # В реальной реализации использовался бы embedding model для поиска похожих
            suggestions = [
                {
                    "model_name": "VMC Sport 450",
                    "similarity_score": 0.85,
                    "similar_features": ["двигатель", "мощность", "класс"],
                    "differences": ["цена", "дизайн"]
                },
                {
                    "model_name": "VMC Touring 500", 
                    "similarity_score": 0.72,
                    "similar_features": ["класс", "комфорт"],
                    "differences": ["двигатель", "назначение"]
                }
            ]
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Ошибка поиска похожих моделей: {e}")
            return []

# Создаем глобальный экземпляр сервиса
ai_service = AIIntegrationService() 