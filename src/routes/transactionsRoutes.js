const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Updated path to db.js

// Create a new transaction
router.post('/', async (req, res) => {
    console.log('Received transaction request:', req.body);
    const { total_amount, payment_method, shipping_address, email, items } = req.body;

    // Debug: log received items and JSON
    console.log('Received items from checkout:', items);
    console.log('JSON sent to DB:', JSON.stringify(items));

    // Validate required fields
    if (!total_amount || !payment_method || !shipping_address || !items || !Array.isArray(items) || items.length === 0) {
        console.error('Missing required fields:', { total_amount, payment_method, shipping_address, items });
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Use first item's id for legacy product_id, or null if not present
    const product_id = items[0]?.id || null;

    try {
        // Transaction insert logic removed. Implement in service/controller as needed.
        res.status(501).json({
            success: false,
            message: 'Transaction insert not implemented in route.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to process transaction',
            error: error.message
        });
    }
});

module.exports = router;