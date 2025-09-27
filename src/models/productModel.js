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
        await client.query('BEGIN');
        // Lock the products table to compute a stable next id and avoid race conditions
        await client.query('LOCK TABLE products IN EXCLUSIVE MODE');
        const maxRes = await client.query('SELECT COALESCE(MAX(id), 0) AS max_id FROM products');
        const nextId = Number(maxRes.rows[0].max_id) + 1;

        const insertRes = await client.query(
            `INSERT INTO products (id, name, category, rate, price, image_url, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nextId, name, category, rate, price, image_url, description]
        );

        // Ensure the sequence backing the serial column is in sync
        // pg_get_serial_sequence returns the sequence name for the table.column
        const seqNameRes = await client.query("SELECT pg_get_serial_sequence('products','id') AS seqname");
        const seqName = seqNameRes.rows[0].seqname;
        if (seqName) {
            await client.query('SELECT setval($1, $2, true)', [seqName, nextId]);
        }

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