// Waits for the DOM to be loaded before running admin dashboard logic
document.addEventListener("DOMContentLoaded", async () => {
    // Get references to table body and add product button
    const tbody = document.getElementById("productsTableBody");
    const addProductBtn = document.getElementById("addProductBtn");

    // Loads products from the backend and populates the admin table
    try {
        const response = await fetch("/admin/dashboard/products");
        const products = await response.json();

        products.forEach(product => {
            // Create a table row for each product
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image_url}" alt="${product.name}" width="50"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.rate}</td>
                <td>$${product.price}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Edit</button>
                    <button class="btn btn-sm btn-danger">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        // Show error if products fail to load
        console.error("Error loading products:", err);
        tbody.innerHTML = `<tr><td colspan="7">Failed to load products</td></tr>`;
    }

    // Creates and displays the modal for adding a new product
    function createModal() {
        // Prevent multiple modals
        if (document.getElementById("productModal")) return null;

        const modal = document.createElement("div");
        modal.id = "productModal";
        modal.className = "modal";

        // Modal HTML structure for product form
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close">&times;</button>
                <h3>Add New Product</h3>
                <form id="productForm">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="productName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="productCategory" class="form-control" required>
                            <option value="">Select a category</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="neutral">Neutral</option>
                            <option value="electronics">Electronics</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rate (1-5)</label>
                        <input type="number" id="productRate" class="form-control" min="1" max="5" step="0.5" value="1" required>
                    </div>
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" id="productPrice" class="form-control" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Product Image</label>
                        <input type="file" id="productImage" class="form-control" accept="image/*">
                    </div>
                    <div style="margin-top:10px;">
                        <button type="submit" class="btn btn-primary">Save Product</button>
                        <button type="button" class="btn btn-outline" id="cancelBtn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Handles the add product button click: opens modal and wires up modal events
    addProductBtn.addEventListener("click", () => {
        const modal = createModal();
        if (!modal) return;
        modal.style.display = "flex";

        // Function to close and remove the modal
        const closeModal = () => modal.remove();

        // Close modal on X or Cancel button
        modal.querySelector(".close").addEventListener("click", closeModal);
        modal.querySelector("#cancelBtn").addEventListener("click", closeModal);

        // Handle product form submission
        modal.querySelector("#productForm").addEventListener("submit", (e) => {
            e.preventDefault();

            // Gather product data from form fields
            const productData = {
                name: document.getElementById("productName").value,
                category: document.getElementById("productCategory").value,
                rate: document.getElementById("productRate").value,
                price: document.getElementById("productPrice").value,
                image_url: "" // file upload to handle later
            };

            // For now, just log product data and close modal
            console.log("Product to submit:", productData);
            closeModal();
        });
    });
});
