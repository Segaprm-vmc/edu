# 🏍️ VMC Moto Education Portal

Современный образовательный портал для менеджеров VMC Moto с функциями управления каталогом мотоциклов, новостями, регламентами и сотрудниками.

## 🚀 Возможности

### Публичная часть:
- 📖 **Каталог мотоциклов** - 60-70 моделей с подробными характеристиками
- 🔍 **Поиск и фильтрация** - по техническим характеристикам
- 📸 **Галерея фотографий** - высококачественные изображения моделей
- 🎥 **Видео контент** - ссылки на YouTube, VK, Instagram, TikTok
- 📰 **Новости** - актуальная информация о продуктах
- 📋 **Регламенты** - нормативные документы
- 👥 **Сотрудники** - контакты и информация о команде
- 📱 **Адаптивный дизайн** - работает на всех устройствах

### Административная панель:
- 🔐 **Безопасная аутентификация** - защищенный доступ
- ⚙️ **CRUD операции** - управление всем контентом
- 📊 **Excel импорт/экспорт** - массовое управление характеристиками
- 📁 **Загрузка файлов** - фотографии, документы
- 🤖 **AI интеграция** - автоматическая классификация изображений
- ✍️ **Генерация контента** - автоматическое создание продающих текстов
- 👁️ **Управление видимостью** - включение/отключение разделов

## 🛠️ Технологический стек

### Backend:
- **FastAPI** - современный асинхронный веб-фреймворк
- **SQLAlchemy 2.0** - ORM с поддержкой async/await
- **PostgreSQL + asyncpg** - высокопроизводительная база данных
- **Pydantic v2** - валидация данных и схемы API
- **Alembic** - миграции базы данных
- **Pandas + OpenPyXL** - работа с Excel файлами

### Frontend:
- **React 18** - современная библиотека для UI
- **TypeScript** - статическая типизация
- **Vite** - быстрая сборка и hot reload
- **Tailwind CSS** - utility-first CSS фреймворк
- **React Hook Form** - эффективная работа с формами
- **React Query** - управление состоянием сервера
- **React Router** - клиентская маршрутизация

### AI & Интеграции:
- **Hugging Face** - модели машинного обучения
- **Vision Transformers** - классификация изображений мотоциклов
- **Context7** - актуальная документация библиотек

## 📦 Установка и запуск

### Требования:
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Git

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd edu2
```

### 2. Настройка Backend

```bash
# Переход в директорию backend
cd backend

# Создание виртуальной среды Python
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\\Scripts\\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Настройка базы данных PostgreSQL

```bash
# Создание базы данных
createdb vmcmoto_edu

# Запуск миграций (опционально, таблицы создаются автоматически)
alembic upgrade head
```

### 4. Настройка Frontend

```bash
# Переход в директорию frontend
cd ../frontend

# Установка зависимостей
npm install

# Создание production сборки (опционально)
npm run build
```

### 5. Запуск приложения

#### Backend (порт 8000):
```bash
cd backend
source venv/bin/activate  # если не активирована
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (порт 3000):
```bash
cd frontend
npm run dev
```

### 6. Доступ к приложению

- **Публичная часть**: http://localhost:3000
- **API документация**: http://localhost:8000/api/docs
- **Административная панель**: http://localhost:3000/admin
  - Пароль по умолчанию: `admin123` (можно изменить в .env)

## 📁 Структура проекта

```
edu2/
├── backend/                 # FastAPI приложение
│   ├── app/
│   │   ├── api/            # API роуты
│   │   │   ├── public.py   # Публичные эндпоинты
│   │   │   └── admin.py    # Административные эндпоинты
│   │   ├── core/           # Основные настройки
│   │   │   └── config.py   # Конфигурация приложения
│   │   ├── db/             # База данных
│   │   │   └── database.py # Подключение и сессии
│   │   ├── models/         # Модели данных
│   │   │   ├── database.py # SQLAlchemy модели
│   │   │   └── schemas.py  # Pydantic схемы
│   │   ├── services/       # Бизнес-логика
│   │   │   ├── auth.py     # Аутентификация
│   │   │   ├── file_manager.py # Работа с файлами
│   │   │   ├── excel_import.py # Excel импорт/экспорт
│   │   │   └── ai_integration.py # AI возможности
│   │   └── static/         # Статические файлы
│   │       └── uploads/    # Загруженные файлы
│   ├── main.py             # Точка входа FastAPI
│   ├── requirements.txt    # Python зависимости
│   └── env.example         # Пример настроек
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   │   ├── Layout.tsx  # Основной макет
│   │   │   └── MotorcycleSpecs.tsx # Технические характеристики
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API клиенты
│   │   │   └── api.ts      # Основной API сервис
│   │   └── utils/          # Утилиты
│   ├── package.json        # Node.js зависимости
│   ├── vite.config.ts      # Настройки Vite
│   ├── tailwind.config.js  # Настройки Tailwind
│   └── index.html          # HTML точка входа
└── README.md               # Этот файл
```

## 🎨 Дизайн и UI/UX

Проект реализует современный дизайн в стиле VMC Moto:
- 🎨 **Цветовая схема**: Красный #ff6b35, темно-серый #1a1a1a
- 📱 **Адаптивность**: Mobile-first подход
- ♿ **Доступность**: ARIA атрибуты, keyboard navigation
- ⚡ **Производительность**: Lazy loading, code splitting
- 🌙 **Темы**: Поддержка светлой и темной темы

## 🔧 Основные API эндпоинты

### Публичные:
- `GET /api/models` - Список моделей мотоциклов
- `GET /api/models/{id}` - Детали модели
- `GET /api/news` - Новости
- `GET /api/regulations` - Регламенты
- `GET /api/employees` - Сотрудники

### Административные:
- `POST /api/admin/auth/login` - Вход в админку
- `POST /api/admin/models` - Создание модели
- `PUT /api/admin/models/{id}` - Обновление модели
- `POST /api/admin/models/{id}/photos` - Загрузка фото
- `POST /api/admin/models/{id}/specs/import` - Импорт Excel

## 🤖 AI Возможности

### Классификация изображений:
- Автоматическое определение типа мотоцикла (спорт, круизер, эндуро)
- Анализ визуальных особенностей
- Рекомендации по характеристикам

### Генерация контента:
- Автоматическое создание продающих текстов
- Извлечение характеристик из документов
- Поиск похожих моделей

## 📊 Управление данными

### Excel интеграция:
- Импорт технических характеристик из .xlsx файлов
- Экспорт данных для редактирования
- Массовое обновление характеристик
- Валидация и обработка ошибок

### Форматы файлов:
- **Изображения**: JPG, PNG, WebP (до 10MB)
- **Документы**: PDF, DOC, DOCX, XLS, XLSX
- **Excel схема**: spec_name, spec_value, spec_unit

## 🚀 Развертывание в продакшене

### Docker (рекомендуется):
```bash
# Создание Docker images
docker build -t vmcmoto-backend ./backend
docker build -t vmcmoto-frontend ./frontend

# Запуск с docker-compose
docker-compose up -d
```

### Ручное развертывание:
1. Настройка PostgreSQL сервера
2. Настройка веб-сервера (Nginx)
3. Запуск backend через Gunicorn
4. Сборка и развертывание frontend

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте [документацию API](http://localhost:8000/api/docs)
2. Изучите примеры в директории `/examples`
3. Создайте Issue в репозитории
4. Свяжитесь с командой разработки

---

**Сделано с ❤️ для VMC Moto Education Portal** 