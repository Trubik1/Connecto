const router = require('express').Router();
const eventCtrl = require('../controllers/eventController');

router.post('/', eventCtrl.create);
router.get('/qr/:qr', eventCtrl.getByQR);
router.get('/code/:code', eventCtrl.getByCode);
router.get('/:eventId', eventCtrl.getById);
router.put('/:eventId', eventCtrl.update);
router.get('/:eventId/stats', eventCtrl.stats);

module.exports = router;
