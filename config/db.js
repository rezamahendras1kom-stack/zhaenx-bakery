const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

const db = pool.promise();

(async () => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    if (rows[0].ok === 1)
      console.log("✅ Database terhubung:", process.env.DB_NAME);
  } catch (err) {
    console.error("❌ Gagal konek database:", err.message);
  }
})();

module.exports = db;
