# 📘 Connecto — Полная документация проекта

**Connecto** — это веб-приложение для нетворкинга на мероприятиях. Платформа позволяет организаторам создавать мероприятия, участникам — находить друг друга по интересам, обмениваться запросами на знакомство и формировать список контактов.

---

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Технологический стек](#технологический-стек)
4. [Структура проекта](#структура-проекта)
5. [Серверная часть (Backend)](#серверная-часть-backend)
   - [Точка входа — server.js](#точка-входа--serverjs)
   - [Подключение к БД — db.js](#подключение-к-бд--dbjs)
   - [Модели данных (Sequelize)](#модели-данных-sequelize)
     - [User (пользователь)](#user-пользователь)
     - [Event (мероприятие)](#event-мероприятие)
     - [Interest (запрос на знакомство)](#interest-запрос-на-знакомство)
     - [Связи моделей](#связи-моделей)
   - [Маршруты (Routes)](#маршруты-routes)
     - [users.js — работа с пользователями](#usersjs--работа-с-пользователями)
     - [events.js — работа с мероприятиями](#eventsjs--работа-с-мероприятиями)
   - [Контроллеры (Controllers)](#контроллеры-controllers)
     - [userController.js](#usercontrollerjs)
     - [eventController.js](#eventcontrollerjs)
   - [Middleware / Промежуточное ПО](#middleware--промежуточное-по)
   - [Утилиты](#утилиты)
   - [Swagger / API-документация](#swagger--api-документация)
   - [Seed / Начальные данные](#seed--начальные-данные)
6. [Клиентская часть (Frontend)](#клиентская-часть-frontend)
   - [Точка входа — main.tsx](#точка-входа--maaintsx)
   - [Корневой компонент — App.tsx](#корневой-компонент--apptsx)
   - [Маршрутизация](#маршрутизация)
   - [Компоненты](#компоненты)
     - [Layout](#layout)
     - [ProfessionInput](#professioninput)
     - [ProtectedRoute](#protectedroute)
     - [QRCodeDisplay](#qrcodedisplay)
   - [Страницы (Pages)](#страницы-pages)
     - [Home — главная страница](#home--главная-страница)
     - [CreateProfile — создание профиля](#createprofile--создание-профиля)
     - [JoinByCode — вход по коду](#joinbycode--вход-по-коду)
     - [CreateEvent — создание мероприятия](#createevent--создание-мероприятия)
     - [EventDashboard — дашборд мероприятия](#eventdashboard--дашборд-мероприятия)
     - [Lenta — лента участников](#lenta--лента-участников)
     - [Match — страница мероприятия](#match--страница-мероприятия)
     - [Requests — входящие запросы](#requests--входящие-запросы)
     - [Contacts — мои контакты](#contacts--мои-контакты)
     - [Profile — профиль участника](#profile--профиль-участника)
     - [EditEvent — редактирование мероприятия](#editevent--редактирование-мероприятия)
     - [OrganizerProfile — профиль организатора](#organizerprofile--профиль-организатора)
     - [ParticipantProfile — профайл участника (демо)](#participantprofile--профайл-участника-демо)
   - [Сервисы (Services)](#сервисы-services)
     - [api.ts — HTTP-клиент](#apits--http-клиент)
     - [userStorage.ts — локальное хранилище сессии](#userstoragets--локальное-хранилище-сессии)
   - [Стилизация (index.css)](#стилизация-indexcss)
   - [Конфигурация Vite](#конфигурация-vite)
   - [Tailwind CSS](#tailwind-css)
7. [API endpoints — полный справочник](#api-endpoints--полный-справочник)
8. [Сценарии использования (User Flows)](#сценарии-использования-user-flows)
9. [База данных](#база-данных)
10. [Развёртывание и запуск](#развёртывание-и-запуск)
    - [Локальный запуск через Docker](#локальный-запуск-через-docker)
    - [Локальный запуск без Docker](#локальный-запуск-без-docker)
    - [CI/CD (GitLab CI)](#cicd-gitlab-ci)
    - [Dockerfile (мультистейдж-сборка)](#dockerfile-мультистейдж-сборка)
11. [Безопасность и приватность](#безопасность-и-приватность)
12. [Переменные окружения](#переменные-окружения)
13. [Планы и возможные улучшения](#планы-и-возможные-улучшения)

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

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + Vite)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages: Home, CreateProfile, JoinByCode, CreateEvent, │  │
│  │  EventDashboard, Lenta, Match, Requests, Contacts,   │  │
│  │  Profile, EditEvent, OrganizerProfile, ...           │  │
│  │  Components: Layout, ProfessionInput, ProtectedRoute,│  │
│  │               QRCodeDisplay                          │  │
│  │  Services: api.ts (axios), userStorage.ts (localStorage)│ │
│  └───────────────────────────────────────────────────────┘  │
│                          │ HTTP (proxy /api → :3001)         │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Server (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes: /api/users/*, /api/events/*                 │   │
│  │  Controllers: userController, eventController        │   │
│  │  Middleware: privacy.js (filterContacts)             │   │
│  │  Utils: normalizeProfession.js                       │   │
│  │  Swagger: /api-docs                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │ Sequelize ORM                     │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL / SQLite (auto-fallback)            │
│  Tables: users, events, interests                           │
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
│   │   │   ├── Home.tsx
│   │   │   ├── CreateProfile.tsx
│   │   │   ├── JoinByCode.tsx
│   │   │   ├── CreateEvent.tsx
│   │   │   ├── EventDashboard.tsx
│   │   │   ├── Lenta.tsx
│   │   │   ├── Match.tsx
│   │   │   ├── Requests.tsx
│   │   │   ├── Contacts.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── EditEvent.tsx
│   │   │   ├── OrganizerProfile.tsx
│   │   │   └── ParticipantProfile.jsx
│   │   ├── services/                # Сервисы (API, хранилище)
│   │   │   ├── api.ts
│   │   │   └── userStorage.ts
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
├── docs/                            # Документация (вы здесь)
├── docker-compose.yml               # Docker Compose (сервер + PostgreSQL)
├── Dockerfile                       # Мультистейдж Docker-сборка
├── .gitlab-ci.yml                   # GitLab CI/CD
├── .env.example                     # Пример переменных окружения
├── .dockerignore                    # Исключения для Docker
├── .gitignore                       # Исключения для Git
├── README.md                        # Краткое README
└── server_public_index.html         # HTML для продакшен-статики (легаси)
```

---

## Серверная часть (Backend)

### Точка входа — server.js

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

**Глобальный обработчик ошибок** обрабатывает:
- `SequelizeForeignKeyConstraintError` → 409
- `SequelizeValidationError` → 400
- Ошибки с `statusCode` / `status` → соответствующий код
- Все остальные → 500 (с безопасным сообщением)

### Подключение к БД — db.js

Файл: `server/db.js`

Реализован **автоматический fallback**:
1. Попытка подключиться к PostgreSQL по `DATABASE_URL`
2. Если PostgreSQL недоступен — переключение на SQLite (`dev.sqlite`)

Такая схема удобна для разработки: не требуется поднимать PostgreSQL локально.

### Модели данных (Sequelize)

Файлы: `server/models/`

#### User (пользователь)

Таблица: `users`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | Уникальный идентификатор |
| `firstName` | STRING | NOT NULL | Имя |
| `middleName` | STRING | | Отчество (опционально) |
| `age` | INTEGER | | Возраст |
| `profession` | STRING | | Профессия / роль |
| `hobbies` | JSON | default: [] | Массив интересов/тегов (хранится как JSON для совместимости с SQLite) |
| `contact` | STRING | NOT NULL, UNIQUE | Контакт (Telegram @username) |
| `eventId` | INTEGER | FK → events.id | ID мероприятия, на котором участник |
| `isGuest` | BOOLEAN | default: false | Флаг гостевого пользователя |
| `createdAt` | DATE | auto | Дата создания |
| `updatedAt` | DATE | auto | Дата обновления |

**Виртуальные поля** (добавляются через `afterFind` hook):
- `name` = `firstName`
- `role` = `profession`
- `tags` = `hobbies`

Хук `afterFind` добавляет эти поля динамически при чтении пользователей.

#### Event (мероприятие)

Таблица: `events`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | Уникальный идентификатор |
| `title` | STRING | NOT NULL | Название мероприятия |
| `start_date` | DATEONLY | NOT NULL | Дата начала |
| `end_date` | DATEONLY | NOT NULL | Дата окончания |
| `description` | TEXT | | Описание мероприятия |
| `tags` | JSON | default: [] | Теги мероприятия (категории) |
| `organizerId` | STRING | NOT NULL | Идентификатор организатора |
| `qrCode` | STRING | default: UUID | Уникальный UUID для QR-кода |
| `accessCode` | STRING | NOT NULL | 6-значный код доступа |
| `duration_days` | INTEGER | default: 1 | Длительность в днях |
| `expires_at` | DATE | | Дата истечения (end_date + 1 день) |
| `createdAt` | DATE | auto | Дата создания |
| `updatedAt` | DATE | auto | Дата обновления |

#### Interest (запрос на знакомство)

Таблица: `interests`

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | INTEGER | PK, autoIncrement | Уникальный идентификатор |
| `status` | STRING | default: 'pending' | Статус: 'pending', 'accepted', 'rejected' |
| `fromUserId` | INTEGER | FK → users.id, NOT NULL | Кто отправил запрос |
| `toUserId` | INTEGER | FK → users.id, NOT NULL | Кому отправили запрос |
| `createdAt` | DATE | auto | Дата создания |
| `updatedAt` | DATE | auto | Дата обновления |

**Индексы:**
- `fromUserId`
- `toUserId`
- составной: `fromUserId`, `toUserId`, `status`

#### Связи моделей

```js
Event.hasMany(User, { foreignKey: 'eventId' });
User.belongsTo(Event, { foreignKey: 'eventId' });

Interest.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Interest.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
```

- `Event` → `User`: один ко многим (на мероприятии много участников)
- `User` → `Event`: многие к одному (участник на одном мероприятии)
- `Interest` → `User (fromUser)`: запрос от пользователя
- `Interest` → `User (toUser)`: запрос к пользователю

### Маршруты (Routes)

#### users.js — работа с пользователями

Файл: `server/routes/users.js`

Все маршруты имеют префикс `/api/users` (устанавливается в `server.js`):

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
| GET | `/:userId/incoming-requests` | Входящие запросы пользователя |
| GET | `/:userId/contacts` | Список контактов (взаимные) |
| GET | `/:userId(\\d+)` | Получить профиль по числовому ID |
| GET | `/:userId(\\d+)/liked-me` | Кто лайкнул пользователя |

**Важно про порядок роутов:**
Специфичные маршруты (например, `/professions/list`) объявлены **до** `/:userId`, чтобы `list` не был захвачен как userId. Маршрут с числовым ID использует регулярное выражение `(\\d+)`.

#### events.js — работа с мероприятиями

Файл: `server/routes/events.js`

Все маршруты с префиксом `/api/events`:

| Метод | Путь | Описание |
|---|---|---|
| POST | `/` | Создать мероприятие |
| GET | `/qr/:qr` | Найти по QR-коду (UUID) |
| GET | `/code/:code` | Найти по коду доступа |
| GET | `/:eventId` | Получить по ID |
| PUT | `/:eventId` | Обновить мероприятие |
| GET | `/:eventId/stats` | Статистика мероприятия |

### Контроллеры (Controllers)

#### userController.js

Файл: `server/controllers/userController.js`

Содержит все обработчики для пользовательских маршрутов.

**Основные функции:**

| Экспорт | Назначение |
|---|---|
| `createProfile` | Создание нового пользователя. Проверяет уникальность контакта. Если пользователь уже существует и это гость — обновляет запись. |
| `updateProfile` | Обновление полей профиля. Нормализует профессию. |
| `registerToEvent` | Регистрация пользователя на мероприятие. Проверяет: существует ли мероприятие, не истекло ли, не участвует ли уже на другом. |
| `getProfile` | Получение полного профиля пользователя (включая его мероприятие, ленту активности — отправленные и полученные запросы). |
| `requestInterest` | Создание запроса на знакомство. Запрещает отправку самому себе. Проверяет, нет ли уже активного запроса. |
| `respondInterest` | Ответ на запрос: accept (взаимный контакт) или reject. |
| `incomingRequests` | Список входящих запросов со статусом 'pending'. |
| `myContacts` | Список всех взаимных контактов (где статус 'accepted'). |
| `getLikedMe` | Кто лайкнул пользователя (запросы pending в адрес пользователя). |
| `list` | Список участников мероприятия (с фильтрацией приватности). |
| `joinedList` | Список тех, с кем уже есть взаимный контакт на мероприятии. |
| `recommendations` | Алгоритм рекомендаций: оценка на основе общих интересов (×2), возраста (разница до 5 лет = 1, до 10 = 0.5), и штраф за кастомные теги (×0.5). |
| `getProfessions` | Список доступных профессий из нормализатора. |

**Алгоритм рекомендаций (recommendations):**
```js
score = commonTags * 2 + ageScore - customTagsCount * 0.5
```
- `commonTags` — количество общих интересов
- `ageScore` — 1 (разница ≤ 5 лет), 0.5 (≤ 10), 0 (иначе или нет данных)
- `customTagsCount` — количество тегов не из стандартного набора

#### eventController.js

Файл: `server/controllers/eventController.js`

| Экспорт | Назначение |
|---|---|
| `create` | Создание мероприятия. Генерирует уникальный 6-значный код доступа (с проверкой уникальности). Генерирует QR-код. Устанавливает `expires_at = end_date + 1 день`. |
| `getByQR` | Поиск мероприятия по UUID (qrCode). Проверка истечения. |
| `getByCode` | Поиск по 6-значному коду доступа. Проверка истечения. |
| `getById` | Поиск по ID. |
| `update` | Обновление мероприятия. Только название, описание, даты, теги. |
| `stats` | Статистика: количество участников, отправленных запросов (pending), принятых запросов (accepted). |

**Генерация QR-кода:**
```js
const qrData = `${CLIENT_URL}/join/${event.qrCode}`;
const qrImage = await QRCode.toDataURL(qrData);
```
QR-код содержит ссылку на страницу входа с QR-параметром.

### Middleware / Промежуточное ПО

Файл: `server/middleware/privacy.js`

**`filterContacts(userId, targetUser)`** — функция фильтрации контактов.

Правила приватности:
- Если между пользователями нет взаимного интереса (accepted) — контактная информация (contact/Telegram) скрывается.
- Если взаимный контакт есть — данные показываются полностью.

```js
if (!mutual) delete userJson.contact;
```

### Утилиты

Файл: `server/utils/normalizeProfession.js`

**`normalizeProfession(profession)`** — нормализует название профессии к единому виду.

Карта соответствий включает 55+ записей для разных вариантов написания, например:
- "frontend" / "фронтенд" / "front-end" → "Frontend"
- "data scientist" / "дата сайентист" → "Data Scientist"
- "pm" / "продакт менеджер" → "Product Manager"
- "дизайнер" / "designer" → "Designer"

Если профессия не найдена в карте — возвращается с заглавной буквы.

**`getAllNormalizedProfessions()`** — возвращает уникальный список нормализованных профессий (используется для автодополнения на клиенте).

### Swagger / API-документация

Файл: `server/swagger.js`

Swagger настроен через `swagger-jsdoc`. Читает JSDoc-комментарии из файлов `routes/*.js` (хотя в текущей реализации комментарии minimal).

Доступен по адресу: `http://localhost:3000/api-docs`

### Seed / Начальные данные

Файл: `server/seed.js`

Скрипт для заполнения БД тестовыми данными. Запуск: `npm run seed`

Создаёт:
- Одно мероприятие: "PROD Hackathon Minsk 2026"
- Трёх участников: Алиса (Frontend), Дима (Data Scientist), Елена (Product Manager)

Использует `db.sync({ force: true })` для пересоздания таблиц (**все данные удаляются!**).

---

## Клиентская часть (Frontend)

### Точка входа — main.tsx

Файл: `client/src/main.tsx`

Перед рендером проверяет, не истекла ли сессия пользователя (7 дней). Если сессия активна — восстанавливает `currentUserId` и `currentEventId` в `localStorage`.

### Корневой компонент — App.tsx

Файл: `client/src/App.tsx`

Определяет маршруты приложения. Использует `BrowserRouter` из `react-router-dom`. Некоторые страницы обёрнуты в компонент `Layout` (с навигацией), некоторые — самостоятельные (полный экран).

### Маршрутизация

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
| `/match/:eventId` | Match | Да | Страница мероприятия (список) |
| `/match` | Match | Нет | Страница мероприятия (без ID) |
| `/organizer/profile` | OrganizerProfile | Да | Профиль организатора |
| `/participant/profile` | ParticipantProfile | Да | Профиль участника (демо) |

### Компоненты

#### Layout

Файл: `client/src/components/Layout.tsx`

Общий шаблон страниц с:
- **Верхним хедером**: логотип Connecto, ссылки "Создать" и "Профиль"
- **Нижней навигацией** (мобильные): Главная, Создать, Войти, Запросы, Профиль
- Подсветка активного раздела на основе текущего пути

Использует иконки из `lucide-react`.

#### ProfessionInput

Файл: `client/src/components/ProfessionInput.tsx`

Инпут с автодополнением профессий. При вводе отправляет запрос на `/users/professions/list` и показывает до 6 подсказок. Реализован click-outside для закрытия выпадающего списка.

#### ProtectedRoute

Файл: `client/src/components/ProtectedRoute.tsx`

Проверяет наличие `currentUserId` или `organizerId` в `localStorage`. Если нет — редирект на `/`.

**Примечание:** В текущей версии не используется (маршруты не защищены этим компонентом).

#### QRCodeDisplay

Файл: `client/src/components/QRCodeDisplay.tsx`

Отображает QR-код для переданной строки. Использует `QRCodeSVG` из `qrcode.react`. Размер: 220px.

### Страницы (Pages)

#### Home — главная страница

Файл: `client/src/pages/Home.tsx`

Крупный градиентный фон, логотип "Connecto", кнопка **"Войти по коду"** (ведёт на `/join`). В правом верхнем углу — кнопки быстрого доступа: Создать (мероприятие), Профиль (создать), Войти (профиль).

#### CreateProfile — создание профиля

Файл: `client/src/pages/CreateProfile.tsx`

**Форма создания/редактирования профиля участника.**

Поля:
- **Имя** (обязательное)
- **Возраст** (числовой)
- **Роль/должность** (текстовое)
- **Теги интересов** (до 5): выбор из предустановленных (`frontend`, `backend`, `дизайн`, `AI`, `fintech`, `карьера`, `стартапы`, `аналитика`) + кастомные
- **Telegram** (обязательный, @username)
  - Валидация: только латиница, цифры и подчёркивание, минимум 3 символа после @
  - Автоматически добавляет `@` в начале

**Логика:**
- При загрузке проверяет, есть ли `currentUserId`. Если есть — загружает существующий профиль.
- При сохранении: если ID есть — PUT (обновление), если нет — POST (создание).
- Сохраняет данные в localStorage через `userStorage.ts`.

#### JoinByCode — вход по коду

Файл: `client/src/pages/JoinByCode.tsx`

**Вход на мероприятие.**

Два способа:
1. **Сканировать QR-код** через камеру (использует `html5-qrcode`)
2. **Ввести 6-значный код** вручную (только цифры)

**Логика:**
- Проверяет, создан ли профиль (редирект на `/profile/create` если нет)
- Автоматически определяет тип ввода: если UUID → `/events/qr/:qr`, если цифры → `/events/code/:code`
- После входа: `saveEventId(id)`, редирект на `/lenta/:eventId`
- Если передан QR-параметр в URL (`/join/:qr`) — автоматический вход

#### CreateEvent — создание мероприятия

Файл: `client/src/pages/CreateEvent.tsx`

**Форма создания мероприятия.**

Поля:
- **Название** (обязательное)
- **Описание** (textarea)
- **Дата начала** / **Дата окончания** (DatePicker с календарём)
- **Теги** (выбор из 10 предустановленных + кастомные)

После успешного создания — **модальное окно** с:
- QR-кодом (`QRCodeDisplay`)
- 6-значным кодом доступа (кнопка "Копировать")
- Кнопкой "Перейти к дашборду"

#### EventDashboard — дашборд мероприятия

Файл: `client/src/pages/EventDashboard.tsx`

**Страница организатора** после создания мероприятия.

Показывает:
- Название и описание мероприятия
- Даты проведения
- **Код доступа** (с кнопкой копирования)
- **QR-код** (по нажатию на кнопку — модальное окно)
- **Статистика**: участников, знакомств, отправленных и принятых запросов
- **Кнопки действий**: "Перейти к ленте", "Редактировать мероприятие"

#### Lenta — лента участников

Файл: `client/src/pages/Lenta.tsx`

**Основная страница для нетворкинга.**

Три вкладки (таба):
1. **👥 Участники** — все участники мероприятия
2. **✨ Рекомендации** — отсортированные по алгоритму совместимости
3. **🤝 Мои контакты** — уже установленные взаимные контакты

Функциональность:
- **Поиск по тегу**: фильтрация участников
- **Отправка запроса**: кнопка "Хочу познакомиться" → `POST /interest`
- **Отображение статуса**: "Запрос отправлен ✓" (если запрос уже отправлен)
- **Раскрытие контакта**: если матч состоялся — показывает Telegram
- **Общие интересы**: бейдж с количеством общих тегов
- **Модальное окно "лайка"**: при получении запроса от другого пользователя — всплывающее окно с возможностью лайкнуть в ответ или пропустить

**Авто-опрос**: каждые 10 секунд проверяет, не появились ли новые "лайки" (`checkLikedMe`).

#### Match — страница мероприятия

Файл: `client/src/pages/Match.tsx`

Альтернативная страница просмотра мероприятия со списком участников.

Показывает:
- Карточку мероприятия (название, описание, даты, локация, теги)
- Кнопку "Присоединиться к мероприятию"
- Поиск по имени или профессии
- Список участников с аватарами (первая буква имени), интересами
- Отображение Telegram при взаимном контакте

#### Requests — входящие запросы

Файл: `client/src/pages/Requests.tsx`

Список входящих запросов на знакомство (со статусом 'pending').
Для каждого запроса: имя отправителя, его роль, кнопки "Принять" / "Пропустить".

#### Contacts — мои контакты

Файл: `client/src/pages/Contacts.tsx`

Список всех взаимных контактов (где запрос принят). Показывает имя, роль и Telegram. Telegram — активная ссылка на `t.me/username`.

#### Profile — профиль участника

Файл: `client/src/pages/Profile.tsx`

**Полноценная страница профиля** с режимом редактирования.

Три вкладки:
1. **Мероприятия** — список мероприятий пользователя с датами
2. **Активность** — лента действий (отправка/получение запросов с их статусами)
3. **Настройки** — уведомления (toggle), редактирование интересов

Функции:
- Нажатие на мероприятие → переход на его дашборд
- Кнопка редактирования ✏️ → поля становятся доступны для изменения → кнопка "Сохранить"

#### EditEvent — редактирование мероприятия

Файл: `client/src/pages/EditEvent.tsx`

Форма редактирования существующего мероприятия. Поля: название, описание, дата, длительность, теги (через запятую).

#### OrganizerProfile — профиль организатора

Файл: `client/src/pages/OrganizerProfile.tsx`

Профиль с возможностью редактирования. Аналогичен `CreateProfile`, но с другим UI. Позволяет изменять имя, Telegram, возраст, интересы (с выбором из предустановленных + кастомные).

#### ParticipantProfile — профайл участника (демо)

Файл: `client/src/pages/ParticipantProfile.jsx`

**Демо-версия профиля участника** (`.jsx`, использует `PropTypes`).

Отличается от `Profile.tsx`:
- Использует моковые данные (`MOCK_PROFILE`) при отсутствии eventId или при ошибке API
- Сохраняет изменения только на клиенте (без API)
- Служит заглушкой / демо-страницей

### Сервисы (Services)

#### api.ts — HTTP-клиент

Файл: `client/src/services/api.ts`

Создаёт экземпляр Axios с:
- `baseURL: '/api'` (проксируется Vite на сервер)
- `timeout: 30000` (30 секунд)

#### userStorage.ts — локальное хранилище сессии

Файл: `client/src/services/userStorage.ts`

Реализует хранение сессии в localStorage под ключом `connecto_profile`.

**Интерфейс сессии:**
```typescript
interface StoredSession {
  profile?: UserProfile;    // имя, роль, контакт, теги
  userId?: string;          // ID пользователя
  eventId?: string;         // ID текущего мероприятия
  sessionTimestamp?: number; // время последней активности
}
```

**Функции:**

| Функция | Описание |
|---|---|
| `saveProfile(profile)` | Сохраняет профиль в сессию |
| `loadProfile()` | Загружает профиль из сессии |
| `saveUserId(userId)` | Сохраняет ID пользователя |
| `loadUserId()` | Загружает ID (сначала из сессии, затем из `currentUserId`) |
| `saveEventId(eventId)` | Сохраняет ID мероприятия |
| `loadEventId()` | Загружает ID мероприятия |
| `isSessionExpired()` | Проверка, не истекла ли сессия (TTL: 7 суток) |
| `restoreSession()` | Восстанавливает userId/eventId если сессия активна |
| `clearProfile()` | Полная очистка всех данных сессии |

### Стилизация (index.css)

Файл: `client/src/index.css`

Глобальные стили включают:

1. **Tailwind CSS** — базовые директивы `@tailwind base/components/utilities`
2. **Градиентный фон** — `linear-gradient(165deg, #e0f8f5 → #6dd9d6)`
3. **Анимации**: `fadeIn`, `cardSlide`, `ripple`, `spin`, `tag-select`, `tag-pop`
4. **Кастомные классы:**
   - `.card` / `.card-modern` / `.profile-card` / `.user-card` — стеклянные (glassmorphism) карточки
   - `.btn-primary` — градиентная кнопка (бирюзовая) с анимацией свечения
   - `.btn-secondary` — полупрозрачная кнопка
   - `.btn-tag` / `.btn-tag-active` / `.tag-pill` / `.tag-pill-active` / `.tag-selected` — теги
   - `.input-field` / `.input-error` / `.input-group` — поля ввода с плавающими метками
   - `.stats-card` — карточки статистики
   - `.spinner` — индикатор загрузки
   - `.badge-common` — бейдж общих интересов
   - `.empty-state` — пустое состояние
5. **Мобильная адаптация** (media queries до 480px и 768px): уменьшение отступов, шрифтов, кнопки на полную ширину, теги в 2 колонки, адаптация навигации
6. **iOS-friendly**: `font-size: 16px` для инпутов (чтобы не срабатывал зум)
7. **Touch-friendly**: `touch-action: manipulation` для кнопок
8. **Скрытие скроллбара** на мобильных

### Конфигурация Vite

Файл: `client/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001', // прокси на Express-сервер
    },
  },
});
```

В режиме разработки Vite работает на порту 5173, проксируя запросы `/api` на сервер (`:3001`).  
В продакшене сервер раздаёт статику из `server/public`.

### Tailwind CSS

Файл: `client/tailwind.config.js`

Добавлены кастомные цвета `mint` (от 50 до 900) и `green-accent`.

---

## API endpoints — полный справочник

### Пользователи (`/api/users`)

| Метод | Endpoint | Параметры тела / Query | Ответ | Ошибки |
|---|---|---|---|---|
| POST | `/profile` | `{ name, role?, tags?, contact, age?, isGuest?, eventId? }` | `{ id, message }` | 400 — поля не заполнены, 409 — контакт уже существует |
| PUT | `/profile/:userId` | `{ firstName?, middleName?, age?, profession?, hobbies?, contact? }` | Обновлённый User (JSON) | 404 — не найден |
| POST | `/register-to-event` | `{ userId, eventId }` | `{ id, message }` | 404 (пользователь/событие), 409 (уже на другом), 410 (истекло) |
| GET | `/event/:eventId/registered` | `?userId=&page=&limit=` | Массив User[] | 500 |
| GET | `/event/:eventId/joined` | `?userId=&page=&limit=` | Массив User[] | 500 |
| GET | `/event/:eventId/recommendations` | `?userId=&page=&limit=` | Массив User[] (отсортированные по score) | 404/500 |
| POST | `/interest` | `{ fromUserId, toUserId }` | `{ id, status, ... }` | 400 (сам себе), 409 (уже отправлен) |
| PUT | `/interest` | `{ interestId, action }` (action: "accept"/"reject") | `{ message, contacts? }` | 404/400 |
| GET | `/professions/list` | — | Массив строк (профессии) | 500 |
| GET | `/:userId/incoming-requests` | — | Массив Interest[] | 500 |
| GET | `/:userId/contacts` | — | Массив User[] | 500 |
| GET | `/:userId` (числовой) | — | User + events[] + activity[] | 404/500 |
| GET | `/:userId/liked-me` | `?eventId=&page=&limit=` | Массив User[] | 500 |

### Мероприятия (`/api/events`)

| Метод | Endpoint | Параметры тела | Ответ | Ошибки |
|---|---|---|---|---|
| POST | `/` | `{ title, start_date, end_date, description?, tags?, organizerId }` | `{ ...event, qrImage, accessCode }` | 400 (даты) |
| GET | `/qr/:qr` | — | Event | 404/410 (истекло) |
| GET | `/code/:code` | — | Event | 404/410 (истекло) |
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

### Схема

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

- JSON-поля (`hobbies`, `tags`) используются вместо массивов PostgreSQL для обратной совместимости с SQLite
- Статус `interest` — строка вместо ENUM (той же причины)
- `qrCode` в мероприятии генерируется через `crypto.randomUUID()`
- `accessCode` — 6-значный цифровой код (проверяется на уникальность при создании)
- `expires_at` = `end_date + 1 день` (автоматически)

---

## Развёртывание и запуск

### Локальный запуск через Docker

```bash
# 1. Убедитесь, что установлены Docker и Docker Compose
docker --version
docker-compose --version

# 2. Клонируйте репозиторий
git clone <url> connecto
cd connecto

# 3. Создайте .env (если нужно изменить настройки)
cp .env.example .env

# 4. Запустите
docker-compose up --build

# 5. Откройте браузер
# http://localhost:3000
# http://localhost:3000/api-docs (Swagger)
```

Docker Compose поднимает два контейнера:
- `db` — PostgreSQL 15 (с healthcheck)
- `api` — Node.js приложение (зависит от `db`)

### Локальный запуск без Docker

```bash
# 1. Установите PostgreSQL (или пропустите — будет SQLite)
# 2. Настройте .env (server/.env):
#    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meetpoint
#    PORT=3001
#    CLIENT_URL=http://localhost:5173

# 3. Установите зависимости сервера
cd server
npm install

# 4. Запустите сервер (порт 3001)
npm run dev

# 5. В другом терминале — клиент (порт 5173)
cd client
npm install
npm run dev

# 6. Откройте http://localhost:5173
```

**Важно:** Без PostgreSQL сервер автоматически переключается на SQLite. Все данные хранятся в `server/dev.sqlite`.

### CI/CD (GitLab CI)

Файл: `.gitlab-ci.yml`

- **Build stage:** сборка Docker-образа через Kaniko (без Docker daemon). Пушит образ в GitLab Container Registry с тегами `$CI_COMMIT_SHORT_SHA` и `latest`.
- **Deploy stage:** деплой на удалённый сервер через SSH. Выполняет `docker pull && docker stop/rm && docker run` на production-сервере.

Триггеры:
- Build: на merge request и в main/master
- Deploy: только в main/master (ручной запуск `when: manual`)

### Dockerfile (мультистейдж-сборка)

```
Stage 1: client-builder (node:18-alpine)
  - Установка зависимостей клиента
  - Сборка React (npm run build) → client/dist/

Stage 2: production (node:18-alpine)
  - Установка зависимостей сервера (только production)
  - Копирование серверного кода
  - Копирование client/dist/ → server/public/
  - EXPOSE 3000
  - CMD: node server.js
```

---

## Безопасность и приватность

### Принципы приватности

1. **Контакты скрыты по умолчанию.** Telegram-username пользователя не показывается другим участникам, пока не произойдёт взаимный "лайк" (запрос отправлен и принят).
2. **Фильтрация на сервере.** Функция `filterContacts` в middleware/privacy.js удаляет поле `contact` из ответа, если нет взаимного интереса.
3. **Фильтрация применяется ко всем спискам:** участники, рекомендации, "кто лайкнул меня".

### Защита

- **Обработка ошибок**: глобальный middleware не раскрывает детали внутренних ошибок (возвращает "Внутренняя ошибка сервера" для 500).
- **Валидация данных**: на клиенте (React) и на сервере (контроллеры).
- **Проверка состояния**: запрет на отправку запроса самому себе, проверка существования мероприятия, проверка истечения срока.
- **Отсутствие аутентификации**: в текущей версии нет паролей/JWT. Идентификация через `localStorage`. **Рекомендуется добавить аутентификацию для production.**

---

## Переменные окружения

### server/.env

```ini
# DATABASE_URL — строка подключения к PostgreSQL (если не указана — SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/meetpoint

# CLIENT_URL — URL клиента (для генерации QR-кодов)
CLIENT_URL=http://localhost:3000

# PORT — порт сервера (по умолчанию 3000)
PORT=3001
```

### .env.example (корень проекта)

```ini
DATABASE_URL=postgresql://user:password@db:5432/meetpoint
CLIENT_URL=http://localhost:3000
PORT=3000
```

---

## Планы и возможные улучшения

1. **Аутентификация.** Добавить JWT-токены, регистрацию по email/паролю, защиту маршрутов через `ProtectedRoute`.
2. **Роли пользователей.** Чёткое разделение: организатор (создаёт мероприятия, видит статистику) и участник (нетворкинг).
3. **Чат.** Встроенный мессенджер для общения после взаимного лайка (вместо внешней ссылки на Telegram).
4. **Офлайн-режим.** PWA, кэширование данных мероприятия для работы без интернета.
5. **Уведомления.** Push-уведомления о новых запросах и матчах (Web Push API).
6. **Расширенный матчинг.** Улучшить алгоритм рекомендаций: добавить веса для разных категорий, location-based, machine learning.
7. **Модерация.** Админ-панель для управления мероприятиями и пользователями.
8. **Мульти-мероприятия.** Возможность участвовать в нескольких мероприятиях одновременно.
9. **Миграции БД.** Заменить `sync({ alter: true })` на полноценные миграции Sequelize.
10. **Защита от XSS/CSRF.** Добавить соответствующие middleware.
11. **Локализация.** Поддержка нескольких языков (i18n).
12. **Типизация.** Переписать `ParticipantProfile.jsx` на TypeScript.

---

> Документация подготовлена для разработчиков и сопровождающих проект Connecto.  
> По всем вопросам обращайтесь к команде разработки.  
> Последнее обновление: май 2026.