// Creates a Bootstrap product card HTML for a given product object.
// Includes product image, name, price, rating, and an add-to-cart button.
function createProductCard(product, showCategory = true) {
    return `
        <div class="col-md-3 col-6 mb-4">
            <a href="/details?id=${product.id}" class="text-decoration-none text-dark">
            <div class="product-card h-100">
                <div class="position-relative">
                    <img src="${product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                        class="card-img-top" 
                        alt="${product.name}">
                </div>
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="text-warning">
                            ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rate || 0))}
                            ${(product.rate % 1) ? '<i class="fas fa-star-half-alt"></i>' : ''}
                            ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rate || 0))}
                            <small class="text-muted">(${product.rate || '0.0'})</small>
                        </div>
                    </div>
                    <h5 class="product-title mb-1">${product.name}</h5>
                    <p class="product-price mb-0">$${Number(product.price).toFixed(2)}</p>
                        <div class="product-actions mt-3">
                        <button type="button" class="btn btn-sm btn-primary btn-add-to-cart"
                            data-product="${encodeURIComponent(JSON.stringify(product))}">
                            <i class="fas fa-shopping-cart"></i> Add
                        </button>
                    </div>
                </div>
            </div>
            </a>
        </div>
    `;
}

// Retrieves the cart array from localStorage, or from a global siteCart object if available.
function getCart() {
    try {
        if (window.siteCart && typeof window.siteCart.getCart === 'function') {
            return window.siteCart.getCart();
        }
        const raw = localStorage.getItem('cart');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to read cart from storage', e);
        return [];
    }
}

// Saves the cart array to localStorage and notifies other listeners in the same tab.
function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        // Notify other listeners in same tab
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    } catch (e) {
        console.error('Failed to save cart to storage', e);
    }
}

// Updates the cart counter in the UI to reflect the total quantity of items in the cart.
function updateCartCounter() {
    try {
        if (window.siteCart && typeof window.siteCart.updateCartCounter === 'function') {
            window.siteCart.updateCartCounter();
            return;
        }

        const cart = getCart();
        const total = cart.reduce((acc, it) => acc + (Number(it.quantity || 1)), 0);
        document.querySelectorAll('.cart-counter').forEach(el => {
            el.textContent = total;
            el.style.display = total > 0 ? 'inline-block' : 'none';
        });
    } catch (e) {
        console.error('Failed to update cart counter', e);
    }
}

// Adds a product to the cart. If the product already exists, increments its quantity.
function addToCart(product) {
    if (!product || !product.id) return;
    const cart = getCart();
    const idx = cart.findIndex(it => String(it.id) === String(product.id));
    if (idx > -1) {
        cart[idx].quantity = (Number(cart[idx].quantity) || 1) + 1;
    } else {
        const item = {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image_url || null,
            category: product.category || null,
            quantity: 1
        };
        cart.push(item);
    }
    saveCart(cart);
    updateCartCounter();
}

// Attaches click handlers to all add-to-cart buttons in a given container.
// Prevents navigation when clicking the button and gives visual feedback.
function attachAddToCartHandlers(container) {
    if (!container) return;
    const buttons = container.querySelectorAll('.btn-add-to-cart');
    console.debug('attachAddToCartHandlers: found', buttons.length, 'buttons in', container.id || container);
    buttons.forEach(btn => {
        // Avoid attaching multiple listeners
        if (btn._hasAddToCart) return;
        btn._hasAddToCart = true;
        // Uses capture phase and stop propagation so the surrounding <a> won't navigate
        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const raw = btn.getAttribute('data-product');
                if (!raw) return;
                const product = JSON.parse(decodeURIComponent(raw));
                addToCart(product);
                // small visual feedback
                btn.classList.add('btn-success');
                setTimeout(() => btn.classList.remove('btn-success'), 650);
            } catch (err) {
                console.error('Failed to parse product data for add-to-cart', err);
            }
        };
        btn.addEventListener('click', handleClick, true);
        // Also blocks mousedown from bubbling to avoid some browsers activating the parent link
        btn.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
    });
}

// Renders a list of products into a given container by ID.
// Shows a message if no products are found. Attaches add-to-cart handlers to buttons.
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container with ID '${containerId}' not found`);
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    No products found.
                </div>
            </div>`;
        return;
    }
    
    // Allow caller to pass container specific preference via container's data attribute
    const showCategoryAttr = container.getAttribute('data-show-category');
    const showCategory = showCategoryAttr === null ? true : showCategoryAttr === 'true';
    container.innerHTML = products.map(product => createProductCard(product, showCategory)).join('');
    // Attach add-to-cart handlers to new buttons
    try { attachAddToCartHandlers(container); } catch (e) { console.error('attachAddToCartHandlers failed', e); }
}

// Gets the product category from the current URL path.
// Maps URL segments to display names (e.g., 'men' -> 'Men').
function getCategoryFromUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    let category = pathParts[pathParts.length - 1];
    
    // Remove .html extension if present
    if (category.endsWith('.html')) {
        category = category.slice(0, -5);
    }
    
    // Map common category URLs to their display names
    const categoryMap = {
        'men': 'Men',
        'women': 'Women',
        'electronics': 'Electronics'
    };
    
    return categoryMap[category.toLowerCase()] || null;
}

// Filters a list of products by category name (case-insensitive).
function filterProductsByCategory(products, category) {
    if (!category) return products;
    return products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
    );
}

// Loads products from the backend and displays them in the appropriate sections.
// Handles both category pages and the home page, including error handling and loading states.
async function loadProducts() {
    try {
        const currentCategory = getCategoryFromUrl();
        const isCategoryPage = !!currentCategory;
        
        // Show loading spinner while fetching products
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading products...</p>
                </div>`;
        }

        // Fetch products and (if home page) new arrivals and best sellers
        const [productsRes, newArrivalsRes, bestSellersRes] = await Promise.all([
            fetch('/api/products'),
            isCategoryPage ? Promise.resolve(null) : fetch('/api/products/new-arrivals'),
            isCategoryPage ? Promise.resolve(null) : fetch('/api/products/best-sellers')
        ]);

        // Check for fetch errors
        if (!productsRes.ok || (!isCategoryPage && (!newArrivalsRes || !bestSellersRes || !newArrivalsRes.ok || !bestSellersRes.ok))) {
            throw new Error('Failed to fetch product data');
        }
        
        // Parse JSON responses
        const [products, newArrivals, bestSellers] = await Promise.all([
            productsRes.json(),
            isCategoryPage ? null : newArrivalsRes.json(),
            isCategoryPage ? null : bestSellersRes.json()
        ]);
        
        if (isCategoryPage) {
            // On category page, filter products by the current category
            const filteredProducts = filterProductsByCategory(products, currentCategory);
            renderProducts(filteredProducts, 'products-container');
            
            // Update the page title to show the category
            const pageTitle = document.querySelector('h1');
            if (pageTitle) {
                pageTitle.textContent = `${currentCategory} Products`;
            }
        } else {
            // On home page, show all sections
            // For home sections we don't need the category badge on each product card
            const allProductsContainer = document.getElementById('all-products-container');
            if (allProductsContainer) allProductsContainer.setAttribute('data-show-category', 'false');
            const newArrivalsContainer = document.getElementById('new-arrivals-container');
            if (newArrivalsContainer) newArrivalsContainer.setAttribute('data-show-category', 'false');
            const featuredContainer = document.getElementById('featured-products-container');
            if (featuredContainer) featuredContainer.setAttribute('data-show-category', 'false');

            // Render products in each section
            renderProducts(products, 'all-products-container');
            renderProducts(newArrivals, 'new-arrivals-container');
            renderProducts(bestSellers, 'featured-products-container');
            // Ensure add-to-cart handlers are attached to each section
            ['all-products-container','new-arrivals-container','featured-products-container'].forEach(id => {
                const c = document.getElementById(id);
                if (c) try { attachAddToCartHandlers(c); } catch (e) { console.error('attachAddToCartHandlers failed for', id, e); }
            });
        }
        
    } catch (error) {
        // Handle errors and show error message in UI
        console.error('Error loading products:', error);
        const containerId = getCategoryFromUrl() ? 'products-container' : 'all-products-container';
        const container = document.getElementById(containerId);
        
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5 class="alert-heading">Error Loading Products</h5>
                        <p class="mb-2">${error.message.includes('Failed to fetch') ? 
                            'Unable to connect to the server. Please check your internet connection.' : 
                            'Failed to load products. Please try again later.'}</p>
                        <hr>
                        <button onclick="window.location.reload()" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-sync-alt me-1"></i> Try Again
                        </button>
                    </div>
                </div>`;
        }
    }
}

// Performs a product search by name or category and displays results.
// If query is empty, reloads the default products view.
function performSearch(query) {
    query = (query || '').trim().toLowerCase();
    // If query is empty, reload default products view
    if (!query) {
        // loadProducts will re-render all sections appropriately
        loadProducts();
        return;
    }

    fetch('/api/products')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch products for search');
            return res.json();
        })
        .then(products => {
            const filtered = (products || []).filter(p => {
                const name = (p.name || '').toString().toLowerCase();
                const cat = (p.category || '').toString().toLowerCase();
                return name.includes(query) || cat.includes(query);
            });
            // Render filtered results into the main all-products container
            renderProducts(filtered, 'all-products-container');
        })
        .catch(err => {
            console.error('Search error:', err);
        });
}

// Attaches event listeners to the search bar input and button.
// On click or Enter key, performs a product search.
function attachSearchHandler() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;
    const input = searchBar.querySelector('input[type="text"]');
    const btn = searchBar.querySelector('button');
    if (!input || !btn) return;

    const run = (e) => {
        if (e) e.preventDefault();
        const q = input.value || '';
        performSearch(q);
    };

    btn.addEventListener('click', run);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') run(e);
    });
}

// Initializes the product page: attaches search handler and loads products when DOM is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        attachSearchHandler();
        loadProducts();
    });
} else {
    // DOMContentLoaded has already fired
    attachSearchHandler();
    loadProducts();
}