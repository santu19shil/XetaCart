-- XetaCart Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor to set up the tables.
-- NOTE: orders/order_items tables are intentionally removed.
-- Orders are placed via WhatsApp by redirecting the customer to the seller.
-- The single seller account is predefined (see backend/config/seller.js).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller')),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_code VARCHAR(50) UNIQUE,
  seller_id BIGINT NOT NULL REFERENCES users(id),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2) NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  rating NUMERIC(3,2) DEFAULT 0.00,
  reviews INTEGER DEFAULT 0,
  is_lightning BOOLEAN DEFAULT FALSE,
  hot_percentage INTEGER DEFAULT 0,
  free_delivery BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
