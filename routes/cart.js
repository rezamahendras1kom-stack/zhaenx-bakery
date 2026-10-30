const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');

router.get('/', ctrl.index);
router.post('/tambah', ctrl.tambah);
router.post('/update', ctrl.update);
router.post('/hapus', ctrl.hapus);

module.exports = router;