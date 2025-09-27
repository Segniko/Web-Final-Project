const express = require('express');
const app = express();
const path = require('path');
const pool = require('./config/db');

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Increase body parser limits to allow base64 image uploads in JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Serve static files (CSS, JS, images)
// Configures static file serving with proper error handling
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        console.log('Serving static file:', path);
    },
    index: false,
    redirect: false
}));

// Add a specific route for any path ending with .html (Express 5 compatible)
// This supports case-insensitive requests like /FAQ.html or nested paths like /Admin/login.html
app.get(/.*\.html$/i, (req, res, next) => {
    const fs = require('fs');
    const htmlRoot = path.join(__dirname, 'public', 'html');

    // Create a safe relative path (strip leading slash, normalize, prevent traversal)
    const relative = req.path.replace(/^\//, '').toLowerCase();
    const normalized = path.normalize(relative);
    const targetPath = path.join(htmlRoot, normalized);

    // Ensure the resolved path stays within the htmlRoot directory
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(path.resolve(htmlRoot))) {
        return res.status(400).send('Invalid path');
    }

    if (fs.existsSync(resolved)) {
        res.sendFile(resolved, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                next();
            }
        });
    } else {
        next();
    }
});

const authroutes = require('./src/routes/authRoutes.js');
const {requireAuth} = require("./src/middlewares/authMiddleware");
app.use('/auth', authroutes);

const productRoutes = require("./src/routes/productRoutes.js");
app.use(productRoutes);

// Home page products route with optional category filter
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        console.log('API Request - Category:', category);
        
        let query = 'SELECT * FROM products';
        const queryParams = [];
        
        if (category) {
            //Used ILIKE for case insensitive comparison
            query += ' WHERE LOWER(category) = LOWER($1)';
            queryParams.push(category);
            console.log('Query with category filter:', query, queryParams);
        } else {
            console.log('Query without category filter');
        }
        
        query += ' ORDER BY created_at DESC';
        console.log('Final query:', query, queryParams);
        
        const result = await pool.query(query, queryParams);
        console.log('Found products:', result.rows.length);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

//New Arrivals route
app.get('/api/products/new-arrivals', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const newArrivals = await pool.query(
            'SELECT * FROM products ORDER BY created_at DESC LIMIT $1', 
            [limit]
        );
        res.json(newArrivals.rows);
    } catch (err) {
        console.error('Error fetching new arrivals:', err);
        res.status(500).json({ error: 'Error fetching new arrivals' });
    }
});

//Best Sellers route
app.get('/api/products/best-sellers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const bestSellers = await pool.query(
            'SELECT * FROM products ORDER BY sales_count DESC, created_at DESC LIMIT $1', 
            [limit]
        );
        res.json(bestSellers.rows);
    } catch (err) {
        console.error('Error fetching best sellers:', err);
        res.status(500).json({ error: 'Error fetching best sellers' });
    }
});


// API endpoint to get product by ID with detailed information
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const result = await pool.query(
            `SELECT id, name, category, rate, price, image_url, description, 
                    created_at, sales_count 
             FROM products 
             WHERE id = $1`, 
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Format the response
        const product = result.rows[0];
        const response = {
            id: product.id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price),
            rate: parseFloat(product.rate),
            image_url: product.image_url,
            description: product.description || 'No description available',
            created_at: product.created_at,
            sales_count: parseInt(product.sales_count, 10)
        };
        
        res.json(response);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

//Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'landing.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' ,'home.html'));
});


app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'faq.html'));
});

app.get('/returns', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'returns.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'about.html'));
});

app.get('/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'details.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'checkout.html'));
});

app.get('/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' , 'customer-service.html'));
});

app.get('/category/Men', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Men.html'));
});

app.get('/category/Women', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Women.html'));
});

app.get('/category/Electronics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Electronics.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin' ,'login.html'));
});

app.get('/admin/dashboard', requireAuth , (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' , 'admin', 'dashboard.html'));
});

// Utility route for development: clear client-side cart and redirect to checkout
app.get('/clear-cart', (req, res) => {
    res.send(`
        <!doctype html>
        <html>
        <head><meta charset="utf-8"><title>Clearing cart...</title></head>
        <body>
            <script>
                try { localStorage.removeItem('cart'); } catch(e){}
                try { sessionStorage.removeItem('cartItem'); } catch(e){}
                // notify other tabs
                try { window.dispatchEvent(new Event('cart:updated')); } catch(e){}
                // redirect back to checkout
                window.location.href = '/checkout';
            </script>
            <noscript>
                Cart cleared. <a href="/checkout">Continue to checkout</a>
            </noscript>
        </body>
        </html>
    `);
});

// Endpoint to record transactions when a user completes checkout
app.post('/api/transactions', async (req, res) => {
    const client = await pool.connect();
    try {
        const { items, total_amount, payment_method, shipping_address, email } = req.body || {};

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Basic validation
        if (!payment_method || !shipping_address || !email) {
            return res.status(400).json({ error: 'Missing payment method, shipping address, or email' });
        }

        await client.query('BEGIN');
        const inserted = [];

        for (const it of items) {
            const productId = Number(it.id || it.product_id);
            const quantity = Number(it.quantity) || 1;
            const price = Number(it.price) || 0;

            if (!productId || isNaN(productId)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Invalid product id in items' });
            }

            const amount = Number((price * quantity).toFixed(2));

            const insertRes = await client.query(
                `INSERT INTO transactions (product_id, total_amount, payment_method, shipping_address, email)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
                [productId, amount, payment_method, shipping_address, email]
            );

            inserted.push({ id: insertRes.rows[0].id, product_id: productId, amount, created_at: insertRes.rows[0].created_at });

            // Update product sales count
            await client.query('UPDATE products SET sales_count = COALESCE(sales_count,0) + $1 WHERE id = $2', [quantity, productId]);
        }

        await client.query('COMMIT');
        res.json({ success: true, inserted, total_amount });
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        console.error('Error saving transaction:', err);
        res.status(500).json({ error: 'Failed to save transaction' });
    } finally {
        client.release();
    }
});

// listening for requests on the port specified
app.listen(port, host, () => {
    console.log(`Listening at ${host}:${port}`);
})