const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produkController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Semua route di sini butuh login admin
router.use(requireAdmin);

router.get('/', ctrl.index);
router.get('/create', ctrl.showCreate);
router.post('/', upload.single('gambar'), ctrl.create);
router.get('/:id/edit', ctrl.showEdit);
router.post('/:id', upload.single('gambar'), ctrl.update);   // edit pakai POST
router.post('/:id/delete', ctrl.destroy);                    // hapus pakai POST
router.get('/:id/delete', ctrl.destroy);                     // alternatif

module.exports = router;