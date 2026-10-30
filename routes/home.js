const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/homeController');

router.get('/', ctrl.index);
router.get('/teamdev', ctrl.teamdev);

module.exports = router;