const pool = require("../../config/db"); 

// Get all products
async function getAllProducts() {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    return result.rows;
}

// Get product by ID
async function getProductById(id) {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] || null;
}

// Add a new product
async function createProduct(product) {
    const { name, category, rate, price, image_url, description } = product;
    const client = await pool.connect();
    try {
        const insertRes = await client.query(
            `INSERT INTO products (name, category, rate, price, image_url, description) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, category, rate, price, image_url, description]
        );

        await client.query('COMMIT');
        return insertRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Delete product
async function deleteProduct(id) {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
}

// Update product
async function updateProduct(id, product) {
    const { name, category, rate, price, image_url, description } = product;
    const result = await pool.query(
        `UPDATE products 
        SET name = $1, category = $2, rate = $3, price = $4, image_url = $5, description = $6
         WHERE id = $7 RETURNING *`,
        [name, category, rate, price, image_url, description, id]
    );
    return result.rows[0] || null;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};