# 📘 Connecto — Полная документация проекта

**Connecto** — это веб-приложение для нетворкинга на мероприятиях. Платформа позволяет организаторам создавать мероприятия, участникам — находить друг друга по интересам, обмениваться запросами на знакомство и формировать список контактов.

---

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Быстрый запуск](#быстрый-запуск)
3. [Архитектура](#архитектура)
4. [Технологический стек](#технологический-стек)
5. [Структура проекта](#структура-проекта)
6. [Серверная часть (Backend)](#серверная-часть-backend)
   - [server.js — точка входа](#serverjs--точка-входа)
   - [db.js — подключение к БД](#dbjs--подключение-к-бд)
   - [Модели данных](#модели-данных)
   - [Маршруты](#маршруты-routes)
   - [Контроллеры](#контроллеры-controllers)
   - [Middleware / privacy.js](#middleware--privacyjs)
   - [Утилиты / normalizeProfession.js](#утилиты--normalizeprofessionjs)
   - [Swagger](#swagger)
   - [Seed / начальные данные](#seed--начальные-данные)
7. [Клиентская часть (Frontend)](#клиентская-часть-frontend)
   - [main.tsx — точка входа](#maintsx--точка-входа)
   - [App.tsx — маршрутизация](#apptsx--маршрутизация)
   - [Компоненты](#компоненты)
   - [Страницы (Pages)](#страницы-pages)
   - [Сервисы](#сервисы-services)
   - [Стилизация](#стилизация-indexcss)
   - [Конфигурация Vite и Tailwind](#конфигурация-vite-и-tailwind)
8. [API endpoints — полный справочник](#api-endpoints--полный-справочник)
9. [Сценарии использования (User Flows)](#сценарии-использования-user-flows)
10. [База данных](#база-данных)
11. [Развёртывание](#развёртывание)
    - [Docker Compose](#docker-compose)
    - [Локальный запуск без Docker](#локальный-запуск-без-docker)
    - [Dockerfile (мультистейдж)](#dockerfile-мультистейдж-сборка)
    - [CI/CD (GitLab CI)](#cicd-gitlab-ci)
12. [Безопасность и приватность](#безопасность-и-приватность)
13. [Переменные окружения](#переменные-окружения)
14. [Планы и возможные улучшения](#планы-и-возможные-улучшения)

---

## Обзор проекта

Connecto решает проблему нетворкинга на офлайн-мероприятиях. Традиционные бейджи с именем не дают достаточно информации для начала разговора. Connecto позволяет:

- **Участникам**: создать цифровой профиль с интересами, сканировать QR-код мероприятия, просматривать ленту участников, получать рекомендации на основе общих интересов, отправлять запросы на знакомство, формировать список контактов.
- **Организаторам**: создавать мероприятия, генерировать код доступа и QR-код, отслеживать статистику (количество участников, количество знакомств).

### Ключевые возможности

| Возможность | Описание |
|---|---|
| Создание профиля | Имя, возраст, профессия, интересы (до 5 тегов), Telegram |
| Создание мероприятия | Название, описание, даты, теги, генерация кода доступа и QR |
| Вход на мероприятие | По 6-значному коду или QR-коду |
| Лента участников | Просмотр всех участников мероприятия |
| Рекомендации | Алгоритм подбора на основе общих интересов и возраста |
| Запросы на знакомство | Отправка/принятие/отклонение запросов |
| Контакты | После взаимного одобрения — раскрытие Telegram |
| Статистика | Количество участников, запросов и знакомств |
| Профиль | Редактирование, история активности, список мероприятий |

---

## Быстрый запуск

### Через Docker (рекомендуется)

```bash
# Убедитесь, что установлены Docker и Docker Compose
docker --version
docker-compose --version

# Клонируйте репозиторий
git clone <url> connecto
cd connecto

# Создайте .env (если нужно изменить настройки)
cp .env.example .env

# Запустите
docker-compose up --build

# Откройте браузер
# http://localhost:3000
# http://localhost:3000/api-docs (Swagger)
```

Docker Compose поднимает два контейнера:
- **db** — PostgreSQL 15 (с healthcheck)
- **api** — Node.js приложение (зависит от db)

### Без Docker

```bash
# 1. Установите PostgreSQL (или пропустите — будет SQLite)
# 2. Настройте server/.env:
#    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meetpoint
#    PORT=3001
#    CLIENT_URL=http://localhost:5173

# 3. Установите зависимости сервера и запустите
cd server
npm install
npm run dev          # порт 3001

# 4. В другом терминале — клиент
cd client
npm install
npm run dev          # порт 5173

# 5. Откройте http://localhost:5173
```

**Важно:** Без PostgreSQL сервер автоматически переключается на SQLite. Все данные хранятся в `server/dev.sqlite`.

---

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + Vite)                    │
│  Pages: Home, CreateProfile, JoinByCode, CreateEvent,       │
│  EventDashboard, Lenta, Match, Requests, Contacts,          │
│  Profile, EditEvent, OrganizerProfile, ParticipantProfile   │
│  Components: Layout, ProfessionInput, ProtectedRoute,       │
│              QRCodeDisplay                                   │
│  Services: api.ts (axios), userStorage.ts (localStorage)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (Vite proxy /api → :3001)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Server (Express.js)                       │
│  Routes: /api/users/*, /api/events/*                         │
│  Controllers: userController, eventController                │
│  Middleware: privacy.js (filterContacts)                     │
│  Utils: normalizeProfession.js                               │
│  Swagger: /api-docs                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Sequelize ORM
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL / SQLite (auto-fallback)              │
│  Tables: users, events, interests                            │
└──────────────────────────────────────────────────────────────┘
```

В продакшене сервер раздаёт статику React (собранную в `client/dist` → `server/public`) через `express.static`. В режиме разработки Vite работает на порту 5173 с проксированием `/api` на сервер (`:3001`).

---

## Технологический стек

### Backend

| Технология | Назначение |
|---|---|
| **Node.js** | Среда выполнения |
| **Express.js** | HTTP-фреймворк |
| **Sequelize** | ORM для работы с БД |
| **PostgreSQL 15** | Основная БД (продакшен) |
| **SQLite** | Локальная БД (разработка, fallback) |
| **Swagger (swagger-jsdoc + swagger-ui-express)** | Документация API |
| **bcryptjs** | Хеширование паролей (зарезервировано) |
| **qrcode** | Генерация QR-кодов на сервере |
| **uuid** | Генерация уникальных идентификаторов |
| **deasync** | Синхронное ожидание подключения к БД |
| **dotenv** | Переменные окружения |
| **cors** | CORS-заголовки |
| **nodemon** | Автоматическая перезагрузка (dev) |

### Frontend

| Технология | Назначение |
|---|---|
| **React 18** | UI-библиотека |
| **TypeScript** | Типизация |
| **Vite 5** | Сборщик / dev-сервер |
| **React Router DOM v6** | Клиентская маршрутизация |
| **Tailwind CSS 3** | CSS-фреймворк (утилитарные классы) |
| **Axios** | HTTP-клиент |
| **lucide-react** | Иконки |
| **react-hot-toast** | Уведомления (toast) |
| **react-datepicker** | Выбор дат |
| **qrcode.react** | Отображение QR-кодов |
| **html5-qrcode** | Сканирование QR-кодов с камеры |
| **prop-types** | Проверка типов (для JSX-файлов) |
| **PostCSS / Autoprefixer** | Обработка CSS |

### Инфраструктура

| Технология | Назначение |
|---|---|
| **Docker / Docker Compose** | Контейнеризация |
| **GitLab CI** | CI/CD |
| **Kaniko** | Сборка Docker-образа (без Docker daemon) |

---

## Структура проекта

```
hitmandav-repository/
├── client/                          # React-приложение (Frontend)
│   ├── dist/                        # Собранная статика (build)
│   ├── public/                      # Публичные ресурсы
│   ├── src/
│   │   ├── components/              # Переиспользуемые компоненты
│   │   │   ├── Layout.tsx           #   Обёртка с навигацией
│   │   │   ├── ProfessionInput.tsx  #   Инпут профессии с автодополнением
│   │   │   ├── ProtectedRoute.tsx   #   Защита маршрутов
│   │   │   └── QRCodeDisplay.tsx    #   Отображение QR-кода
│   │   ├── pages/                   # Страницы приложения
│   │   │   ├── Home.tsx             #   Главная
│   │   │   ├── CreateProfile.tsx    #   Создание профиля
│   │   │   ├── JoinByCode.tsx       #   Вход по коду/QR
│   │   │   ├── CreateEvent.tsx      #   Создание мероприятия
│   │   │   ├── EventDashboard.tsx   #   Дашборд мероприятия
│   │   │   ├── Lenta.tsx            #   Лента участников
│   │   │   ├── Match.tsx            #   Страница мероприятия
│   │   │   ├── Requests.tsx         #   Входящие запросы
│   │   │   ├── Contacts.tsx         #   Мои контакты
│   │   │   ├── Profile.tsx          #   Профиль участника
│   │   │   ├── EditEvent.tsx        #   Редактирование мероприятия
│   │   │   ├── OrganizerProfile.tsx #   Профиль организатора
│   │   │   └── ParticipantProfile.jsx # Демо-профиль
│   │   ├── services/                # Сервисы
│   │   │   ├── api.ts               #   HTTP-клиент (Axios)
│   │   │   └── userStorage.ts       #   Локальное хранилище сессии
│   │   ├── App.tsx                  # Корневой компонент с роутингом
│   │   ├── main.tsx                 # Точка входа
│   │   ├── index.css                # Глобальные стили + Tailwind
│   │   └── jsx-imports.d.ts         # Декларация для .jsx модулей
│   ├── index.html                   # HTML-шаблон Vite
│   ├── vite.config.ts               # Конфигурация Vite
│   ├── tailwind.config.js           # Конфигурация Tailwind
│   ├── postcss.config.js            # Конфигурация PostCSS
│   ├── tsconfig.json                # Конфигурация TypeScript
│   ├── tsconfig.node.json           # TS для Node.js окружения
│   ├── vite-env.d.ts                # Типы Vite
│   ├── package.json
│   └── package-lock.json
├── server/                          # Express-приложение (Backend)
│   ├── controllers/
│   │   ├── userController.js        #   Работа с пользователями
│   │   └── eventController.js       #   Работа с мероприятиями
│   ├── middleware/
│   │   └── privacy.js               #   Фильтрация контактов
│   ├── models/
│   │   ├── index.js                 #   Инициализация связей моделей
│   │   ├── User.js                  #   Модель пользователя
│   │   ├── Event.js                 #   Модель мероприятия
│   │   └── Interest.js              #   Модель запроса на знакомство
│   ├── routes/
│   │   ├── users.js                 #   Маршруты пользователей
│   │   └── events.js                #   Маршруты мероприятий
│   ├── utils/
│   │   └── normalizeProfession.js   #   Нормализация профессий
│   ├── .env                         # Переменные окружения
│   ├── db.js                        # Подключение к БД (Sequelize)
│   ├── server.js                    # Точка входа сервера
│   ├── swagger.js                   # Конфигурация Swagger
│   ├── seed.js                      # Скрипт наполнения БД
│   ├── package.json
│   └── package-lock.json
├── docs/                            # Дополнительная документация
├── docker-compose.yml               # Docker Compose (сервер + PostgreSQL)
├── Dockerfile                       # Мультистейдж Docker-сборка
├── .gitlab-ci.yml                   # GitLab CI/CD
├── .env.example                     # Пример переменных окружения
├── .dockerignore                    # Исключения для Docker
├── .gitignore                       # Исключения для Git
├── README.md                        # Этот файл — полная документация
└── server_public_index.html         # HTML для продакшен-статики (легаси)
```

---

## Серверная часть (Backend)

### server.js — точка входа

Файл: `server/server.js`

Сервер запускается на порту, указанном в `PORT` (по умолчанию `3000`). Последовательность инициализации:

1. Загрузка переменных окружения через `dotenv`
2. Создание Express-приложения
3. Подключение middleware: `cors()`, `express.json()`
4. Логгер запросов (метод, URL, статус, время выполнения)
5. Монтирование роутов: `/api/events`, `/api/users`
6. Монтирование Swagger UI на `/api-docs`
7. Раздача статики из `server/public`
8. SPA fallback: все остальные маршруты отдают `index.html`
9. Глобальный обработчик ошибок
10. Подключение к БД (`db.authenticate()`) и синхронизация схемы (`db.sync({ alter: true })`)
11. Запуск HTTP-сервера

**Глобальный обработчик ошибок:**

| Тип ошибки | HTTP-статус |
|---|---|
| `SequelizeForeignKeyConstraintError` | 409 |
| `SequelizeValidationError` | 400 |
| Ошибка с `statusCode` / `status` | Соответствующий код |
| Все остальные | 500 (сообщение: "Внутренняя ошибка сервера") |

### db.js — подключение к БД

Файл: `server/db.js`

Реализован **автоматический fallback**:
1. Попытка подключиться к PostgreSQL по `DATABASE_URL`
2. Если PostgreSQL недоступен — переключение на SQLite (`dev.sqlite`)

Такая схема удобна для разработки: не требуется поднимать PostgreSQL локально.

### Модели данных

Файлы: `server/models/`

#### User (пользователь) — таблица `users`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | Уникальный идентификатор |
| `firstName` | STRING | NOT NULL | Имя |
| `middleName` | STRING | | Отчество (опционально) |
| `age` | INTEGER | | Возраст |
| `profession` | STRING | | Профессия / роль |
| `hobbies` | JSON | default: [] | Массив интересов/тегов (JSON для совместимости с SQLite) |
| `contact` | STRING | NOT NULL, UNIQUE | Контакт (Telegram @username) |
| `eventId` | INTEGER | FK → events.id | ID мероприятия |
| `isGuest` | BOOLEAN | default: false | Флаг гостевого пользователя |
| `createdAt` | DATE | auto | Дата создания |
| `updatedAt` | DATE | auto | Дата обновления |

**Виртуальные поля** (добавляются через `afterFind` hook):
- `name` = `firstName`
- `role` = `profession`
- `tags` = `hobbies`

#### Event (мероприятие) — таблица `events`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | Уникальный идентификатор |
| `title` | STRING | NOT NULL | Название мероприятия |
| `start_date` | DATEONLY | NOT NULL | Дата начала |
| `end_date` | DATEONLY | NOT NULL | Дата окончания |
| `description` | TEXT | | Описание |
| `tags` | JSON | default: [] | Теги мероприятия (категории) |
| `organizerId` | STRING | NOT NULL | ID организатора |
| `qrCode` | STRING | default: UUID | Уникальный UUID для QR-кода |
| `accessCode` | STRING | NOT NULL | 6-значный код доступа |
| `duration_days` | INTEGER | default: 1 | Длительность в днях |
| `expires_at` | DATE | | Дата истечения (end_date + 1 день) |
| `createdAt` | DATE | auto | |
| `updatedAt` | DATE | auto | |

#### Interest (запрос на знакомство) — таблица `interests`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | |
| `status` | STRING | default: 'pending' | 'pending' / 'accepted' / 'rejected' |
| `fromUserId` | INTEGER | FK → users.id, NOT NULL | Кто отправил |
| `toUserId` | INTEGER | FK → users.id, NOT NULL | Кому отправили |
| `createdAt` | DATE | auto | |
| `updatedAt` | DATE | auto | |

**Индексы:** `fromUserId`, `toUserId`, составной `(fromUserId, toUserId, status)`

#### Связи моделей

```js
Event.hasMany(User, { foreignKey: 'eventId' });        // Event → User: 1 ко многим
User.belongsTo(Event, { foreignKey: 'eventId' });        // User → Event: многие к 1

Interest.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Interest.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
```

### Маршруты (Routes)

#### users.js — работа с пользователями

Префикс: `/api/users`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/profile` | Создать профиль |
| PUT | `/profile/:userId` | Обновить профиль |
| POST | `/register-to-event` | Зарегистрироваться на мероприятие |
| GET | `/event/:eventId/registered` | Список участников мероприятия |
| GET | `/event/:eventId/joined` | Список контактов пользователя на мероприятии |
| GET | `/event/:eventId/recommendations` | Рекомендации участников |
| POST | `/interest` | Отправить запрос на знакомство |
| PUT | `/interest` | Ответить на запрос (accept/reject) |
| GET | `/professions/list` | Список нормализованных профессий |
| GET | `/:userId/incoming-requests` | Входящие запросы |
| GET | `/:userId/contacts` | Список контактов (взаимные) |
| GET | `/:userId(\\d+)` | Получить профиль по ID |
| GET | `/:userId(\\d+)/liked-me` | Кто лайкнул пользователя |

**Важно:** Специфичные роуты (например, `/professions/list`) объявлены **до** `/:userId`, чтобы избежать конфликта. Числовой ID использует регулярное выражение `(\\d+)`.

#### events.js — работа с мероприятиями

Префикс: `/api/events`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/` | Создать мероприятие |
| GET | `/qr/:qr` | Найти по QR-коду (UUID) |
| GET | `/code/:code` | Найти по коду доступа |
| GET | `/:eventId` | Получить по ID |
| PUT | `/:eventId` | Обновить мероприятие |
| GET | `/:eventId/stats` | Статистика |

### Контроллеры (Controllers)

#### userController.js

Файл: `server/controllers/userController.js`

| Функция | Назначение |
|---|---|
| `createProfile` | Создание пользователя. Проверяет уникальность контакта. Если это гость — обновляет существующую запись. |
| `updateProfile` | Обновление полей. Нормализует профессию. |
| `registerToEvent` | Регистрация на мероприятие. Проверяет: существует ли event, не истёк ли, не участвует ли уже на другом. |
| `getProfile` | Полный профиль + мероприятие + лента активности (отправленные/полученные запросы). |
| `requestInterest` | Создание запроса. Запрет самому себе. Проверка дубликатов. |
| `respondInterest` | Ответ: accept (взаимный контакт с раскрытием Telegram) или reject. |
| `incomingRequests` | Входящие запросы со статусом 'pending'. |
| `myContacts` | Все взаимные контакты (accepted). |
| `getLikedMe` | Кто лайкнул пользователя (pending-запросы к нему). |
| `list` | Список участников мероприятия (с фильтрацией контактов). |
| `joinedList` | Список тех, с кем уже есть взаимный контакт. |
| `recommendations` | Алгоритм рекомендаций (см. ниже). |
| `getProfessions` | Список доступных профессий. |

**Алгоритм рекомендаций:**

```js
score = commonTags * 2 + ageScore - customTagsCount * 0.5
```

- `commonTags` — количество общих тегов (из предустановленного набора)
- `ageScore` — 1 (разница ≤ 5 лет), 0.5 (≤ 10), 0 (иначе или нет данных)
- `customTagsCount` — количество кастомных (нестандартных) тегов

#### eventController.js

Файл: `server/controllers/eventController.js`

| Функция | Назначение |
|---|---|
| `create` | Создание мероприятия. Генерация уникального 6-значного кода. Генерация QR-кода. `expires_at = end_date + 1 день`. |
| `getByQR` | Поиск по UUID (qrCode). Проверка истечения → 410. |
| `getByCode` | Поиск по коду доступа. Проверка истечения → 410. |
| `getById` | Поиск по ID. |
| `update` | Обновление: название, описание, даты, теги. |
| `stats` | Статистика: `{ usersCount, requestsSent, requestsAccepted, contactsMade }`. |

### Middleware / privacy.js

Файл: `server/middleware/privacy.js`

**`filterContacts(userId, targetUser)`** — функция приватности.

- Если между пользователями **нет** взаимного интереса (status: 'accepted') — поле `contact` (Telegram) удаляется из ответа.
- Если взаимный контакт **есть** — данные показываются полностью.

Применяется ко всем спискам: участники, рекомендации, "кто лайкнул меня".

### Утилиты / normalizeProfession.js

Файл: `server/utils/normalizeProfession.js`

**`normalizeProfession(profession)`** — нормализует название профессии. Карта включает 55+ вариантов:

| Ввод | Результат |
|---|---|
| "frontend", "фронтенд", "front-end" | "Frontend" |
| "backend", "бэкенд", "back-end" | "Backend" |
| "fullstack", "фулстек" | "Fullstack" |
| "data scientist", "дата сайентист" | "Data Scientist" |
| "pm", "продакт менеджер" | "Product Manager" |
| "дизайнер", "designer" | "Designer" |
| "qa", "тестировщик" | "QA Engineer" |
| и т.д. (всего 55+) | |

Если не найдено — возвращается с заглавной буквы.

**`getAllNormalizedProfessions()`** — возвращает уникальный список (используется для автодополнения на клиенте).

### Swagger

Файл: `server/swagger.js`

Доступен по адресу: `http://localhost:3000/api-docs`
Настроен через `swagger-jsdoc` + `swagger-ui-express`.

### Seed / начальные данные

Файл: `server/seed.js`. Запуск: `npm run seed`

Создаёт:
- Мероприятие: "PROD Hackathon Minsk 2026"
- Участников: Алиса (Frontend), Дима (Data Scientist), Елена (Product Manager)

**Внимание:** использует `db.sync({ force: true })` — все данные удаляются!

---

## Клиентская часть (Frontend)

### main.tsx — точка входа

Файл: `client/src/main.tsx`

Перед рендером проверяет сессию (7 дней TTL). Если активна — восстанавливает `currentUserId` и `currentEventId` в `localStorage`.

### App.tsx — маршрутизация

Файл: `client/src/App.tsx`

| Путь | Компонент | Layout | Описание |
|---|---|---|---|
| `/` | Home | Нет | Главная страница |
| `/profile/create` | CreateProfile | Нет | Создание/редактирование профиля |
| `/profile` | Profile | Нет | Просмотр профиля |
| `/join` | JoinByCode | Нет | Вход по коду |
| `/join/:qr` | JoinByCode | Нет | Вход по QR-ссылке |
| `/create` | CreateEvent | Нет | Создание мероприятия |
| `/event/:eventId` | EventDashboard | Да | Дашборд мероприятия |
| `/event/:eventId/edit` | EditEvent | Да | Редактирование мероприятия |
| `/lenta/:eventId` | Lenta | Да | Лента участников |
| `/requests` | Requests | Да | Входящие запросы |
| `/contacts` | Contacts | Да | Мои контакты |
| `/match/:eventId` | Match | Да | Страница мероприятия |
| `/match` | Match | Нет | Страница мероприятия (без ID) |
| `/organizer/profile` | OrganizerProfile | Да | Профиль организатора |
| `/participant/profile` | ParticipantProfile | Да | Демо-профиль участника |

### Компоненты

#### Layout (`client/src/components/Layout.tsx`)

Общий шаблон:
- **Верхний хедер**: логотип Connecto, ссылки "Создать" и "Профиль"
- **Контент** (children)
- **Нижняя навигация** (только мобильные, `< sm`): Главная, Создать, Войти, Запросы, Профиль
- Активный раздел подсвечивается на основе текущего URL

#### ProfessionInput (`client/src/components/ProfessionInput.tsx`)

Инпут с автодополнением. При вводе загружает список профессий с `/users/professions/list`, показывает до 6 подсказок. Click-outside для закрытия.

#### ProtectedRoute (`client/src/components/ProtectedRoute.tsx`)

Проверяет `currentUserId` / `organizerId`. Если нет — редирект на `/`.

**Примечание:** В текущей версии не используется в маршрутах.

#### QRCodeDisplay (`client/src/components/QRCodeDisplay.tsx`)

Отображает QR-код через `QRCodeSVG` (библиотека `qrcode.react`). Размер: 220px.

### Страницы (Pages)

#### Home — главная страница

Файл: `client/src/pages/Home.tsx`

Градиентный фон (бирюзовый), логотип "Connecto", кнопка **"Войти по коду"** (→ `/join`). В правом верхнем углу кнопки: Создать, Профиль, Войти.

#### CreateProfile — создание профиля

Файл: `client/src/pages/CreateProfile.tsx`

Форма с полями:
- **Имя** (обязательное)
- **Возраст** (числовой)
- **Роль/должность**
- **Теги интересов** (до 5): выбор из `frontend`, `backend`, `дизайн`, `AI`, `fintech`, `карьера`, `стартапы`, `аналитика` + кастомные
- **Telegram** (обязательный, @username)

Валидация:
- Telegram: только латиница, цифры и `_`, минимум 3 символа после @
- Автоматическая вставка @ в начале

Логика: загружает существующий профиль, если есть `currentUserId`. PUT если ID есть, POST если новый. Сохраняет в localStorage.

#### JoinByCode — вход по коду

Файл: `client/src/pages/JoinByCode.tsx`

Два способа входа:
1. **Сканировать QR-код** через камеру (`html5-qrcode`)
2. **Ввести 6-значный код** (только цифры)

Автоматическое определение: UUID → `/events/qr/:qr`, цифры → `/events/code/:code`. После входа — редирект на `/lenta/:eventId`.

#### CreateEvent — создание мероприятия

Файл: `client/src/pages/CreateEvent.tsx`

Форма: название, описание, даты (DatePicker), теги (10 предустановленных + кастомные). После создания — модальное окно с QR-кодом, кодом доступа и кнопкой копирования.

#### EventDashboard — дашборд мероприятия

Файл: `client/src/pages/EventDashboard.tsx`

Отображает: название, даты, описание, **код доступа** (с копированием), **QR-код** (модальное окно), **статистику** (участники, знакомства, запросы), кнопки "Лента" и "Редактировать".

#### Lenta — лента участников

Файл: `client/src/pages/Lenta.tsx`

Три вкладки:
1. **👥 Участники** — все участники
2. **✨ Рекомендации** — сортировка по алгоритму
3. **🤝 Мои контакты** — взаимные контакты

Функции: поиск по тегу, отправка запроса, авто-опрос `liked-me` каждые 10 секунд, модальное окно при получении лайка (с кнопками "Лайкнуть обратно" / "Пропустить"), бейдж общих интересов.

#### Match — страница мероприятия

Файл: `client/src/pages/Match.tsx`

Карточка мероприятия (название, описание, даты, теги), кнопка "Присоединиться", поиск по имени/профессии, список участников с аватарами. Telegram показывается только при взаимном контакте.

#### Requests — входящие запросы

Файл: `client/src/pages/Requests.tsx`

Список входящих запросов (pending). Для каждого: имя, роль, кнопки "Принять" / "Пропустить".

#### Contacts — мои контакты

Файл: `client/src/pages/Contacts.tsx`

Список взаимных контактов: имя, роль, Telegram (активная ссылка `t.me/username`).

#### Profile — профиль участника

Файл: `client/src/pages/Profile.tsx`

Три вкладки:
1. **Мероприятия** — список с датами, переход по клику
2. **Активность** — лента действий (запросы отправлены/получены со статусами)
3. **Настройки** — уведомления (toggle), редактирование интересов

Режим редактирования: кнопка ✏️ → поля становятся доступны → "Сохранить".

#### EditEvent — редактирование мероприятия

Файл: `client/src/pages/EditEvent.tsx`

Форма: название, описание, дата, длительность (дней), теги (через запятую).

#### OrganizerProfile — профиль организатора

Файл: `client/src/pages/OrganizerProfile.tsx`

Редактирование: имя, Telegram, возраст, интересы (из предустановленных + кастомные, до 5). Кнопка "Сохранить профиль".

#### ParticipantProfile — демо-профиль участника

Файл: `client/src/pages/ParticipantProfile.jsx`

**Демо-версия** на JSX с `PropTypes`. Использует моковые данные при отсутствии eventId или ошибке API. Сохраняет изменения только локально (без API).

### Сервисы (Services)

#### api.ts — HTTP-клиент

Файл: `client/src/services/api.ts`

```typescript
const api = axios.create({
  baseURL: '/api',       // проксируется Vite на сервер
  timeout: 30000,        // 30 секунд
});
```

#### userStorage.ts — локальное хранилище сессии

Файл: `client/src/services/userStorage.ts`

Хранит сессию в localStorage под ключом `connecto_profile`.

```typescript
interface StoredSession {
  profile?: UserProfile;
  userId?: string;
  eventId?: string;
  sessionTimestamp?: number;
}
```

| Функция | Описание |
|---|---|
| `saveProfile(profile)` | Сохраняет профиль |
| `loadProfile()` | Загружает профиль |
| `saveUserId(userId)` | Сохраняет ID пользователя |
| `loadUserId()` | Загружает ID (сначала из сессии, затем из `currentUserId`) |
| `saveEventId(eventId)` | Сохраняет ID мероприятия |
| `loadEventId()` | Загружает ID мероприятия |
| `isSessionExpired()` | Проверка TTL (7 суток) |
| `restoreSession()` | Восстанавливает userId/eventId |
| `clearProfile()` | Полная очистка |

### Стилизация (index.css)

Файл: `client/src/index.css`

**Глобальные стили:**

1. **Tailwind CSS** — `@tailwind base/components/utilities`
2. **Градиентный фон** — `linear-gradient(165deg, #e0f8f5 → #6dd9d6)`
3. **Анимации**: `fadeIn`, `cardSlide`, `ripple`, `spin`, `tag-select`, `tag-pop`
4. **Кастомные классы:**
   - `.card` / `.card-modern` / `.profile-card` / `.user-card` — glassmorphism-карточки
   - `.btn-primary` — градиентная кнопка с анимацией свечения
   - `.btn-secondary` — полупрозрачная кнопка
   - `.btn-tag` / `.btn-tag-active` / `.tag-pill` / `.tag-pill-active` / `.tag-selected` — теги
   - `.input-field` / `.input-error` / `.input-group` — поля ввода с плавающими метками
   - `.stats-card` — карточки статистики
   - `.spinner` — индикатор загрузки
   - `.badge-common` — бейдж общих интересов
   - `.empty-state` — пустое состояние
5. **Мобильная адаптация** (≤480px, 481-768px)
6. **iOS-friendly**: `font-size: 16px` для инпутов (без зума)
7. **Touch-friendly**: `touch-action: manipulation`

### Конфигурация Vite и Tailwind

**Vite** (`client/vite.config.ts`):
```typescript
server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } }
```

**Tailwind** (`client/tailwind.config.js`): кастомная палитра `mint` (50-900) и `green-accent`.

---

## API endpoints — полный справочник

### Пользователи (`/api/users`)

| Метод | Endpoint | Параметры тела / Query | Ответ | Ошибки |
|---|---|---|---|---|
| POST | `/profile` | `{ name, role?, tags?, contact, age?, isGuest?, eventId? }` | `{ id, message }` | 400, 409 |
| PUT | `/profile/:userId` | `{ firstName?, middleName?, age?, profession?, hobbies?, contact? }` | User JSON | 404 |
| POST | `/register-to-event` | `{ userId, eventId }` | `{ id, message }` | 404, 409, 410 |
| GET | `/event/:eventId/registered` | `?userId=&page=&limit=` | User[] | 500 |
| GET | `/event/:eventId/joined` | `?userId=&page=&limit=` | User[] | 500 |
| GET | `/event/:eventId/recommendations` | `?userId=&page=&limit=` | User[] (sorted) | 404/500 |
| POST | `/interest` | `{ fromUserId, toUserId }` | Interest | 400, 409 |
| PUT | `/interest` | `{ interestId, action }` (accept/reject) | `{ message, contacts? }` | 404/400 |
| GET | `/professions/list` | — | string[] | 500 |
| GET | `/:userId/incoming-requests` | — | Interest[] | 500 |
| GET | `/:userId/contacts` | — | User[] | 500 |
| GET | `/:userId` (numeric) | — | User + events + activity | 404/500 |
| GET | `/:userId/liked-me` | `?eventId=&page=&limit=` | User[] | 500 |

### Мероприятия (`/api/events`)

| Метод | Endpoint | Параметры тела | Ответ | Ошибки |
|---|---|---|---|---|
| POST | `/` | `{ title, start_date, end_date, description?, tags?, organizerId }` | `{ ...event, qrImage, accessCode }` | 400 |
| GET | `/qr/:qr` | — | Event | 404/410 |
| GET | `/code/:code` | — | Event | 404/410 |
| GET | `/:eventId` | — | Event | 404 |
| PUT | `/:eventId` | `{ title?, start_date?, end_date?, description?, tags? }` | Event | 404/400 |
| GET | `/:eventId/stats` | — | `{ usersCount, requestsSent, requestsAccepted, contactsMade }` | 500 |

---

## Сценарии использования (User Flows)

### Сценарий 1: Участник присоединяется к мероприятию

```
1. Пользователь открывает приложение → Home (/)
2. Нажимает "Войти по коду" → /join
3. Система проверяет: есть ли профиль?
   │
   ├── Нет → редирект на /profile/create
   │         Пользователь заполняет имя, интересы, Telegram → сохранить
   │         Редирект на /profile
   │
   └── Есть → /join
4. Пользователь вводит 6-значный код (или сканирует QR)
5. POST /users/register-to-event → регистрация на мероприятие
6. Редирект на /lenta/:eventId
```

### Сценарий 2: Нетворкинг (отправка запроса)

```
1. Пользователь на /lenta/:eventId
2. Видит список участников (вкладка "Участники" или "Рекомендации")
3. Нажимает "Хочу познакомиться" на карточке участника
4. POST /users/interest { fromUserId, toUserId }
5. Кнопка меняется на "Запрос отправлен ✓"
6. Получатель видит запрос на странице /requests
7. Получатель нажимает "Принять" → PUT /interest { action: 'accept' }
8. Обоим пользователям открывается контактная информация Telegram
```

### Сценарий 3: Участник получает "лайк"

```
1. Пользователь на /lenta/:eventId
2. Раз в 10 секунд проверяет /:userId/liked-me
3. Если есть новый лайк — появляется модальное окно:
   - Имя отправителя, профессия, интересы
   - Кнопки: "Лайкнуть обратно" / "Пропустить"
4. Если лайкнуть обратно → POST /users/interest → взаимный контакт
```

### Сценарий 4: Организатор создаёт мероприятие

```
1. Пользователь нажимает "Создать" → /create
2. Заполняет форму: название, описание, даты, теги
3. POST /events → создание мероприятия
4. Модальное окно с QR-кодом и кодом доступа
5. Нажатие "Перейти к дашборду" → /event/:eventId
6. На дашборде: статистика, код, QR, кнопки действий
```

### Сценарий 5: Просмотр контактов

```
1. Пользователь на /contacts
2. GET /:userId/contacts → список взаимных контактов
3. Для каждого контакта: имя, роль, Telegram (активная ссылка)
4. Нажатие на Telegram → открытие t.me/username
```

---

## База данных

### Схема (Mermaid)

```mermaid
erDiagram
    events {
        int id PK
        string title
        date start_date
        date end_date
        text description
        json tags
        string organizerId
        string qrCode
        string accessCode
        int duration_days
        date expires_at
    }

    users {
        int id PK
        string firstName
        string middleName
        int age
        string profession
        json hobbies
        string contact UK
        int eventId FK
        boolean isGuest
    }

    interests {
        int id PK
        string status
        int fromUserId FK
        int toUserId FK
    }

    events ||--o{ users : "has participants"
    users ||--o{ interests : "as fromUser"
    users ||--o{ interests : "as toUser"
```

### Особенности

- JSON-поля (`hobbies`, `tags`) вместо массивов PostgreSQL для совместимости с SQLite
- Статус `interest` — строка вместо ENUM (той же причины)
- `qrCode` генерируется через `crypto.randomUUID()`
- `accessCode` — 6-значный цифровой, проверяется на уникальность
- `expires_at` = `end_date + 1 день`

---

## Развёртывание

### Docker Compose

```bash
docker-compose up --build
```

Поднимает два сервиса:
- **db**: PostgreSQL 15 с healthcheck (`pg_isready`)
- **api**: Node.js приложение, depends_on db (condition: service_healthy)

### Локальный запуск без Docker

```bash
# Терминал 1: сервер
cd server
npm install
npm run dev          # порт 3001 (или PORT из .env)

# Терминал 2: клиент
cd client
npm install
npm run dev          # порт 5173
```

### Dockerfile (мультистейдж-сборка)

```
Stage 1: client-builder (node:18-alpine)
  → npm install + npm run build → client/dist/

Stage 2: production (node:18-alpine)
  → npm install --omit=dev
  → COPY server/
  → COPY --from=client-builder /app/client/dist ./public
  → EXPOSE 3000
  → CMD ["node", "server.js"]
```

### CI/CD (GitLab CI)

Файл: `.gitlab-ci.yml`

**Build stage** (Kaniko):
- Сборка Docker-образа без Docker daemon
- Публикация в GitLab Container Registry с тегами `$CI_COMMIT_SHORT_SHA` и `latest`
- Триггер: merge request + main/master

**Deploy stage** (SSH):
- `docker login → docker pull → docker stop/rm → docker run`
- Триггер: только main/master, ручной запуск (`when: manual`)

---

## Безопасность и приватность

### Принципы

1. **Контакты скрыты по умолчанию.** Telegram не показывается до взаимного "лайка".
2. **Фильтрация на сервере.** Middleware `privacy.js` удаляет поле `contact`, если нет взаимного интереса.
3. **Фильтрация применяется ко всем спискам:** участники, рекомендации, liked-me.

### Защита

- **Обработка ошибок**: для 500 возвращается только "Внутренняя ошибка сервера" (без деталей).
- **Валидация**: на клиенте (React) и на сервере (контроллеры).
- **Проверки**: запрет на запрос самому себе, проверка существования мероприятия, проверка истечения.
- **Аутентификация**: отсутствует (используется localStorage). **Рекомендуется добавить JWT для production.**

---

## Переменные окружения

### server/.env (локальная разработка)

```ini
# Для PostgreSQL (если не указана — используется SQLite)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meetpoint
CLIENT_URL=http://localhost:5173
PORT=3001
```

### .env.example (корень проекта, для Docker)

```ini
DATABASE_URL=postgresql://user:password@db:5432/meetpoint
CLIENT_URL=http://localhost:3000
PORT=3000
```

---

## Планы и возможные улучшения

1. **Аутентификация.** JWT-токены, регистрация по email/паролю, защита маршрутов.
2. **Роли пользователей.** Чёткое разделение организатор / участник.
3. **Чат.** Встроенный мессенджер после взаимного лайка.
4. **Офлайн-режим.** PWA, кэширование данных мероприятия.
5. **Уведомления.** Push-уведомления (Web Push API).
6. **Расширенный матчинг.** Веса категорий, location-based, ML.
7. **Модерация.** Админ-панель.
8. **Мульти-мероприятия.** Участие в нескольких одновременно.
9. **Миграции БД.** Замена `sync({ alter: true })` на Sequelize миграции.
10. **Защита от XSS/CSRF.** Соответствующие middleware.
11. **Локализация.** i18n (несколько языков).
12. **Типизация.** Переписать `ParticipantProfile.jsx` на TypeScript.

---

> Документация подготовлена для разработчиков и сопровождающих проект Connecto.
> Последнее обновление: май 2026.