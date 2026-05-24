const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const db = require('./db');
const { Event, User, Interest } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Логгер запросов
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - t0;
    const color = res.statusCode < 400 ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}%s\x1b[0m %s %s → %s [%dms]`,
      res.statusCode < 400 ? '✓' : '✗',
      req.method, req.originalUrl, res.statusCode, ms);
  });
  next();
});

// API routes
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Статика + SPA fallback
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Обработчик ошибок ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Ошибка:', err && err.stack ? err.stack.split('\n').slice(0, 3).join('\n  ') : err);
  let status = 500;
  if (err) {
    if (err.statusCode) status = err.statusCode;
    else if (typeof err.status === 'number') status = err.status;
    else if (err.name === 'SequelizeForeignKeyConstraintError') status = 409;
    else if (err.name === 'SequelizeValidationError') status = 400;
  }
  const safeMsg = status === 500
    ? 'Внутренняя ошибка сервера'
    : err.message;
  if (!res.headersSent) {
    res.status(status).json({ error: safeMsg });
  }
});

// ── Запуск ─────────────────────────────────────────────────────────────────────
db.authenticate()
  .then(() => console.log('✅ БД подключена:', db.getQueryInterface().sequelize.config.dialect))
  .catch(err => {
    console.warn('БД недоступна:', err.message.slice(0, 80));
    console.log('⚠️  Запускаюсь без автоматической синхронизации схемы');
  });

db.sync({ alter: true }).then(() => {
  console.log('📋 Схема БД синхронизирована');
}).catch(err => {
  console.warn('⚠️  db.sync:', err.message.slice(0, 80));
});

app.listen(PORT, () => {
  console.log(`Connecto API → http://localhost:${PORT}`);
  console.log(`Swagger   → http://localhost:${PORT}/api-docs`);
});
