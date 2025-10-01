// cart.js - shared cart utilities used by multiple pages
(function () {
    function getCart() {
        try {
            const raw = localStorage.getItem('cart');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to parse cart from localStorage', e);
            return [];
        }
    }

    function updateCartCounter() {
        const counterEls = document.querySelectorAll('.cart-counter, .position-absolute.badge');
        const cart = getCart();
        const count = cart.reduce((sum, it) => sum + (it.quantity || 1), 0);
        counterEls.forEach(el => {
            // Only update badges that look like the cart counter
            if (count > 0) {
                el.style.display = '';
                el.textContent = count;
            } else {
                el.style.display = 'none';
                el.textContent = '0';
            }
        });
    }

    // Expose to window for backward compatibility
    window.siteCart = {
        getCart,
        updateCartCounter
    };

    // Update on load
    document.addEventListener('DOMContentLoaded', updateCartCounter);

    // Listen for cross tab updates
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') updateCartCounter();
    });

    // Custom event used by our scripts
    window.addEventListener('cart:updated', updateCartCounter);
})();
