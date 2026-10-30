const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/katalogController');

router.get('/', ctrl.index);
router.get('/:id', ctrl.detail);

module.exports = router;