const { User, Interest, Event } = require('../models');
const { filterContacts } = require('../middleware/privacy');
const { normalizeProfession } = require('../utils/normalizeProfession');

// Вспомогательная функция
async function enrichWithLikeStatus(users, currentUserId) {
  if (!users || !users.length) return users;
  const interests = await Interest.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { fromUserId: currentUserId, status: 'pending' },
        { toUserId: currentUserId, status: 'pending' },
      ],
    },
  });
  const likedByMe = interests.filter(i => i.fromUserId === currentUserId).map(i => i.toUserId);
  const likedMe   = interests.filter(i => i.toUserId === currentUserId).map(i => i.fromUserId);
  return users.map(u => ({
    ...u.toJSON(),
    iLiked: likedByMe.includes(u.id),
    likedMe: likedMe.includes(u.id),
  }));
}

// ── Профиль: создать ──
exports.createProfile = async (req, res) => {
  try {
    let { name, role, tags, contact, firstName, middleName, age, profession, hobbies, isGuest, eventId } = req.body;
    const finalName = name || firstName;
    const finalRole = role || profession;
    const finalTags = tags || hobbies || [];
    if (!finalName || !contact) return res.status(400).json({ error: 'Имя и контакт обязательны' });
    if (!Array.isArray(finalTags)) finalTags = [];

    let user = await User.findOne({ where: { contact } });
    if (user && !isGuest) return res.status(409).json({ error: 'Контакт уже зарегистрирован' });

    if (!user) {
      user = await User.create({
        firstName: finalName.trim(),
        profession: finalRole || '',
        hobbies: finalTags,
        contact,
        age: age || null,
        isGuest: isGuest || false,
        eventId: isGuest ? null : (eventId || null),
      });
    } else if (isGuest) {
      await user.update({
        firstName: finalName.trim(),
        profession: finalRole || '',
        hobbies:   finalTags,
        isGuest:   true,
      });
    }
    res.status(201).json({ id: user.id, message: 'Профиль создан' });
  } catch (err) {
    console.error('createProfile error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ── Профиль: обновить ──
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.params.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const { firstName, middleName, age, profession, hobbies, contact } = req.body;
    const normalizedProfession = normalizeProfession(profession);
    const displayProfession = profession
      ? (profession.charAt(0).toUpperCase() + profession.slice(1).toLowerCase())
      : '';
    const update = {};
    if (firstName   !== undefined) update.firstName  = firstName.trim();
    if (middleName  !== undefined) update.middleName = middleName;
    if (age         !== undefined) update.age       = age;
    if (profession  !== undefined) { update.profession = displayProfession; update.normalizedProfession = normalizedProfession; }
    if (hobbies     !== undefined) update.hobbies   = Array.isArray(hobbies) ? hobbies : [];
    if (contact     !== undefined) update.contact   = contact;
    await user.update(update);
    res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ── Регистрация на событие ──
exports.registerToEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const user = await User.findByPk(userId);
    if (!user)   return res.status(404).json({ error: 'Пользователь не найден' });
    const event = await Event.findByPk(eventId);
    if (!event)  return res.status(404).json({ error: 'Мероприятие не найдено' });
    if (new Date(event.expires_at) < new Date()) return res.status(410).json({ error: 'Мероприятие уже завершено' });
    if (user.eventId && user.eventId !== eventId) return res.status(409).json({ error: 'Вы уже участвуете в другом мероприятии' });
    if (user.eventId && user.eventId === eventId) return res.json({ id: user.id, message: 'Вы уже зарегистрированы на это мероприятие' });
    user.eventId = eventId;
    await user.save();
    res.json({ id: user.id, message: 'Участие подтверждено' });
  } catch (err) {
    console.error('registerToEvent error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ── Входящие запросы ──
exports.incomingRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const requests = await Interest.findAll({
      where: { toUserId: userId, status: 'pending' },
      include: [{ model: User, as: 'fromUser' }],
    });
    res.json(requests);
  } catch (err) {
    console.error('incomingRequests error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Мои контакты ──
exports.myContacts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const interests = await Interest.findAll({
      where: { status: 'accepted', [require('sequelize').Op.or]: [{ fromUserId: userId }, { toUserId: userId }] },
      include: [{ model: User, as: 'fromUser' }, { model: User, as: 'toUser' }],
    });
    const contacts = interests.map(i => (i.fromUserId == userId ? i.toUser : i.fromUser));
    res.json(contacts);
  } catch (err) {
    console.error('myContacts error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Профиль по ID ──
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{ model: Event, attributes: ['id', 'title', 'start_date', 'end_date'] }],
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Fetch activity (interests sent and received)
    const { Op } = require('sequelize');
    const sentInterests = await Interest.findAll({
      where: { fromUserId: req.params.userId },
      include: [{ model: User, as: 'toUser', attributes: ['id', 'firstName'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    const receivedInterests = await Interest.findAll({
      where: { toUserId: req.params.userId },
      include: [{ model: User, as: 'fromUser', attributes: ['id', 'firstName'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    // Build activity log
    const activity = [];
    sentInterests.forEach(i => {
      const statusText = i.status === 'accepted' ? 'принят' : i.status === 'rejected' ? 'отклонён' : 'ожидает';
      activity.push({
        date: i.createdAt ? new Date(i.createdAt).toISOString().split('T')[0] : '',
        action: `Отправил(а) запрос пользователю ${i.toUser?.firstName || '#'+i.toUserId} — ${statusText}`,
      });
    });
    receivedInterests.forEach(i => {
      const statusText = i.status === 'accepted' ? 'принят' : i.status === 'rejected' ? 'отклонён' : 'ожидает';
      activity.push({
        date: i.createdAt ? new Date(i.createdAt).toISOString().split('T')[0] : '',
        action: `Получен запрос от ${i.fromUser?.firstName || '#'+i.fromUserId} — ${statusText}`,
      });
    });
    activity.sort((a, b) => b.date.localeCompare(a.date));

    // Build events list
    const events = user.Event ? [{
      id: user.Event.id,
      title: user.Event.title,
      date: user.Event.start_date,
      status: new Date(user.Event.end_date) < new Date() ? 'finished' : 'active',
    }] : [];

    const result = {
      ...user.toJSON(),
      events,
      activity: activity.slice(0, 20),
    };

    res.json(result);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Запрос на знакомство
exports.requestInterest = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (fromUserId === toUserId) return res.status(400).json({ error: 'Нельзя отправить запрос самому себе' });
    const existing = await Interest.findOne({ where: { fromUserId, toUserId, status: 'pending' } });
    if (existing) return res.status(409).json({ error: 'Запрос уже отправлен' });
    const interest = await Interest.create({ fromUserId, toUserId, status: 'pending' });
    res.status(201).json(interest);
  } catch (err) {
    console.error('requestInterest error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Ответ на запрос
exports.respondInterest = async (req, res) => {
  try {
    const { interestId, action } = req.body;
    const interest = await Interest.findByPk(interestId);
    if (!interest || interest.status !== 'pending') return res.status(404).json({ error: 'Запрос не найден' });
    if (action === 'accept') {
      interest.status = 'accepted'; await interest.save();
      const fromUser = await User.findByPk(interest.fromUserId);
      const toUser   = await User.findByPk(interest.toUserId);
      return res.json({ message: 'Знакомство состоялось', contacts: { from: fromUser.contact, to: toUser.contact } });
    }
    if (action === 'reject') {
      interest.status = 'rejected'; await interest.save();
      return res.json({ message: 'Запрос отклонён' });
    }
    res.status(400).json({ error: 'Неверное действие' });
  } catch (err) {
    console.error('respondInterest error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Список нормализованных профессий
exports.getProfessions = async (req, res) => {
  try {
    const { getAllNormalizedProfessions } = require('../utils/normalizeProfession');
    res.json(getAllNormalizedProfessions());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Кто лайкнул меня
exports.getLikedMe = async (req, res) => {
  try {
    const { userId } = req.params;
    const { eventId, page = 0, limit = 10 } = req.query;
    const offset = parseInt(page) * parseInt(limit);
    const interests = await Interest.findAll({
      where: { toUserId: userId, status: 'pending' },
      include: [{ model: User, as: 'fromUser' }],
      offset, limit: parseInt(limit),
    });
    let users = interests.map(i => i.fromUser);
    if (eventId) users = users.filter(u => u.eventId == eventId);
    const filtered = await Promise.all(users.map(u => filterContacts(userId, u)));
    res.json(filtered);
  } catch (err) {
    console.error('getLikedMe error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Список участников события
exports.list = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, page = 0, limit = 10 } = req.query;
    const offset = parseInt(page) * parseInt(limit);
    const users = await User.findAll({
      where: { eventId, id: { [require('sequelize').Op.ne]: userId } },
      offset, limit: parseInt(limit),
    });
    const filtered = await Promise.all(users.map(u => filterContacts(userId, u)));
    res.json(filtered);
  } catch (err) {
    console.error('list error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Список участников (я иду)
exports.joinedList = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, page = 0, limit = 10 } = req.query;
    const offset = parseInt(page) * parseInt(limit);
    const acceptedInterests = await Interest.findAll({
      where: { status: 'accepted', [require('sequelize').Op.or]: [{ fromUserId: userId }, { toUserId: userId }] },
    });
    const contactIds = acceptedInterests.map(i =>
      i.fromUserId === parseInt(userId) ? i.toUserId : i.fromUserId
    );
    const users = await User.findAll({
      where: { id: { [require('sequelize').Op.in]: contactIds } },
      offset, limit: parseInt(limit),
    });
    const filtered = await Promise.all(users.map(u => filterContacts(userId, u)));
    res.json(filtered);
  } catch (err) {
    console.error('joinedList error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Рекомендации
exports.recommendations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, page = 0, limit = 10 } = req.query;
    const offset = parseInt(page) * parseInt(limit);
    const currentUser = await User.findByPk(userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });
    const all = await User.findAll({
      where: { eventId, id: { [require('sequelize').Op.ne]: userId } },
      offset, limit: parseInt(limit),
    });
    const currentTags = currentUser.hobbies || [];
    const currentAge  = currentUser.age;
    const normalizedTags = ['frontend', 'backend', 'дизайн', 'AI', 'fintech', 'карьера', 'стартапы', 'аналитика'];

    const scored = all.map(u => {
      const uTags  = u.hobbies || [];
      const common = uTags.filter(t => currentTags.includes(t)).length;
      const ageDiff = currentAge && u.age ? Math.abs(currentAge - u.age) : null;
      const ageScore = ageDiff === null ? 0 : ageDiff <= 5 ? 1 : ageDiff <= 10 ? 0.5 : 0;
      const customTags = uTags.filter(t => !normalizedTags.includes(t));
      const score = common * 2 + ageScore - customTags.length * 0.5;
      return { ...u.toJSON(), commonTags: common, score };
    }).sort((a, b) => b.score - a.score);

    const filtered = await Promise.all(scored.map(u =>
      filterContacts(userId, { ...u, toJSON: () => u })
    ));
    res.json(filtered);
  } catch (err) {
    console.error('recommendations error:', err);
    res.status(500).json({ error: err.message });
  }
};
