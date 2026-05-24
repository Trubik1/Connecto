const { Sequelize, DataTypes } = require('sequelize');

async function check() {
  const sequelize = new Sequelize('postgres://user:password@db:5432/meetpoint', { logging: false });
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL: CONNECTED to db:5432');
    
    const all = (await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))[0];
    console.log('Tables:', JSON.stringify(all));
    
    const users = (await sequelize.query('SELECT id, firstname, contact, eventid FROM users'))[0];
    console.log('Users count:', users.length);
    users.forEach(u => console.log(`  id=${u.id} name=${u.firstname} contact=${u.contact} eventId=${u.eventid}`));
    
    const events = (await sequelize.query('SELECT id, title, accesscode FROM events'))[0];
    console.log('Events count:', events.length);
    events.forEach(e => console.log(`  id=${e.id} title=${e.title} code=${e.accesscode}`));
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await sequelize.close();
  process.exit(0);
}

check();
