require('dotenv').config();
const db = require('./db');
const { Event, User } = require('./models');

async function check() {
  await db.authenticate().then(() => console.log('DB OK')).catch(() => console.log('DB FAIL'));
  
  try { await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"); } catch(e) { console.log('tables err:', e.message); }
  
  try { const r = await User.count(); console.log('User count:', r); } catch(e) { console.log('User count err:', e.message); }
  
  try { const r = await Event.count(); console.log('Event count:', r); } catch(e) { console.log('Event count err:', e.message); }
  
  try { const d = await User.findAll({ raw: true }); console.log('Users:', d.length); d.forEach(u => console.log(u.id, u.firstName, u.contact, u.eventId)); } catch(e) { console.log('Users err:', e.message); }
  
  try { const e = await Event.findAll({ raw: true }); console.log('Events:', e.length); e.forEach(x => console.log(x.id, x.title, x.accessCode, x.qrCode)); } catch(e) { console.log('Events err:', e.message); }
  
  process.exit(0);
}

check();
