const db = require('../config/db');

// ===== FORM CHECKOUT =====
exports.showCheckout = (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/keranjang');
  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  res.render('pesanan/checkout', { cart, total });
};

// ===== PROSES CHECKOUT (PAKAI TRANSACTION) =====
exports.checkout = async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/keranjang');

  const user_id = req.session.user.id;
  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Bikin pesanan
    const [r] = await conn.query(
      'INSERT INTO pesanan (user_id, total, status) VALUES (?, ?, ?)',
      [user_id, total, 'pending']
    );
    const pesananId = r.insertId;

    // 2. Insert detail + kurangi stok
    for (const item of cart) {
      // cek stok terkini
      const [p] = await conn.query('SELECT stok FROM produk WHERE id = ? FOR UPDATE', [item.produk_id]);
      if (p.length === 0 || p[0].stok < item.qty) {
        throw new Error(`Stok "${item.nama}" tidak cukup`);
      }

      await conn.query(
        'INSERT INTO detail_pesanan (pesanan_id, produk_id, qty, subtotal) VALUES (?, ?, ?, ?)',
        [pesananId, item.produk_id, item.qty, item.subtotal]
      );

      await conn.query(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.qty, item.produk_id]
      );
    }

    await conn.commit();

    // Kosongin cart
    req.session.cart = [];
    req.session.save(() => res.redirect(`/pesanan/${pesananId}?success=1`));
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).send('Checkout gagal: ' + err.message);
  } finally {
    conn.release();
  }
};

// ===== RIWAYAT PESANAN USER =====
exports.riwayat = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM pesanan WHERE user_id = ? ORDER BY tanggal DESC',
      [req.session.user.id]
    );
    res.render('pesanan/riwayat', { pesanan: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

// ===== DETAIL PESANAN =====
exports.detail = async (req, res) => {
  try {
    const [p] = await db.query(
      'SELECT * FROM pesanan WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.user.id]
    );
    if (p.length === 0) return res.redirect('/pesanan');

    const [detail] = await db.query(`
      SELECT d.*, pr.nama, pr.gambar
      FROM detail_pesanan d
      JOIN produk pr ON d.produk_id = pr.id
      WHERE d.pesanan_id = ?
    `, [req.params.id]);

    res.render('pesanan/detail', {
      pesanan: p[0],
      detail,
      success: req.query.success === 'cancelled' ? 'Pesanan berhasil dibatalkan.' 
             : req.query.success ? 'Pesanan berhasil dibuat!' 
             : null,
      error: req.query.err === 'cannot_cancel' 
             ? 'Pesanan tidak bisa dibatalkan (status bukan pending).' 
             : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

// ===== ADMIN: LIHAT SEMUA PESANAN =====
exports.adminIndex = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nama AS user_nama
      FROM pesanan p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.tanggal DESC
    `);
    res.render('admin/pesanan/index', { pesanan: rows, success: req.query.success || null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

// ===== ADMIN: UBAH STATUS =====
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'diproses', 'selesai'].includes(status)) {
      return res.redirect('/admin/pesanan');
    }
    await db.query('UPDATE pesanan SET status = ? WHERE id = ?', [status, req.params.id]);
    res.redirect('/admin/pesanan?success=Status berhasil diubah');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

// ===== USER: BATALKAN PESANAN =====
exports.cancel = async (req, res) => {
  const user_id = req.session.user.id;
  const pesananId = req.params.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Ambil pesanan milik user (LOCK)
    const [rows] = await conn.query(
      'SELECT * FROM pesanan WHERE id = ? AND user_id = ? FOR UPDATE',
      [pesananId, user_id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.redirect('/pesanan?err=notfound');
    }

    if (rows[0].status !== 'pending') {
      await conn.rollback();
      return res.redirect(`/pesanan/${pesananId}?err=cannot_cancel`);
    }

    // Ambil detail untuk restock
    const [details] = await conn.query(
      'SELECT produk_id, qty FROM detail_pesanan WHERE pesanan_id = ?',
      [pesananId]
    );

    // Kembalikan stok
    for (const d of details) {
      await conn.query(
        'UPDATE produk SET stok = stok + ? WHERE id = ?',
        [d.qty, d.produk_id]
      );
    }

    // Kalau pesanan pakai kupon, kembalikan kuota kupon
    if (rows[0].kupon_id) {
      await conn.query(
        'UPDATE kupon SET terpakai = GREATEST(terpakai - 1, 0) WHERE id = ?',
        [rows[0].kupon_id]
      );
    }

    // Update status jadi dibatalkan
    await conn.query(
      'UPDATE pesanan SET status = ? WHERE id = ?',
      ['dibatalkan', pesananId]
    );

    await conn.commit();
    res.redirect(`/pesanan/${pesananId}?success=cancelled`);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  } finally {
    conn.release();
  }
};