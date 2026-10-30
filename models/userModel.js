const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT id, nama, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ nama, email, password, role = 'user' }) {
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, password, role]
    );
    return result.insertId;
  }
};

module.exports = User;