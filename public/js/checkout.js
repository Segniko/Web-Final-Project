// Checkout.js
// Renders cart items in the checkout page and computes subtotal, tax and total.
function getCart() {
    try {
        const raw = localStorage.getItem('cart');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatMoney(v) {
    return `$${Number(v).toFixed(2)}`;
}

function renderCheckout() {
    const cart = getCart();
    const itemsContainer = document.querySelector('.checkout-items');

    // Basic calculation
    const subtotal = cart.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
    const shipping = cart.length > 0 ? 5.00 : 0.00;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    // Update order summary elements if present
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = formatMoney(shipping);
    if (taxEl) taxEl.textContent = formatMoney(tax);
    if (totalEl) totalEl.textContent = formatMoney(total);

    // If there's a container for items, render them
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
            return;
        }

        itemsContainer.innerHTML = '';
        cart.forEach(it => {
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

// Wire form submit to include cart total instead of relying on URL params
document.addEventListener('DOMContentLoaded', () => {
    renderCheckout();

    // Payment method dynamic fields
    function updatePaymentFields() {
        const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        document.getElementById('creditCardFields').style.display = method === 'credit_card' ? 'block' : 'none';
        document.getElementById('paypalFields').style.display = method === 'paypal' ? 'block' : 'none';
    }
    document.querySelectorAll('input[name="paymentMethod"]').forEach(el => {
        el.addEventListener('change', updatePaymentFields);
    });
    updatePaymentFields();

    // Attach to checkout form submit (if exists)
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            const subtotal = cart.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
            const shipping = subtotal > 0 ? 5.00 : 0.00;
            const tax = subtotal * 0.10;
            const total = subtotal + shipping + tax;

            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit_card';

            // Validate payment fields
            if (paymentMethod === 'credit_card') {
                const cardNumber = document.getElementById('cardNumber').value.trim();
                const cardExpiry = document.getElementById('cardExpiry').value.trim();
                const cardCVV = document.getElementById('cardCVV').value.trim();
                if (!cardNumber || !cardExpiry || !cardCVV) {
                    alert('Please fill in all credit card details.');
                    return;
                }
            }
            if (paymentMethod === 'paypal') {
                const paypalEmail = document.getElementById('paypalEmail').value.trim();
                if (!paypalEmail) {
                    alert('Please enter your PayPal email.');
                    return;
                }
            }

            const formData = {
                items: cart,
                total_amount: total,
                payment_method: paymentMethod,
                shipping_address: `${document.getElementById('address')?.value || ''}, ${document.getElementById('city')?.value || ''}, ${document.getElementById('zipCode')?.value || ''}`,
                email: document.getElementById('email')?.value || ''
            };

            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Transaction failed');

                // Success - clear cart and show message
                saveCart([]);
                // update cart counter in other scripts
                try { window.dispatchEvent(new Event('cart:updated')); } catch(e){}

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

                setTimeout(() => window.location.href = '/home', 2000);

            } catch (err) {
                console.error(err);
                alert('There was a problem processing your order.');
            }
        });
    }
});