// checkout.js
// This script manages the checkout page: it loads cart items from localStorage, displays them,
// calculates subtotal, shipping, tax, and total, and handles the checkout form submission.
// Retrieves the cart array from localStorage, or returns an empty array if not found or invalid.
function getCart() {
    try {
        const raw = localStorage.getItem('cart'); // Get cart JSON string from localStorage
        return raw ? JSON.parse(raw) : []; // Parse JSON or return empty array
    } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        return [];
    }
}

// Saves the cart array to localStorage as a JSON string.
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Formats a number as currency (e.g., 12.5 -> "$12.50").
function formatMoney(v) {
    return `$${Number(v).toFixed(2)}`;
}

// Renders the checkout page: displays cart items, calculates and updates subtotal, shipping, tax, and total.
function renderCheckout() {
    const cart = getCart(); // Get cart items
    const itemsContainer = document.querySelector('.checkout-items'); // Container for cart items

    // Calculate subtotal (sum of price * quantity for each item)
    const subtotal = cart.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
    // Flat shipping fee if cart is not empty
    const shipping = cart.length > 0 ? 5.00 : 0.00;
    // Tax is 10% of subtotal
    const tax = subtotal * 0.10;
    // Total is subtotal + shipping + tax
    const total = subtotal + shipping + tax;

    // Update order summary elements (if present in DOM)
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = formatMoney(shipping);
    if (taxEl) taxEl.textContent = formatMoney(tax);
    if (totalEl) totalEl.textContent = formatMoney(total);

    // Render cart items in the checkout page
    if (itemsContainer) {
        if (cart.length === 0) {
            // Show message if cart is empty
            itemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
            return;
        }

        itemsContainer.innerHTML = '';
        cart.forEach(it => {
            // Create a row for each cart item
            const row = document.createElement('div');
            row.className = 'cart-item d-flex align-items-center gap-3 mb-3';
            row.innerHTML = `
                <img src="${it.image || 'https://via.placeholder.com/100'}" class="product-image" alt="${it.name}">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <div>
                            <div class="fw-bold">${it.name}</div>
                            <div class="text-muted small">${it.category || ''}</div>
                            <div class="text-muted small">Quantity: ${it.quantity || 1}</div>
                        </div>
                        <div class="fw-bold">${formatMoney(parseFloat(it.price) * (it.quantity || 1))}</div>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(row);
        });
    }
}

// Wait for DOM to load before running checkout logic
document.addEventListener('DOMContentLoaded', () => {
    // Render cart items and totals on page load
    renderCheckout();

    // Handles showing/hiding payment fields based on selected payment method
    function updatePaymentFields() {
        const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        // Show credit card fields if selected
        document.getElementById('creditCardFields').style.display = method === 'credit_card' ? 'block' : 'none';
        // Show PayPal fields if selected
        document.getElementById('paypalFields').style.display = method === 'paypal' ? 'block' : 'none';
    }
    // Add change event listeners to payment method radio buttons
    document.querySelectorAll('input[name="paymentMethod"]').forEach(el => {
        el.addEventListener('change', updatePaymentFields);
    });
    // Initialize payment fields visibility
    updatePaymentFields();

    // Attach submit handler to checkout form (if present)
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission
            const cart = getCart(); // Get cart items
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            // Recalculate totals for submission
            const subtotal = cart.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
            const shipping = subtotal > 0 ? 5.00 : 0.00;
            const tax = subtotal * 0.10;
            const total = subtotal + shipping + tax;

            // Get selected payment method
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit_card';

            // Validate payment fields
            if (paymentMethod === 'credit_card') {
                // Get credit card details
                const cardNumber = document.getElementById('cardNumber').value.trim();
                const cardExpiry = document.getElementById('cardExpiry').value.trim();
                const cardCVV = document.getElementById('cardCVV').value.trim();
                // Check if all fields are filled
                if (!cardNumber || !cardExpiry || !cardCVV) {
                    alert('Please fill in all credit card details.');
                    return;
                }
            }
            if (paymentMethod === 'paypal') {
                // Get PayPal email
                const paypalEmail = document.getElementById('paypalEmail').value.trim();
                if (!paypalEmail) {
                    alert('Please enter your PayPal email.');
                    return;
                }
            }

            // Collect form data for transaction
            const formData = {
                items: cart,
                total_amount: total,
                payment_method: paymentMethod,
                shipping_address: `${document.getElementById('address')?.value || ''}, ${document.getElementById('city')?.value || ''}, ${document.getElementById('zipCode')?.value || ''}`,
                email: document.getElementById('email')?.value || ''
            };

            try {
                // Send transaction data to backend
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Transaction failed');

                // On success: clear cart and show confirmation message
                saveCart([]);
                // Notify other scripts that cart was updated
                try { window.dispatchEvent(new Event('cart:updated')); } catch(e){}

                // Replace checkout page content with success message
                const checkoutContent = document.querySelector('.checkout-container');
                if (checkoutContent) {
                    checkoutContent.innerHTML = `
                        <div class="text-center py-5">
                            <div class="mb-4">
                                <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                            </div>
                            <h2 class="mb-3">Transaction Complete!</h2>
                            <p>Your order has been placed successfully.</p>
                            <p>Redirecting to home page...</p>
                        </div>
                    `;
                }

                // Redirect to home page after 2 seconds
                setTimeout(() => window.location.href = '/home', 2000);

            } catch (err) {
                // Show error if transaction fails
                console.error(err);
                alert('There was a problem processing your order.');
            }
        });
    }
});