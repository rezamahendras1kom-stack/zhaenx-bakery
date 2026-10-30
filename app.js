const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
require('./config/db');

const app = express();

// ===== MIDDLEWARE DASAR =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== SESSION — HARUS SEBELUM SEMUA ROUTES =====
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true }
}));

// ===== VIEW ENGINE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== GLOBAL VARIABLES — HARUS SETELAH SESSION =====
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = res.locals.cart.reduce((s, i) => s + i.qty, 0);
  next();
});

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminProdukRoutes = require('./routes/adminProduk');
const adminPesananRoutes = require('./routes/adminPesanan');
const produkRoutes = require('./routes/produk');
const cartRoutes = require('./routes/cart');
const pesananRoutes = require('./routes/pesanan');

// auth (login/register/logout)
app.use('/', authRoutes);

// admin dashboard → HARUS paling atas karena prefix `/admin`
app.use('/admin', adminDashboardRoutes);

// admin sub-routes (lebih spesifik, jadi gak bentrok)
app.use('/admin/produk', adminProdukRoutes);
app.use('/admin/pesanan', adminPesananRoutes);

// public routes
app.use('/produk', produkRoutes);
app.use('/keranjang', cartRoutes);
app.use('/pesanan', pesananRoutes);

// home & tentang → PALING BAWAH karena prefix `/`
app.use('/', homeRoutes);

// ===== 404 & ERROR HANDLER =====
app.use((req, res) => res.status(404).send('404 — Halaman tidak ditemukan'));
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).send('500 — ' + err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server jalan di http://localhost:${PORT}`));