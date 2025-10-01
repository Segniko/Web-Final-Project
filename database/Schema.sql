--CREATE DATABASE
CREATE DATABASE webproject;

--Connecting to the Database
\c webproject

--CREATE TYPE
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
       CREATE TYPE product_category AS ENUM ('men', 'women', 'neutral', 'electronics');
   END IF;
END$$;

-- CREATE PRODUCTS TABLE 
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category product_category NOT NULL,
    rate NUMERIC(2,1) CHECK (rate >= 1 AND rate <= 5),
    price NUMERIC(10,2) NOT NULL,
    image_url VARCHAR(255)
);

-- Insert sample products
INSERT INTO products (name, category, rate, price, image_url) VALUES
('Running Shoes', 'men', 4.5, 59.99, '/images/shoes.jpg'),
('Handbag', 'women', 4.2, 89.99, '/images/handbag.jpg'),
('Smartphone', 'electronics', 4.8, 699.00, '/images/phone.jpg'),
('Unisex Hoodie', 'neutral', 4.0, 39.99, '/images/hoodie.jpg');

SELECT * FROM products;

-- Altered the products table by adding the column created_at with default current timestamp
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Altered the products table by adding the column sales_count with default 0
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Update existing products with random sales count (for demo purposes)
UPDATE products 
SET 
    created_at = CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL,
    sales_count = FLOOR(RANDOM() * 100);

-- INSERTED NEW 30 PRODUCTS TO THE DATABASE[UPON THE FIRST INSERTION]
-- 9 Men's products
INSERT INTO products (name, category, rate, price, image_url, created_at, sales_count) VALUES
-- Men's Clothing
('Men''s Slim Fit Jeans', 'men', 4.5, 49.99, '/images/products/mens_jeans.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Classic White T-Shirt', 'men', 4.2, 19.99, '/images/products/mens_tshirt.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Men''s Casual Blazer', 'men', 4.6, 129.99, '/images/products/mens_blazer.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Men's Shoes
('Leather Dress Shoes', 'men', 4.4, 89.99, '/images/products/mens_shoes.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Men''s Running Shoes', 'men', 4.7, 79.99, '/images/products/mens_running.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Men''s Sandals', 'men', 4.1, 34.99, '/images/products/mens_sandals.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Men's Accessories
('Leather Belt', 'men', 4.3, 29.99, '/images/products/mens_belt.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Men''s Watch', 'men', 4.8, 149.99, '/images/products/mens_watch.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Men''s Sunglasses', 'men', 4.0, 59.99, '/images/products/mens_sunglasses.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- 9 Women's products
-- Women's Clothing
('Women''s Summer Dress', 'women', 4.6, 59.99, '/images/products/womens_dress.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Blouse', 'women', 4.3, 34.99, '/images/products/womens_blouse.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Skinny Jeans', 'women', 4.4, 54.99, '/images/products/womens_jeans.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Women's Shoes
('Women''s High Heels', 'women', 4.2, 69.99, '/images/products/womens_heels.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Sneakers', 'women', 4.5, 64.99, '/images/products/womens_sneakers.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Boots', 'women', 4.7, 89.99, '/images/products/womens_boots.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Women's Accessories
('Leather Handbag', 'women', 4.8, 99.99, '/images/products/womens_handbag.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Necklace', 'women', 4.6, 79.99, '/images/products/womens_necklace.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Women''s Scarf', 'women', 4.1, 24.99, '/images/products/womens_scarf.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- 9 Electronics products
-- Smartphones
('Smartphone Pro Max', 'electronics', 4.8, 999.99, '/images/products/phone_pro.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Budget Smartphone', 'electronics', 4.2, 199.99, '/images/products/phone_budget.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Gaming Phone', 'electronics', 4.6, 849.99, '/images/products/phone_gaming.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Laptops
('Ultrabook Laptop', 'electronics', 4.7, 1299.99, '/images/products/laptop_ultra.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Gaming Laptop', 'electronics', 4.5, 1599.99, '/images/products/laptop_gaming.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Chromebook', 'electronics', 4.0, 349.99, '/images/products/laptop_chrome.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- Accessories
('Wireless Earbuds', 'electronics', 4.4, 129.99, '/images/products/earbuds.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Smart Watch', 'electronics', 4.6, 249.99, '/images/products/smartwatch.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Bluetooth Speaker', 'electronics', 4.3, 89.99, '/images/products/speaker.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),

-- 3 Neutral products
('Unisex Backpack', 'neutral', 4.5, 59.99, '/images/products/backpack.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Cotton Socks (3-Pack)', 'neutral', 4.2, 19.99, '/images/products/socks.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100)),
('Beanie Hat', 'neutral', 4.0, 24.99, '/images/products/beanie.jpg', CURRENT_TIMESTAMP - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL, FLOOR(RANDOM() * 100));

-- VERIFYING THE NEW PRODUCTS ARE ADDED 
SELECT COUNT(*) as total_products, category 
FROM products 
GROUP BY category 
ORDER BY total_products DESC;

--ALTERING THE PRODUCTS TABLE BY ADDING THE COLUMN DESCRIPTIONS 
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Update descriptions for all products
UPDATE products SET description = 'High-performance running shoes with superior cushioning and support for all types of runners.' WHERE id = 1;
UPDATE products SET description = 'Elegant and spacious handbag with multiple compartments for your daily essentials.' WHERE id = 2;
UPDATE products SET description = 'Feature-packed smartphone with advanced camera system and long-lasting battery life.' WHERE id = 3;
UPDATE products SET description = 'Comfortable unisex hoodie made from premium cotton blend, perfect for any casual occasion.' WHERE id = 4;
UPDATE products SET description = 'Slim fit jeans with stretch technology for maximum comfort and modern style.' WHERE id = 5;
UPDATE products SET description = 'Classic white t-shirt made from 100% organic cotton, perfect for layering or wearing alone.' WHERE id = 6;
UPDATE products SET description = 'Versatile casual blazer that transitions seamlessly from office to evening wear.' WHERE id = 7;
UPDATE products SET description = 'Premium leather dress shoes with cushioned insoles for all-day comfort.' WHERE id = 8;
UPDATE products SET description = 'Lightweight running shoes with responsive cushioning for optimal performance.' WHERE id = 9;
UPDATE products SET description = 'Comfortable and durable sandals with adjustable straps for a perfect fit.' WHERE id = 10;
UPDATE products SET description = 'Genuine leather belt with polished metal buckle, suitable for both casual and formal wear.' WHERE id = 11;
UPDATE products SET description = 'Elegant men''s watch with chronograph function and water resistance up to 50m.' WHERE id = 12;
UPDATE products SET description = 'Stylish sunglasses with UV400 protection and polarized lenses.' WHERE id = 13;
UPDATE products SET description = 'Flowy summer dress in a vibrant pattern, perfect for warm weather occasions.' WHERE id = 14;
UPDATE products SET description = 'Classic women''s blouse with delicate details that can be dressed up or down.' WHERE id = 15;
UPDATE products SET description = 'Slimming skinny jeans with just the right amount of stretch for all-day comfort.' WHERE id = 16;
UPDATE products SET description = 'Elegant high heels with cushioned insoles for added comfort during extended wear.' WHERE id = 17;
UPDATE products SET description = 'Versatile women''s sneakers that combine style and comfort for everyday wear.' WHERE id = 18;
UPDATE products SET description = 'Knee-high boots with a comfortable heel height and premium leather construction.' WHERE id = 19;
UPDATE products SET description = 'Spacious leather handbag with multiple compartments and adjustable strap.' WHERE id = 20;
UPDATE products SET description = 'Elegant necklace that adds a touch of sophistication to any outfit.' WHERE id = 21;
UPDATE products SET description = 'Soft and cozy scarf in a versatile color that complements any wardrobe.' WHERE id = 22;
UPDATE products SET description = 'Flagship smartphone with professional-grade camera system and all-day battery life.' WHERE id = 23;
UPDATE products SET description = 'Affordable smartphone with essential features and reliable performance.' WHERE id = 24;
UPDATE products SET description = 'High-performance gaming phone with advanced cooling system and ultra-responsive display.' WHERE id = 25;
UPDATE products SET description = 'Ultra-thin and lightweight laptop with powerful performance for work and play.' WHERE id = 26;
UPDATE products SET description = 'High-performance gaming laptop with advanced graphics and fast refresh rate display.' WHERE id = 27;
UPDATE products SET description = 'Affordable and efficient Chromebook perfect for browsing, streaming, and productivity.' WHERE id = 28;
UPDATE products SET description = 'True wireless earbuds with crystal clear sound and noise cancellation.' WHERE id = 29;
UPDATE products SET description = 'Feature-rich smartwatch with health monitoring and smartphone connectivity.' WHERE id = 30;
UPDATE products SET description = 'Portable Bluetooth speaker with rich, room-filling sound and long battery life.' WHERE id = 31;
UPDATE products SET description = 'Durable unisex backpack with padded laptop compartment and multiple storage pockets.' WHERE id = 32;
UPDATE products SET description = 'Comfortable 3-pack of cotton socks with reinforced heels and toes for durability.' WHERE id = 33;
UPDATE products SET description = 'Warm and stylish beanie hat made from soft, breathable material.' WHERE id = 34;

--Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT NOT NULL
);

-- Inserted email column to transactions for customer contact
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add item_list column to transactions for storing multiple items
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS item_list JSON;

--Updated the images url for all products
UPDATE products
SET image_url = '/images/' || id || '.jpg'
WHERE id IS NOT NULL;

-- Users table
CREATE TABLE admin (
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fname VARCHAR(50) NOT NULL
);