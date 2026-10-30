const db = require('../config/db');

exports.dashboard = async (req, res) => {
  try {
    const [[{ total_produk }]]    = await db.query('SELECT COUNT(*) AS total_produk FROM produk');
    const [[{ total_pesanan }]]   = await db.query('SELECT COUNT(*) AS total_pesanan FROM pesanan');
    const [[{ total_user }]]      = await db.query("SELECT COUNT(*) AS total_user FROM users WHERE role = 'user'");
    const [[{ pendapatan }]]      = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS pendapatan FROM pesanan WHERE status = 'selesai'"
    );

    const [pesananTerbaru] = await db.query(`
      SELECT p.*, u.nama AS user_nama
      FROM pesanan p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.tanggal DESC
      LIMIT 5
    `);

    res.render('admin/dashboard', {
      stats: { total_produk, total_pesanan, total_user, pendapatan },
      pesananTerbaru
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};