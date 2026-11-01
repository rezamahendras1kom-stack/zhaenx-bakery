// ============================================================================
// TOKO KUE ZHAENX BAKERY — ENTRY POINT APLIKASI
// File: app.js
// ============================================================================

// ===== 1. IMPORT DEPENDENSI =====
const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config(); // Load .env (DB, SESSION_SECRET, PORT)
require("./config/db"); // Konek ke database (auto-test saat import)

// ===== 2. INISIALISASI APP =====
const app = express();

// ============================================================================
// 3. MIDDLEWARE DASAR
// Urutan PENTING: parser body & static file dulu, session belakangan
// ============================================================================

// Parser untuk form POST (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Parser untuk body JSON (kalau nanti ada request API/AJAX)
app.use(express.json());

// Sajikan file statis (CSS, JS, gambar upload) dari folder /public
// Contoh: /css/style.css → public/css/style.css
app.use(express.static(path.join(__dirname, "public")));

// ============================================================================
// 4. SESSION MIDDLEWARE
// Menyimpan data login user & keranjang belanja
// HARUS dipasang SEBELUM route manapun yang akses req.session
// ============================================================================
app.use(
  session({
    secret: process.env.SESSION_SECRET, // kunci enkripsi cookie session
    resave: false, // jangan simpan ulang kalau tidak berubah
    saveUninitialized: false, // jangan bikin session untuk user yang belum login
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // session expired dalam 2 jam
      httpOnly: true, // cookie tidak bisa diakses JavaScript (anti XSS)
    },
  }),
);

// ============================================================================
// 5. VIEW ENGINE (EJS)
// Memberitahu Express untuk render file .ejs dari folder /views
// ============================================================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================================================
// 6. GLOBAL VARIABLES UNTUK SEMUA VIEW (res.locals)
// Variabel ini otomatis tersedia di semua file EJS tanpa perlu pass manual
// ============================================================================
app.use((req, res, next) => {
  // Data user yang login (atau null kalau belum login)
  res.locals.user = req.session.user || null;

  // Item di keranjang belanja (array)
  res.locals.cart = req.session.cart || [];

  // Total qty semua item di keranjang (buat badge di navbar)
  res.locals.cartCount = res.locals.cart.reduce(
    (sum, item) => sum + item.qty,
    0,
  );

  // HELPER: imgUrl(gambar)
  // Deteksi otomatis apakah gambar berupa URL eksternal atau file upload lokal
  // - Kalau URL (http/https) → return URL-nya langsung
  // - Kalau nama file (misal: produk-123.jpg) → return /uploads/produk-123.jpg
  res.locals.imgUrl = (gambar) => {
    if (!gambar) return null;
    if (gambar.startsWith("http://") || gambar.startsWith("https://")) {
      return gambar;
    }
    return `/uploads/${gambar}`;
  };

  next();
});

// ============================================================================
// 7. ROUTES
// IMPORT semua file route
// Urutan app.use PENTING: prefix yang lebih spesifik dulu, baru yang umum
// ============================================================================
const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const adminDashboardRoutes = require("./routes/adminDashboard");
const adminProdukRoutes = require("./routes/adminProduk");
const adminPesananRoutes = require("./routes/adminPesanan");
const produkRoutes = require("./routes/produk");
const cartRoutes = require("./routes/cart");
const pesananRoutes = require("./routes/pesanan");

// --- Auth: /login, /register, /logout ---
app.use("/", authRoutes);

// --- Admin dashboard: /admin (HARUS paling atas sebelum sub-route /admin/*) ---
app.use("/admin", adminDashboardRoutes);

// --- Admin CRUD produk: /admin/produk/* ---
app.use("/admin/produk", adminProdukRoutes);

// --- Admin kelola pesanan: /admin/pesanan/* ---
app.use("/admin/pesanan", adminPesananRoutes);

// --- Katalog user: /produk, /produk/:id ---
app.use("/produk", produkRoutes);

// --- Keranjang: /keranjang, /keranjang/tambah, dst ---
app.use("/keranjang", cartRoutes);

// --- Riwayat & checkout pesanan: /pesanan/* ---
app.use("/pesanan", pesananRoutes);

// --- Home & tentang: / , /tentang (PALING BAWAH karena prefix umum) ---
app.use("/", homeRoutes);

// ============================================================================
// 8. 404 HANDLER
// Kalau request tidak match dengan route manapun di atas
// ============================================================================
app.use((req, res) => {
  res.status(404).send("404 — Halaman tidak ditemukan");
});

// ============================================================================
// 9. ERROR HANDLER
// Menangkap error yang di-throw dari route (kalau pakai next(err))
// HARUS 4 parameter: (err, req, res, next)
// ============================================================================
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  res.status(500).send("500 — " + err.message);
});

// ============================================================================
// 10. START SERVER
// PORT dari .env, atau default 3000
// '0.0.0.0' wajib untuk platform cloud (ApexWeave/Render/SnapDeploy, dll)
// ============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});