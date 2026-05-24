require('dotenv').config();
const db = require('./db');

async function checkDb() {
  await db.authenticate()
    .then(() => console.log('DB connected:', db.getQueryInterface().sequelize.config.dialect))
    .catch(e => console.log('DB error:', e.message));

  // Check if sync created the tables
  try {
    await db.query('SELECT COUNT(*) FROM users');
    console.log('USERS table exists');
  } catch (e) {
    console.log('USERS table error:', e.message);
  }
  
  try {
    await db.query('SELECT COUNT(*) FROM events');
    console.log('EVENTS table exists');
  } catch (e) {
    console.log('EVENTS table error:', e.message);
  }
  
  process.exit(0);
}

checkDb();
