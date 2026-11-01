-- ============================================
-- DATABASE TOKO KUE — FRESH (kosong kecuali kategori)
-- Import ke database: test
-- ============================================

DROP TABLE IF EXISTS detail_pesanan;
DROP TABLE IF EXISTS pesanan;
DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS kategori;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id INT,
  nama VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  stok INT DEFAULT 0,
  gambar VARCHAR(255),
  deskripsi TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pesanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
  total INT DEFAULT 0,
  status ENUM('pending','diproses','selesai') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE detail_pesanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pesanan_id INT,
  produk_id INT,
  qty INT NOT NULL,
  subtotal INT NOT NULL,
  FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed kategori dasar
INSERT INTO kategori (nama) VALUES 
  ('Kue Basah'),
  ('Kue Kering'),
  ('Bolu'),
  ('Tart');

-- Verifikasi
SELECT 'users' AS tabel, COUNT(*) AS jumlah FROM users
UNION ALL SELECT 'kategori', COUNT(*) FROM kategori
UNION ALL SELECT 'produk', COUNT(*) FROM produk
UNION ALL SELECT 'pesanan', COUNT(*) FROM pesanan
UNION ALL SELECT 'detail_pesanan', COUNT(*) FROM detail_pesanan;