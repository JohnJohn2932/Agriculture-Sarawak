import { Marketplace, ProductFactory } from './marketplace.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Marketplace and Add a Single Product
    const marketplace = new Marketplace();

    // Single test product
    const productData = {
        type: 'seed',
        id: '1',
        name: 'Test Corn Seeds (1kg)',
        price: 12.50,
        description: 'High-germination corn seeds for testing.',
        seller: 'Test Farmer',
        variety: 'Sweet Corn',
        quantity: 1,
        image: 'corn-seeds.jpg' // Make sure this image exists or use a placeholder
    };

    const product = ProductFactory.createProduct(productData.type, productData);
    product.image = productData.image;
    marketplace.addProduct(product);

    // 2. DOM Elements
    const searchInput = document.querySelector('.search-box input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productsGrid = document.querySelector('.products-grid');

    // 3. Render Products
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        if (products.length === 0) {
            productsGrid.innerHTML = '<div style="padding:2rem;">No products found.</div>';
            return;
        }
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.getCategory());
            card.innerHTML = `
                <div class="product-image">
                    <img src="assets/products/${product.image || 'default.jpg'}" alt="${product.getName()}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.getName()}</h3>
                    <div class="product-price">
                        <span class="current-price">RM ${product.getPrice().toFixed(2)}</span>
                    </div>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span class="rating-count">(0)</span>
                    </div>
                    <div class="product-location">${product.seller || product._seller}</div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // 4. Search Feature
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        const results = query ? marketplace.searchProducts(query) : Array.from(marketplace._products.values());
        renderProducts(results);
    });

    // 5. Filter Feature
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.textContent.trim().toLowerCase();
            if (category === 'all') {
                marketplace.setFilter('category', null);
            } else {
                marketplace.setFilter('category', category);
            }
            const filtered = marketplace.getFilteredProducts();
            renderProducts(filtered);
        });
    });

    // 6. Initial Render
    renderProducts(Array.from(marketplace._products.values()));
}); 