// Import required modules
const express = require('express'); // Express web framework
const app = express(); // Create Express app instance
const path = require('path'); // Node.js path utilities
const pool = require('./config/db'); // PostgreSQL connection pool

const port = process.env.PORT || 3000; // Port to listen on
const host = "0.0.0.0"; // Host address

// Middleware: Increase body parser limits to allow large JSON payloads (e.g., base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware: Serve static files (CSS, JS, images) from /public
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: "1d", // default cache for 1 day
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
            // Don't cache HTML so changes show immediately
            res.setHeader("Cache-Control", "no-cache");
        } else {
            // Cache other files (CSS, JS, images)
            res.setHeader("Cache-Control", "public, max-age=86400");
        }
    },
    index: false,
    redirect: false
}));

// Route: Serve any .html file from /public/html (case-insensitive)
app.get(/.*\.html$/i, (req, res, next) => {
    const fs = require('fs');
    const htmlRoot = path.join(__dirname, 'public', 'html');

    // Normalize and sanitize the requested path
    const relative = req.path.replace(/^\//, '').toLowerCase();
    const normalized = path.normalize(relative);
    const targetPath = path.join(htmlRoot, normalized);

    // Ensure the resolved path is inside /public/html
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(path.resolve(htmlRoot))) {
        return res.status(400).send('Invalid path');
    }

    // Serve the file if it exists, otherwise call next middleware
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

// Import authentication routes and middleware
const authroutes = require('./src/routes/authRoutes.js');
const {requireAuth} = require("./src/middlewares/authMiddleware");
app.use('/auth', authroutes); // Mount /auth routes

// Import and mount product routes
const productRoutes = require("./src/routes/productRoutes.js");
app.use(productRoutes);

// API: Get all products, optionally filtered by category
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        console.log('API Request - Category:', category);
        
        let query = 'SELECT * FROM products';
        const queryParams = [];
        
        if (category) {
            // Filter by category (case-insensitive)
            query += ' WHERE LOWER(category) = LOWER($1)';
            queryParams.push(category);
            console.log('Query with category filter:', query, queryParams);
        } else {
            console.log('Query without category filter');
        }
        
        query += ' ORDER BY created_at DESC';
        console.log('Final query:', query, queryParams);
        
        // Query database and return products
        const result = await pool.query(query, queryParams);
        console.log('Found products:', result.rows.length);
        
        res.json(result.rows);
    } catch (err) {
        // Error handling
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// API: Get newest products (for "New Arrivals" section)
app.get('/api/products/new-arrivals', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const newArrivals = await pool.query(
            'SELECT * FROM products ORDER BY created_at DESC LIMIT $1', 
            [limit]
        );
        res.json(newArrivals.rows);
    } catch (err) {
        // Error handling
        console.error('Error fetching new arrivals:', err);
        res.status(500).json({ error: 'Error fetching new arrivals' });
    }
});

// API: Get best-selling products (for "Featured" section)
app.get('/api/products/best-sellers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const bestSellers = await pool.query(
            'SELECT * FROM products ORDER BY sales_count DESC, created_at DESC LIMIT $1', 
            [limit]
        );
        res.json(bestSellers.rows);
    } catch (err) {
        // Error handling
        console.error('Error fetching best sellers:', err);
        res.status(500).json({ error: 'Error fetching best sellers' });
    }
});


// API: Get product details by product ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Query product details from database
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
        
        // Format and send product response
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
        // Error handling
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

// Page routes: Serve HTML files for each main page
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

// Category page routes
app.get('/category/Men', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Men.html'));
});

app.get('/category/Women', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Women.html'));
});

app.get('/category/Electronics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Category', 'Electronics.html'));
});

// Admin login and dashboard routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin' ,'login.html'));
});

app.get('/admin/dashboard', requireAuth , (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' , 'admin', 'dashboard.html'));
});

// Route: Clears client-side cart and redirects to checkout
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

// API: Record a transaction when a user completes checkout
app.post('/api/transactions', async (req, res) => {
    const client = await pool.connect();
    try {
        // Destructure transaction details from request body
        const { items, total_amount, payment_method, shipping_address, email } = req.body || {};

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        if (!payment_method || !shipping_address || !email) {
            return res.status(400).json({ error: 'Missing payment method, shipping address, or email' });
        }

        await client.query('BEGIN'); // Start transaction
        const inserted = [];

        // Insert transaction record (one per checkout)
        const productId = Number(items[0]?.id || items[0]?.product_id);
        // Calculate total amount (subtotal + shipping + tax)
        const amount = Number((items.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0) + 5 + (items.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0) * 0.10)).toFixed(2));
        const insertRes = await client.query(
            `INSERT INTO transactions (product_id, total_amount, payment_method, shipping_address, email, item_list)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
            [productId, amount, payment_method, shipping_address, email, JSON.stringify(items)]
        );

        // Update sales_count for each product in the cart
        for (const it of items) {
            const quantity = Number(it.quantity) || 1;
            const prodId = Number(it.id || it.product_id);
            if (prodId) {
                await client.query('UPDATE products SET sales_count = COALESCE(sales_count,0) + $1 WHERE id = $2', [quantity, prodId]);
            }
        }

        await client.query('COMMIT'); // Commit transaction
        res.json({ success: true, inserted, total_amount });
    } catch (err) {
        // Rollback on error
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        console.error('Error saving transaction:', err);
        res.status(500).json({ error: 'Failed to save transaction' });
    } finally {
        client.release(); // Release DB connection
    }
});

// Start the server and listen for requests
app.listen(port, host, () => {
    console.log(`Listening at ${host}:${port}`);
})