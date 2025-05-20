-- DROP TABLES in korrekter Reihenfolge wegen Abhängigkeiten
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Neuanlage der Tabellen
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE CHECK (
        name IN ('Admin', 'Seller', 'Customer')
    )
);

INSERT INTO roles (name)
VALUES
  ('Admin'),
  ('Seller'),
  ('Customer')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE CHECK (
        status IN ('validated', 'notValidated')
    )
);

INSERT INTO user_status (status) VALUES
    ('validated'),
    ('notValidated')
ON CONFLICT (status) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL DEFAULT 3 REFERENCES roles(id) ON DELETE CASCADE,
    status_id INT NOT NULL REFERENCES user_status(id) DEFAULT 2,
    street VARCHAR(100) NOT NULL,
    house_number VARCHAR(10) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- Hauptkategorien
INSERT INTO categories (name, parent_id) VALUES
  ('Pixel Art', NULL),         -- ID 1
  ('Limited Editions', NULL),  -- ID 2
  ('Collaborations', NULL);    -- ID 3

-- Unterkategorien von "Pixel Art"
INSERT INTO categories (name, parent_id) VALUES
  ('Animals', 1),
  ('Landscapes', 1),
  ('Abstract', 1),
  ('Fantasy', 1),
  ('Sci-Fi', 1);

-- Unterkategorien von "Limited Editions"
INSERT INTO categories (name, parent_id) VALUES
  ('Seasonal Drops', 2),
  ('One-of-Ones', 2),
  ('Timed Sales', 2);

-- Unterkategorien von "Collaborations"
INSERT INTO categories (name, parent_id) VALUES
  ('Artists', 3),
  ('Brands', 3),
  ('Community Projects', 3);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE (wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price NUMERIC(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
)
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    UNIQUE (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
     rating NUMERIC(2,1) NOT NULL CHECK (
        rating IN (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, product_id)
);