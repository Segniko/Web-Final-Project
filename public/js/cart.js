// cart.js - shared cart utilities used by multiple pages
    (function () {
    // Retrieves the cart array from localStorage, or returns an empty array if not found or parsing fails
    function getCart() {
        try {
            // Get the raw cart data from localStorage
            const raw = localStorage.getItem('cart');
            // Parse the JSON string, or return empty array if not present
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            // If parsing fails, log error and return empty array
            console.error('Failed to parse cart from localStorage', e);
            return [];
        }
    }

    // Updates all cart counter elements in the DOM to reflect the current cart quantity
    function updateCartCounter() {
        // Select all elements that display the cart count (by class)
        const counterEls = document.querySelectorAll('.cart-counter, .position-absolute.badge');
        // Get the current cart from localStorage
        const cart = getCart();
        // Calculate total quantity by summing item quantities (default 1 if missing)
        const count = cart.reduce((sum, it) => sum + (it.quantity || 1), 0);
        // Update each counter element
        counterEls.forEach(el => {
            // Only update badges that look like the cart counter
            if (count > 0) {
                // Show the counter and set its value
                el.style.display = '';
                el.textContent = count;
            } else {
                // Hide the counter if cart is empty
                el.style.display = 'none';
                el.textContent = '0';
            }
        });
    }

    // Expose cart utilities to global window object for use in other scripts
    window.siteCart = {
        getCart,
        updateCartCounter
    };

    // Update cart counter when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', updateCartCounter);

    // Listen for cross-tab updates: if cart changes in another tab, update counter here
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') updateCartCounter();
    });

    // Listen for custom 'cart:updated' event (dispatched by other scripts when cart changes)
    window.addEventListener('cart:updated', updateCartCounter);
})();
