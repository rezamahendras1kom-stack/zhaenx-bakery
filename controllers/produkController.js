const Produk = require("../models/produkModel");
const Kategori = require("../models/kategoriModel");
const fs = require("fs");
const path = require("path");

// ===== LIST =====
exports.index = async (req, res) => {
  try {
    const produk = await Produk.all();
    res.render("admin/produk/index", {
      produk,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
};

// ===== FORM TAMBAH =====
exports.showCreate = async (req, res) => {
  const kategori = await Kategori.all();
  res.render("admin/produk/form", {
    produk: null,
    kategori,
    error: null,
    action: "/admin/produk",
  });
};

// ===== PROSES TAMBAH =====
exports.create = async (req, res) => {
  try {
    const { kategori_id, nama, harga, stok, deskripsi } = req.body;

    if (!nama || !harga) {
      const kategori = await Kategori.all();
      return res.render("admin/produk/form", {
        produk: req.body,
        kategori,
        error: "Nama dan harga wajib diisi",
        action: "/admin/produk",
      });
    }

    // Prioritas: URL > file upload
    let gambar = null;
    if (req.body.gambar_url && req.body.gambar_url.trim() !== "") {
      gambar = req.body.gambar_url.trim();
    } else if (req.file) {
      gambar = req.file.filename;
    }

    await Produk.create({
      kategori_id: kategori_id ? parseInt(kategori_id) : null,
      nama,
      harga: parseInt(harga),
      stok: parseInt(stok) || 0,
      gambar,
      deskripsi,
    });

    res.redirect("/admin/produk?success=Produk berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
};

// ===== FORM EDIT =====
exports.showEdit = async (req, res) => {
  try {
    const produk = await Produk.byId(req.params.id);
    if (!produk) return res.redirect("/admin/produk");

    const kategori = await Kategori.all();
    res.render("admin/produk/form", {
      produk,
      kategori,
      error: null,
      action: `/admin/produk/${produk.id}?_method=PUT`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
};

// ===== PROSES EDIT =====
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const lama = await Produk.byId(id);
    if (!lama) return res.redirect("/admin/produk");

    const { kategori_id, nama, harga, stok, deskripsi } = req.body;

    // Kalau ada gambar baru → hapus gambar lama
    let gambar = lama.gambar;

    // Helper hapus file lokal lama (kalau ada)
    const hapusFileLama = (namaFile) => {
      if (!namaFile || namaFile.startsWith("http")) return; // skip URL
      const oldPath = path.join(__dirname, "..", "public", "uploads", namaFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    };

    // Prioritas: URL baru > file baru > gambar lama
    if (req.body.gambar_url && req.body.gambar_url.trim() !== "") {
      hapusFileLama(lama.gambar);
      gambar = req.body.gambar_url.trim();
    } else if (req.file) {
      hapusFileLama(lama.gambar);
      gambar = req.file.filename;
    }
    // else: gambar tetap sama (gak diubah)

    await Produk.update(id, {
      kategori_id: kategori_id ? parseInt(kategori_id) : null,
      nama,
      harga: parseInt(harga),
      stok: parseInt(stok) || 0,
      gambar,
      deskripsi,
    });

    res.redirect("/admin/produk?success=Produk berhasil diupdate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
};

// ===== HAPUS =====
exports.destroy = async (req, res) => {
  try {
    const produk = await Produk.byId(req.params.id);
    if (!produk) return res.redirect("/admin/produk");

    // Hapus file gambar
    if (produk.gambar) {
      const p = path.join(__dirname, "..", "public", "uploads", produk.gambar);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    await Produk.destroy(req.params.id);
    res.redirect("/admin/produk?success=Produk berhasil dihapus");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
};
