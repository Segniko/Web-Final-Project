DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
       CREATE TYPE product_category AS ENUM ('men', 'women', 'neutral', 'electronics');
   END IF;
END$$;

-- Create products table
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

select * from products