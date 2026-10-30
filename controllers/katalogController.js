const db = require('../config/db');
const Kategori = require('../models/kategoriModel');

exports.index = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const kategoriId = req.query.kategori || null;

    let sql = `
      SELECT p.*, k.nama AS kategori_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      sql += ' AND p.nama LIKE ?';
      params.push(`%${q}%`);
    }
    if (kategoriId) {
      sql += ' AND p.kategori_id = ?';
      params.push(kategoriId);
    }
    sql += ' ORDER BY p.created_at DESC';

    const [produk] = await db.query(sql, params);
    const kategori = await Kategori.all();

    res.render('produk/index', {
      produk,
      kategori,
      q,
      activeKategori: kategoriId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, k.nama AS kategori_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.redirect('/produk');
    res.render('produk/detail', { produk: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};