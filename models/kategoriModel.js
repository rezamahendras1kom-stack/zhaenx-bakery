const db = require('../config/db');

const Kategori = {
  async all() {
    const [rows] = await db.query('SELECT * FROM kategori ORDER BY nama');
    return rows;
  }
};

module.exports = Kategori;