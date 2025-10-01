# Project Description

Style Hub is a modern full-stack modern E-commerce website that allows the user to shop for products online and make purchases. It will have categories for men, women, and accessories(electronics). The overall Page structure and Tech Stack looks like this:

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
   * Footer

5. **Checkout Page**
   * Cart Items
   * Checkout
   * Payment
   * Delivery 
   * Footer


# Project Structure

```
Web-Final-Project
│
├── config/                    # Configuration files
│   └── db.js                 # Database configuration
│
├── database/                 
│   └── Schema.sql            # Database schema and migrations
│
├── node_modules/             # Node.js dependencies
│
├── public/                  
│   ├── css/                  
│   │   ├── admin.css         
│   │   └── styles.css        
│   │
│   ├── html/                 
│   │   ├── Admin/            # Admin panel pages
│   │   │   └── dashboard.html    
│   │   │   └── login.html        
│   │   ├── Category/         # Category pages
│   │   │   └── men.html          
│   │   │   └── women.html        
│   │   │   └── electronics.html  
│   │   ├── about.html        
│   │   ├── Checkout.html     
│   │   ├── customer-service.html  
│   │   ├── Details.html      
│   │   ├── faq.html          
│   │   ├── home.html         
│   │   ├── Landing.html         
│   │
│   ├── images/               # Image assets
│   │   └── ...
│   │
│   └── js/                   # Client-side JavaScript
│       ├── login_script.js   # Login functionality
│       └── logout_script.js  # Logout functionality
│
├── src/                      # Server-side source code
│   ├── controllers/          # Request handlers
│   │   ├── authController.js # Authentication logic
│   │   └── productController.js # Product logic
│   │
│   ├── middlewares/          # Express middlewares
│   │   └── authMiddleware.js # Authentication middleware
│   │
│   ├── models/               # Database models
│   │   ├── productModel.js     
│   │   └── userModel.js       # User model
│   │
│   ├── routes/               # Route definitions
│   │   ├── authRoutes.js     # Authentication routes
│   │   └── productRoutes.js # Product routes
│   |   └── transactionRoutes.js # Transaction routes
│   │
│   └── services/             # Business logic
│       ├── authService.js    # Authentication service
│       └── sessionStore.js   # Session management
│
├── .gitignore                # Git ignore file
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Dependency lock file
├── README.md                 # This file
└── server.js                 # Application entry point
```

# Images
**1. Home Page**
<img width="936" height="645" alt="image" src="/public/images/Screenshot 1.png>

**2.Details Page**
<img width="938" height="642" alt="image" src="/public/images/Screenshot 2.png" />

**3.Checkout Page**
<img width="940" height="646" alt="image" src="/public/images/Screenshot 3.png" />

**4. Category/Men**
<img width="946" height="647" alt="image" src="/public/images/Screenshot 4.png" />


# Preview of Pages
**1. Home Page**
<img width="1364" height="593" alt="image" src="/public/images/Screenshot 5.png" />

**2. Details Page**
<img width="1365" height="598" alt="image" src="/public/images/Screenshot 6.png" />

**3. Checkout Page**
<img width="1365" height="595" alt="image" src="/public/images/Screenshot 7.png" />

**4. Admin Dashboard**
<img width="1365" height="596" alt="image" src="/public/images/Screenshot 8.png" />

# Installation

1. Clone the repository
2. Install dependencies
  - npm install
3. Run the server
  - npm run dev or node server.js

# Usage

1. Start the server
2. Open your browser and navigate to http://localhost:3000
3. Use the application
