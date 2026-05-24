const { Sequelize, DataTypes } = require('sequelize');
const deasync = require('deasync');
require('dotenv').config();

const RAW_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/meetpoint';

let sequelize;

try {
  sequelize = new Sequelize(RAW_URL, { dialect: 'postgres', logging: false });
  let done = false;
  let error = null;
  sequelize.authenticate()
    .then(() => { done = true; console.log('✅ PostgreSQL подключен'); })
    .catch(err => { error = err; done = true; });
  while (!done) { deasync.runLoopOnce(); }
  if (error) throw error;
} catch (err) {
  console.warn('⚠️  PostgreSQL недоступен, переключаюсь на SQLite:', err.message.slice(0, 60));
  sequelize = new Sequelize({ dialect: 'sqlite', storage: 'dev.sqlite', logging: false });
  console.log('✅ SQLite (dev) активен');
}

module.exports = sequelize;
