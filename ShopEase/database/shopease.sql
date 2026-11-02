CREATE DATABASE IF NOT EXISTS shopease
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopease;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(25) NOT NULL,
  payment_method ENUM('Cash on Delivery','UPI (Demo)','Card (Demo)')
    NOT NULL DEFAULT 'Cash on Delivery',
  status ENUM('Placed','Processing','Shipped','Delivered','Cancelled')
    NOT NULL DEFAULT 'Placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(180) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO products (name,description,category,price,image_url,stock) VALUES
('Classic Sneakers','Comfortable everyday sneakers with a clean modern look.','Fashion',2499,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700',20),
('Wireless Headphones','Over-ear wireless headphones for music and calls.','Electronics',3299,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',15),
('Smart Watch','A stylish smartwatch for everyday use.','Electronics',4599,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',12),
('Travel Backpack','Lightweight backpack for college and travel.','Accessories',1799,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700',25),
('Minimal Desk Lamp','Modern desk lamp for your study table.','Home',1299,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700',10),
('Cotton T-Shirt','Soft everyday cotton T-shirt.','Fashion',799,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700',30)
ON DUPLICATE KEY UPDATE name=VALUES(name);
