// Gets a URL query parameter by name (e.g., ?id=123)
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetches product details from the backend for a given productId
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        return await response.json();
    } catch (error) {
        // Log error and return null if fetch fails
        console.error('Error fetching product details:', error);
        return null;
    }
}

// Updates the product details page with product info, or shows a not found message
function updateProductDetails(product) {
    if (!product) {
        // If product is missing, show not found alert
        const container = document.getElementById('product-details-container') || document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning mt-4">
                    <h4>Product Not Found</h4>
                    <p>The requested product could not be found. Please check the URL or browse our <a href="/home">home page</a>.</p>
                    <button onclick="window.history.back()" class="btn btn-outline-secondary mt-2">Go Back</button>
                </div>`;
        }
        return;
    }

    // Update main product image
    const mainImage = document.querySelector('.product-image-main img');
    if (mainImage) {
        mainImage.src = product.image_url || 'https://via.placeholder.com/600x700';
        mainImage.alt = product.name;
    }

    // Update product title
    const titleElement = document.querySelector('.product-title');
    if (titleElement) {
        titleElement.textContent = product.name;
    }

    // Update price
    const priceElement = document.querySelector('.product-price');
    if (priceElement) {
        priceElement.textContent = `$${Number(product.price).toFixed(2)}`;
    }

    // Update rating stars and value
    const ratingElement = document.querySelector('.product-rating');
    if (ratingElement) {
        ratingElement.innerHTML = `
            ${'<i class="fas fa-star text-warning"></i>'.repeat(Math.floor(product.rate || 0))}
            ${(product.rate % 1) ? '<i class="fas fa-star-half-alt text-warning"></i>' : ''}
            ${'<i class="far fa-star text-warning"></i>'.repeat(5 - Math.ceil(product.rate || 0))}
            <span class="ms-2">(${product.rate || '0.0'})</span>`;
    }

    // Update breadcrumb navigation
    const breadcrumbElement = document.querySelector('.breadcrumb');
    if (breadcrumbElement) {
        breadcrumbElement.innerHTML = `
            <li class="breadcrumb-item"><a href="/home">Home</a></li>
            <li class="breadcrumb-item"><a href="/category/${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a></li>
            <li class="breadcrumb-item active" aria-current="page">${product.name}</li>`;
    }

    // Update main product description
    const mainDescription = document.querySelector('.product-description');
    if (mainDescription) {
        mainDescription.textContent = product.description || 'No description available.';
    }

    // Update detailed description in the tab
    const descriptionElement = document.querySelector('#productDescription');
    if (descriptionElement) {
        // Show product description and details in the tab
        descriptionElement.innerHTML = `
            <p>${product.description || 'No description available.'}</p>
            <ul class="list-unstyled">
                <li><strong>Category:</strong> ${product.category}</li>
                <li><strong>Rating:</strong> ${product.rate || 'Not rated'}</li>
                <li><strong>Price:</strong> $${Number(product.price).toFixed(2)}</li>
            </ul>`;
    }

    // Wire up action buttons for cart and checkout
    // There are two kinds of "add to cart" controls: navbar cart anchor and main page button
    const addButtons = document.querySelectorAll('.btn-add-to-cart');
    addButtons.forEach(el => {
        if (el.tagName.toLowerCase() === 'a') {
            // Navbar cart icon: go to checkout
            el.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/checkout';
            });
        } else {
            // Main Add to Cart button: add item to cart without redirect
            el.addEventListener('click', () => addToCart(product, {redirect:false}));
        }
    });

    // Proceed to checkout button: navigates to checkout page
    const proceedBtn = document.querySelector('.btn-proceed-to-checkout');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Ensure cart counter is up-to-date, then navigate
            try { updateCartCounter(); } catch (err) { /* ignore */ }
            window.location.href = '/checkout';
        });
    }
}

// Cart helper functions using localStorage (persistent across pages)
// Gets the cart array from localStorage, or returns an empty array if not found or invalid
function getCart() {
    try {
        const raw = localStorage.getItem('cart');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        return [];
    }
}

// Saves the cart array to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Updates the cart counter in the UI to reflect the total quantity of items in the cart
function updateCartCounter() {
    const counterEls = document.querySelectorAll('.cart-counter');
    const cart = getCart();
    const count = cart.reduce((sum, it) => sum + (it.quantity || 1), 0);
    counterEls.forEach(el => {
        if (count > 0) {
            el.style.display = '';
            el.textContent = count;
        } else {
            el.style.display = 'none';
            el.textContent = '0';
        }
    });
}

// Adds a product to the cart. If the product already exists, increments its quantity.
// If options.redirect is true, navigates to the checkout page after adding.
function addToCart(product, options = {redirect:false}) {
    const cart = getCart();
    const price = parseFloat(product.price) || 0;

    // Find existing item in cart
    const idx = cart.findIndex(it => String(it.id) === String(product.id));
    if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: price.toFixed(2),
            image: product.image_url,
            category: product.category,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCounter();

    if (options.redirect) {
        // Go to checkout route handled by server
        window.location.href = '/checkout';
    }
}

// Initializes the product details page: fetches product info and updates UI
async function initProductDetails() {
    const productId = getUrlParameter('id');
    
    if (!productId) {
        // If no product id, show a message instead of redirecting
        const container = document.querySelector('.container') || document.body;
        container.innerHTML = `
            <div class="alert alert-warning mt-4">
                <h4>No Product Selected</h4>
                <p>Please select a product to view its details.</p>
                <a href="/" class="btn btn-primary mt-2">Browse Products</a>
            </div>`;
        return;
    }

    // Fetch product details and update the page
    const product = await fetchProductDetails(productId);
    updateProductDetails(product);
}

// Prevent default form submission for all forms on the page
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => e.preventDefault());
});

// Initialize product details page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductDetails);
} else {
    initProductDetails();
}

// Handle category link click: navigates to category page
const categoryLink = document.getElementById('categoryLink');
if (categoryLink) {
    categoryLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Get the category from the URL or use a default
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'Men';
        window.location.href = `/category/${category}`;
    });
}

// Update cart counter on pages where this script is loaded
try { updateCartCounter(); } catch (e) { /* ignore */ }

// Clear cart button handler (button added to Details.html)
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.querySelector('.btn-clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            try {
                // Remove cart from localStorage and sessionStorage
                localStorage.removeItem('cart');
                sessionStorage.removeItem('cartItem');
                updateCartCounter();
                // Notify other tabs/scripts
                try { window.dispatchEvent(new Event('cart:updated')); } catch(e){}
                // Show visual feedback for clear action
                const originalText = clearBtn.innerHTML;
                clearBtn.innerHTML = '<i class="fas fa-check me-2"></i>Cleared';
                clearBtn.classList.remove('btn-outline-danger');
                clearBtn.classList.add('btn-success');
                setTimeout(() => {
                    clearBtn.innerHTML = originalText;
                    clearBtn.classList.remove('btn-success');
                    clearBtn.classList.add('btn-outline-danger');
                }, 1200);
            } catch (err) {
                // Show error if clear fails
                console.error('Failed to clear cart', err);
                alert('Could not clear cart. See console for details.');
            }
        });
    }
});

