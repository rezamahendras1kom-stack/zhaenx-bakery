const db = require('../config/db');

exports.index = async (req, res) => {
  try {
    const [unggulan] = await db.query(`
      SELECT p.*, k.nama AS kategori_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.stok > 0
      ORDER BY p.created_at DESC
      LIMIT 4
    `);

    const [[{ total_produk }]] = await db.query('SELECT COUNT(*) AS total_produk FROM produk');
    const [[{ total_pesanan }]] = await db.query('SELECT COUNT(*) AS total_pesanan FROM pesanan');

    res.render('home', {
      unggulan,
      stats: { total_produk, total_pesanan }
    });
  } catch (err) {
    console.error(err);
    res.render('home', { unggulan: [], stats: { total_produk: 0, total_pesanan: 0 } });
  }
};

exports.teamdev = (req, res) => {
  res.render('teamdev');
};