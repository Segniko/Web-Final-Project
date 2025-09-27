const express = require("express");
const router = express.Router();
const {
    getProductsController,
    addProductController,
    editProductController,
    deleteProductController
} = require("../controllers/productController");

// Get all products
router.get("/admin/dashboard/products", getProductsController);

// Add new product
router.post("/admin/dashboard/products", addProductController);

// Update product
router.put("/admin/dashboard/products/:id", editProductController);

// Delete product
router.delete("/admin/dashboard/products/:id", deleteProductController);

module.exports = router;
