require('dotenv').config();
const db = require('./db');
const { Event, User } = require('./models');

async function seed() {
  await db.sync({ force: true });
  const event = await Event.create({
    title: 'PROD Hackathon Minsk 2026',
    date: '2026-05-15',
    description: 'Хакатон PROD в Минске',
    tags: ['frontend', 'backend', 'дизайн', 'AI', 'fintech', 'карьера', 'стартапы', 'аналитика'],
    organizerId: 'org-001',
    duration_days: 1,
    expires_at: new Date('2026-05-16'),
  });

  await User.bulkCreate([
    { name: 'Алиса', role: 'Frontend-разработчик', contact: '@alice_tg', tags: ['backend', 'дизайн', 'fintech'], eventId: event.id },
    { name: 'Дима', role: 'Data Scientist', contact: 'dima@example.com', tags: ['backend', 'AI', 'fintech'], eventId: event.id },
    { name: 'Елена', role: 'Продакт-менеджер', contact: '@elena_tg', tags: ['карьера', 'стартапы', 'аналитика'], eventId: event.id },
  ]);

  console.log('Seed завершена');
  process.exit(0);
}

seed();
