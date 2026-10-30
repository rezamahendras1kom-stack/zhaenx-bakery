const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// ===== REGISTER =====
exports.showRegister = (req, res) => {
  res.render('auth/register', { error: null, old: {} });
};

exports.postRegister = async (req, res) => {
  const { nama, email, password, konfirmasi } = req.body;

  try {
    // validasi
    if (!nama || !email || !password) {
      return res.render('auth/register', {
        error: 'Semua field wajib diisi',
        old: { nama, email }
      });
    }
    if (password.length < 6) {
      return res.render('auth/register', {
        error: 'Password minimal 6 karakter',
        old: { nama, email }
      });
    }
    if (password !== konfirmasi) {
      return res.render('auth/register', {
        error: 'Password dan konfirmasi tidak sama',
        old: { nama, email }
      });
    }

    // cek email udah dipakai
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.render('auth/register', {
        error: 'Email sudah terdaftar',
        old: { nama, email }
      });
    }

    // hash password & simpan
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ nama, email, password: hashed });

    res.redirect('/login?registered=1');
  } catch (err) {
    console.error(err);
    res.render('auth/register', {
      error: 'Terjadi kesalahan server',
      old: { nama, email }
    });
  }
};

// ===== LOGIN =====
exports.showLogin = (req, res) => {
  res.render('auth/login', {
    error: null,
    success: req.query.registered ? 'Registrasi berhasil! Silakan login.' : null,
    old: {}
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.render('auth/login', {
        error: 'Email atau password salah',
        success: null,
        old: { email }
      });
    }

    const cocok = await bcrypt.compare(password, user.password);
    if (!cocok) {
      return res.render('auth/login', {
        error: 'Email atau password salah',
        success: null,
        old: { email }
      });
    }

    // simpan ke session
    req.session.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    // redirect berdasarkan role
    if (user.role === 'admin') return res.redirect('/admin/produk');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      error: 'Terjadi kesalahan server',
      success: null,
      old: { email }
    });
  }
};

// ===== LOGOUT =====
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};