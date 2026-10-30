const Produk = require('../models/produkModel');

// ===== LIHAT KERANJANG =====
exports.index = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  res.render('keranjang/index', { cart, total });
};

// ===== TAMBAH KE KERANJANG =====
exports.tambah = async (req, res) => {
  try {
    const { produk_id, qty } = req.body;
    const qtyNum = Math.max(1, parseInt(qty) || 1);

    const produk = await Produk.byId(produk_id);
    if (!produk) return res.redirect('/produk');

    if (produk.stok < qtyNum) {
      return res.redirect(`/produk/${produk_id}?err=stok`);
    }

    req.session.cart = req.session.cart || [];

    const existing = req.session.cart.find(i => i.produk_id == produk_id);
    if (existing) {
      const newQty = existing.qty + qtyNum;
      if (newQty > produk.stok) {
        return res.redirect(`/produk/${produk_id}?err=stok`);
      }
      existing.qty = newQty;
      existing.subtotal = existing.qty * existing.harga;
    } else {
      req.session.cart.push({
        produk_id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        gambar: produk.gambar,
        qty: qtyNum,
        subtotal: produk.harga * qtyNum
      });
    }

    req.session.save(() => res.redirect('/keranjang'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};

// ===== UPDATE QTY =====
exports.update = (req, res) => {
  const { produk_id, qty } = req.body;
  const qtyNum = parseInt(qty);

  if (!req.session.cart) return res.redirect('/keranjang');

  if (qtyNum <= 0) {
    req.session.cart = req.session.cart.filter(i => i.produk_id != produk_id);
  } else {
    const item = req.session.cart.find(i => i.produk_id == produk_id);
    if (item) {
      item.qty = qtyNum;
      item.subtotal = item.harga * qtyNum;
    }
  }

  req.session.save(() => res.redirect('/keranjang'));
};

// ===== HAPUS ITEM =====
exports.hapus = (req, res) => {
  const { produk_id } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(i => i.produk_id != produk_id);
  }
  req.session.save(() => res.redirect('/keranjang'));
};