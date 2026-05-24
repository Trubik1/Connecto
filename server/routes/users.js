const router = require('express').Router();
const userCtrl = require('../controllers/userController');

// Профиль
router.post('/profile', userCtrl.createProfile);
router.put('/profile/:userId', userCtrl.updateProfile);
router.post('/register-to-event', userCtrl.registerToEvent);

// Мероприятие
router.get('/event/:eventId/registered', userCtrl.list);
router.get('/event/:eventId/joined', userCtrl.joinedList);
router.get('/event/:eventId/recommendations', userCtrl.recommendations);

// Запросы / контакты
router.post('/interest', userCtrl.requestInterest);
router.put('/interest', userCtrl.respondInterest);

// Специфичные роуты ДО /:userId, иначе /:userId захватит /professions/list
router.get('/professions/list', userCtrl.getProfessions);
router.get('/:userId/incoming-requests', userCtrl.incomingRequests);
router.get('/:userId/contacts', userCtrl.myContacts);

// Профиль по numeric ID (после всех специфичных)
router.get('/:userId(\\d+)', userCtrl.getProfile);

// Кто лайкнул меня
router.get('/:userId(\\d+)/liked-me', userCtrl.getLikedMe);

module.exports = router;
