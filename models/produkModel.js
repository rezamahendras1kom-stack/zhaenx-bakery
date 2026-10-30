const db = require('../config/db');

const Produk = {
  async all() {
    const [rows] = await db.query(`
      SELECT p.*, k.nama AS kategori_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  async byId(id) {
    const [rows] = await db.query(`
      SELECT p.*, k.nama AS kategori_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ kategori_id, nama, harga, stok, gambar, deskripsi }) {
    const [r] = await db.query(
      'INSERT INTO produk (kategori_id, nama, harga, stok, gambar, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
      [kategori_id || null, nama, harga, stok, gambar || null, deskripsi || null]
    );
    return r.insertId;
  },

  async update(id, { kategori_id, nama, harga, stok, gambar, deskripsi }) {
    await db.query(
      'UPDATE produk SET kategori_id = ?, nama = ?, harga = ?, stok = ?, gambar = ?, deskripsi = ? WHERE id = ?',
      [kategori_id || null, nama, harga, stok, gambar || null, deskripsi || null, id]
    );
  },

  async destroy(id) {
    await db.query('DELETE FROM produk WHERE id = ?', [id]);
  }
};

module.exports = Produk;