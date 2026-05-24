const { Event } = require('../models');
const QRCode = require('qrcode');

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.create = async (req, res) => {
  try {
    const { title, start_date, end_date, description, tags, organizerId } = req.body;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Даты начала и окончания обязательны' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' });
    }
    const expires_at = new Date(end_date);
    expires_at.setDate(expires_at.getDate() + 1);

    // Генерируем уникальный код доступа
    let accessCode = generateAccessCode();
    let existingEvent = await Event.findOne({ where: { accessCode } });
    while (existingEvent) {
      accessCode = generateAccessCode();
      existingEvent = await Event.findOne({ where: { accessCode } });
    }

    const event = await Event.create({
      title, start_date, end_date, description, tags, organizerId,
      accessCode, expires_at,
    });

    const qrData = `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${event.qrCode}`;
    const qrImage = await QRCode.toDataURL(qrData);
    res.status(201).json({ ...event.toJSON(), qrImage, accessCode });
  } catch (err) {
    console.error('create event error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getByQR = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { qrCode: req.params.qr } });
    if (!event) return res.status(404).json({ error: 'Мероприятие не найдено' });
    if (new Date(event.expires_at) < new Date()) return res.status(410).json({ error: 'Срок действия мероприятия истёк' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByCode = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { accessCode: req.params.code } });
    if (!event) return res.status(404).json({ error: 'Мероприятие не найдено' });
    if (new Date(event.expires_at) < new Date()) return res.status(410).json({ error: 'Срок действия мероприятия истёк' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Мероприятие не найдено' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Мероприятие не найдено' });
    const { title, start_date, end_date, description, tags } = req.body;
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' });
    }
    const expires_at = new Date(end_date);
    expires_at.setDate(expires_at.getDate() + 1);
    await event.update({ title, start_date, end_date, description, tags, expires_at });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { User, Interest } = require('../models');
    const usersCount = await User.count({ where: { eventId } });
    const accepted    = await Interest.count({ where: { status: 'accepted' } });
    const sent        = await Interest.count({ where: { status: 'pending' } });
    res.json({ usersCount, requestsSent: sent, requestsAccepted: accepted, contactsMade: accepted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
