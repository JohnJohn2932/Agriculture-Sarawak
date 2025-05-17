// Marketplace Module using OOP Principles

// Abstract Base Class for Products (Abstraction)
class ProductBase {
    constructor(id, name, price, description, seller) {
        if (this.constructor === ProductBase) {
            throw new Error("Cannot instantiate abstract class");
        }
        this._id = id;
        this._name = name;
        this._price = price;
        this._description = description;
        this._seller = seller;
        this._rating = 0;
        this._reviews = [];
        this._stock = 0;
    }

    // Abstract methods
    validate() {
        throw new Error("Method 'validate()' must be implemented");
    }

    getCategory() {
        throw new Error("Method 'getCategory()' must be implemented");
    }

    // Common methods
    getId() {
        return this._id;
    }

    getName() {
        return this._name;
    }

    getPrice() {
        return this._price;
    }

    setPrice(newPrice) {
        if (newPrice < 0) {
            throw new Error("Price cannot be negative");
        }
        this._price = newPrice;
    }

    addReview(review) {
        this._reviews.push(review);
        this._updateRating();
    }

    _updateRating() {
        if (this._reviews.length === 0) return;
        this._rating = this._reviews.reduce((acc, review) => acc + review.rating, 0) / this._reviews.length;
    }
}

// Concrete Product Classes (Inheritance)
class Seed extends ProductBase {
    constructor(id, name, price, description, seller, variety, quantity) {
        super(id, name, price, description, seller);
        this._variety = variety;
        this._quantity = quantity;
    }

    validate() {
        return this._name && this._price > 0 && this._variety && this._quantity > 0;
    }

    getCategory() {
        return "seeds";
    }
}

class Fertilizer extends ProductBase {
    constructor(id, name, price, description, seller, type, weight) {
        super(id, name, price, description, seller);
        this._type = type;
        this._weight = weight;
    }

    validate() {
        return this._name && this._price > 0 && this._type && this._weight > 0;
    }

    getCategory() {
        return "fertilizers";
    }
}

class Tool extends ProductBase {
    constructor(id, name, price, description, seller, material, warranty) {
        super(id, name, price, description, seller);
        this._material = material;
        this._warranty = warranty;
    }

    validate() {
        return this._name && this._price > 0 && this._material;
    }

    getCategory() {
        return "tools";
    }
}

// Marketplace Class (Encapsulation)
class Marketplace {
    constructor() {
        this._products = new Map();
        this._categories = new Set();
        this._filters = {
            category: null,
            minPrice: null,
            maxPrice: null,
            rating: null
        };
    }

    // Product Management
    addProduct(product) {
        if (!(product instanceof ProductBase)) {
            throw new Error("Invalid product type");
        }
        if (!product.validate()) {
            throw new Error("Invalid product data");
        }
        this._products.set(product.getId(), product);
        this._categories.add(product.getCategory());
    }

    removeProduct(productId) {
        return this._products.delete(productId);
    }

    getProduct(productId) {
        return this._products.get(productId);
    }

    // Filtering and Searching
    setFilter(filterType, value) {
        if (filterType in this._filters) {
            this._filters[filterType] = value;
        }
    }

    searchProducts(query) {
        return Array.from(this._products.values()).filter(product => 
            product.getName().toLowerCase().includes(query.toLowerCase()) ||
            product.getCategory().toLowerCase().includes(query.toLowerCase())
        );
    }

    getFilteredProducts() {
        return Array.from(this._products.values()).filter(product => {
            if (this._filters.category && product.getCategory() !== this._filters.category) {
                return false;
            }
            if (this._filters.minPrice && product.getPrice() < this._filters.minPrice) {
                return false;
            }
            if (this._filters.maxPrice && product.getPrice() > this._filters.maxPrice) {
                return false;
            }
            if (this._filters.rating && product._rating < this._filters.rating) {
                return false;
            }
            return true;
        });
    }

    // Category Management
    getCategories() {
        return Array.from(this._categories);
    }
}

// Factory for creating products (Abstraction)
class ProductFactory {
    static createProduct(type, data) {
        switch (type.toLowerCase()) {
            case 'seed':
                return new Seed(
                    data.id,
                    data.name,
                    data.price,
                    data.description,
                    data.seller,
                    data.variety,
                    data.quantity
                );
            case 'fertilizer':
                return new Fertilizer(
                    data.id,
                    data.name,
                    data.price,
                    data.description,
                    data.seller,
                    data.type,
                    data.weight
                );
            case 'tool':
                return new Tool(
                    data.id,
                    data.name,
                    data.price,
                    data.description,
                    data.seller,
                    data.material,
                    data.warranty
                );
            default:
                throw new Error(`Unknown product type: ${type}`);
        }
    }
}

// Export the classes
export {
    ProductBase,
    Seed,
    Fertilizer,
    Tool,
    Marketplace,
    ProductFactory
}; 