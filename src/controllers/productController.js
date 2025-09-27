const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductById } = require("../models/productModel");

async function getProductsController(req, res) {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// ADD new product
async function addProductController(req, res) {
    try {
    const { name, category, rate, price, imageBase64, imageFilename, description } = req.body || {};

        // Basic validation
        if (!name || !category || !price) {
            return res.status(400).json({ message: 'Missing required fields: name, category, price' });
        }

        // Create the product with image_url null (we'll update after writing the file)
    const created = await createProduct({ name, category, rate, price, image_url: null, description });

        // If there's no image payload, return created product
        if (!imageBase64 || !imageFilename) {
            return res.status(201).json(created);
        }

        // Decode base64 and write file as public/images/<id>.<ext>
        const matches = imageBase64.match(/^data:(?:.+);base64,(.+)$/);
        const base64Data = matches ? matches[1] : imageBase64;
        const ext = path.extname(imageFilename) || '.jpg';
        const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
        await fsp.mkdir(imagesDir, { recursive: true });
        const destPath = path.join(imagesDir, `${created.id}${ext}`);
        await fsp.writeFile(destPath, Buffer.from(base64Data, 'base64'));

        // Update product to set image_url (preserve other fields)
        const updated = await updateProduct(created.id, {
            name: created.name,
            category: created.category,
            rate: created.rate,
            price: created.price,
            image_url: `/images/${created.id}${ext}`,
            description: created.description
        });

        return res.status(201).json(updated);
    } catch (err) {
        console.error('Error in addProductController:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// UPDATE product
async function editProductController(req, res) {
    try {
        const id = req.params.id;
    const { imageBase64, imageFilename, description } = req.body || {};

        const existing = await getProductById(id);
        if (!existing) return res.status(404).json({ message: 'Product not found' });

        // If new image provided, write/replace file and update image_url
        if (imageBase64 && imageFilename) {
            const matches = imageBase64.match(/^data:(?:.+);base64,(.+)$/);
            const base64Data = matches ? matches[1] : imageBase64;
            const ext = path.extname(imageFilename) || '.jpg';
            const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
            await fsp.mkdir(imagesDir, { recursive: true });

            // Remove existing file if it has a different extension
            if (existing.image_url) {
                const existingPath = path.join(__dirname, '..', '..', 'public', existing.image_url.replace(/^\//, ''));
                const existingExt = path.extname(existingPath) || '';
                if (existingExt && existingExt !== ext) {
                    await fsp.unlink(existingPath).catch(() => {});
                }
            }

            const destPath = path.join(imagesDir, `${id}${ext}`);
            await fsp.writeFile(destPath, Buffer.from(base64Data, 'base64'));

            // Build payload for update; remove imageBase64/imageFilename
            const payload = Object.assign({}, req.body, { image_url: `/images/${id}${ext}`, description });
            delete payload.imageBase64;
            delete payload.imageFilename;

            const updated = await updateProduct(id, payload);
            return res.json(updated);
        }

        // No image — regular update
        const payload = Object.assign({}, req.body);
        delete payload.imageBase64;
        delete payload.imageFilename;
        const updated = await updateProduct(id, payload);
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (err) {
        console.error('Error in editProductController:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// DELETE product
async function deleteProductController(req, res) {
    try {
        const deleted = await deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted", product: deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getProductsController,
    addProductController,
    editProductController,
    deleteProductController
};
