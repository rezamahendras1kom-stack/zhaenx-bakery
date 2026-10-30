-- ============================================
-- DATABASE TOKO KUE (TiDB Compatible)
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

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO users (nama, email, password, role) VALUES
('zhaenx', 'rezamahendra.s1kom@gmail.com', '$2b$10$TjnDfRFec0//hyBAeFj5ROlQr7TcKeIEupqz60/rxLRxt4J5fRBNG', 'admin'),
('user-budi', 'budi@mail.com', '$2b$10$E32UwZEJfp38C9DftHWlF.zqvP2Tu0bSU4GU3ID43oxMmfm7avSRu', 'user');

INSERT INTO kategori (id, nama) VALUES
(1, 'Kue Basah'),
(2, 'Kue Kering'),
(3, 'Bolu'),
(4, 'Tart');

INSERT INTO produk (kategori_id, nama, harga, stok, gambar, deskripsi) VALUES
(3, 'tart', 20000, 8, 'produk-1793044957184.jpeg', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.');

INSERT INTO pesanan (id, user_id, tanggal, total, status) VALUES
(1, 1, '2026-10-27 04:32:04', 20000, 'diproses'),
(2, 1, '2026-10-30 07:24:55', 20000, 'diproses'),
(3, 1, '2026-10-30 07:26:16', 200000, 'pending');

INSERT INTO detail_pesanan (pesanan_id, produk_id, qty, subtotal) VALUES
(1, 1, 1, 20000),
(2, 1, 1, 20000),
(3, 1, 10, 200000);

COMMIT;

SHOW TABLES;