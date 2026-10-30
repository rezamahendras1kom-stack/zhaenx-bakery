const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pesananController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', ctrl.adminIndex);
router.post('/:id/status', ctrl.updateStatus);

module.exports = router;