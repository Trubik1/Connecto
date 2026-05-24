const { Sequelize, DataTypes } = require('sequelize');

async function check() {
  const sequelize = new Sequelize('postgres://user:password@172.18.0.2:5432/meetpoint', { logging: false });
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL: CONNECTED to Docker DB on 172.18.0.2:5432');
    
    // List all tables
    const all = (await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))[0];
    console.log('Tables:', JSON.stringify(all));
    
    // Count users
    const userCount = (await sequelize.query('SELECT COUNT(*) as cnt FROM users'))[0];
    console.log('Users count:', JSON.stringify(userCount));
    
    // Count events
    const eventCount = (await sequelize.query('SELECT COUNT(*) as cnt FROM events'))[0];
    console.log('Events count:', JSON.stringify(eventCount));
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await sequelize.close();
  process.exit(0);
}

check();
