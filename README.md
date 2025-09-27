# Project Description

Style Hub is a modern full-stack modern E-commerce website that allows the user to shop for products online and make purchases. It will have categories for men, women, and electronics. The overall Page structure looks like this:

# Tech Stack
- HTML, CSS, Javascript, Node/Express.js, PostgreSQL, Bootstrap

# Site Map (Page Structure)

1. **Landing Page / Home**
   * Navbar 
   * Hero section (featured products / categories)
   * Highlights (bestsellers, trending, new arrivals)
   * Call-to-actions (Shop Now, Signup)
   * Newsletter subscription
   * Footer

2. **Admin Dashboard**
   * Dashboard
   * login

3. **Home**
   * Navbar -> Logo, Search bar, Language option, Cart, Profile
   * Hero Section
   * Contents with options (Featured Products, New Arrivals, Best Sellers)
   * Footer

4. **Details Page**
   * Product Details
   * Add to Cart
   * Buy Now
   * Other related product items
   * Footer

5. **Checkout Page**
   * Cart Items
   * Checkout
   * Payment
   * Delivery 
   * Footer


# Project Structure
`
Web-Final-Project
│
├── config/
│   └── db.js
│
├── public/
│   ├── css/
│   │   ├── admin.css
│   │   └── styles.css
│   │
│   ├── html/
│   │   ├── Admin/
│   │   ├── Category/
│   │   ├── about.html
│   │   ├── Checkout.html
│   │   ├── customer-service.html
│   │   ├── Details.html
│   │   ├── faq.html
│   │   ├── home.html
│   │   ├── Landing.html
│   │   ├── privacy.html
│   │   └── terms.html
│   │
│   └── js/
│       ├── login_script.js
│       └── logout_script.js
│
├── src/
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   └── userModel.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   └── services/
│       ├── authService.js
│       └── sessionStore.js
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
`