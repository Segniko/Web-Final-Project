const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Updated path to db.js

// Create a new transaction
router.post('/', async (req, res) => {
    console.log('Received transaction request:', req.body);
    const { product_id, total_amount, payment_method, shipping_address } = req.body;
    
    // Validate required fields
    if (!product_id || !total_amount || !payment_method || !shipping_address) {
        console.error('Missing required fields:', { product_id, total_amount, payment_method, shipping_address });
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    try {
        const result = await db.query(
            'INSERT INTO transactions (product_id, total_amount, payment_method, shipping_address) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, total_amount, payment_method, shipping_address]
        );
        
        res.status(201).json({
            success: true,
            transaction: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating transaction:', {
            error: error.message,
            stack: error.stack,
            query: 'INSERT INTO transactions (product_id, total_amount, payment_method, shipping_address) VALUES ($1, $2, $3, $4)',
            params: [product_id, total_amount, payment_method, shipping_address]
        });
        res.status(500).json({
            success: false,
            message: 'Failed to process transaction',
            error: error.message // Send error details to client for debugging
        });
    }
});

module.exports = router;