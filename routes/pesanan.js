const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pesananController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

router.get('/', ctrl.riwayat);
router.get('/checkout', ctrl.showCheckout);
router.post('/checkout', ctrl.checkout);
router.get('/:id', ctrl.detail);

module.exports = router;