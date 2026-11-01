const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
});

const db = pool.promise();
(async () => {
  try {
    const [r] = await db.query("SELECT 1 AS ok");
    if (r[0].ok === 1)
      console.log("✅ Database terhubung:", process.env.DB_NAME);
  } catch (e) {
    console.error("❌ Gagal konek:", e.message);
  }
})();

module.exports = db;
