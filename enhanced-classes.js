// Abstract Base Class (Abstraction)
class Entity {
    constructor(id) {
        if (this.constructor === Entity) {
            throw new Error("Cannot instantiate abstract class");
        }
        this._id = id;
    }

    getId() {
        return this._id;
    }

    // Abstract method
    validate() {
        throw new Error("Method 'validate()' must be implemented");
    }
}

// Enhanced User Class (Inheritance from Entity)
class User extends Entity {
    constructor(id, name, email, password) {
        super(id);
        this._name = name;
        this._email = email;
        this._password = password;
        this._createdAt = new Date();
    }

    // Enhanced Encapsulation with validation
    setEmail(newEmail) {
        if (!this.validateEmail(newEmail)) {
            throw new Error("Invalid email format");
        }
        this._email = newEmail;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Implementation of abstract method
    validate() {
        return this._name && this._email && this._password;
    }

    // Abstract method
    getRole() {
        throw new Error("Method 'getRole()' must be implemented");
    }
}

// Enhanced Farmer Class (Inheritance)
class Farmer extends User {
    constructor(id, name, email, password, farmType, location) {
        super(id, name, email, password);
        this._farmType = farmType;
        this._location = location;
        this._products = [];
        this._rating = 0;
    }

    // Polymorphism - Different implementation of getRole
    getRole() {
        return "Farmer";
    }

    // Enhanced Encapsulation with validation
    addProduct(product) {
        if (!(product instanceof Product)) {
            throw new Error("Invalid product object");
        }
        this._products.push(product);
    }

    // Enhanced validation
    validate() {
        return super.validate() && this._farmType && this._location;
    }
}

// Enhanced Buyer Class (Inheritance)
class Buyer extends User {
    constructor(id, name, email, password, preferredLocation) {
        super(id, name, email, password);
        this._preferredLocation = preferredLocation;
        this._cart = [];
        this._orderHistory = [];
    }

    // Polymorphism - Different implementation of getRole
    getRole() {
        return "Buyer";
    }

    // Enhanced Encapsulation with validation
    addToCart(product) {
        if (!(product instanceof Product)) {
            throw new Error("Invalid product object");
        }
        this._cart.push(product);
    }

    // Enhanced validation
    validate() {
        return super.validate() && this._preferredLocation;
    }
}

// Enhanced Product Class (Inheritance from Entity)
class Product extends Entity {
    constructor(id, name, price, category, farmer) {
        super(id);
        this._name = name;
        this._price = price;
        this._category = category;
        this._farmer = farmer;
        this._stock = 0;
        this._rating = 0;
    }

    // Enhanced validation
    validate() {
        return this._name && this._price > 0 && this._category && this._farmer;
    }

    // Enhanced Encapsulation with validation
    setPrice(newPrice) {
        if (newPrice < 0) {
            throw new Error("Price cannot be negative");
        }
        this._price = newPrice;
    }
}

// Enhanced Weather Class (Inheritance from Entity)
class Weather extends Entity {
    constructor(id, location, temperature, condition, humidity, windSpeed) {
        super(id);
        this._location = location;
        this._temperature = temperature;
        this._condition = condition;
        this._humidity = humidity;
        this._windSpeed = windSpeed;
        this._lastUpdated = new Date();
    }

    // Enhanced validation
    validate() {
        return this._location && 
               typeof this._temperature === 'number' &&
               this._condition &&
               typeof this._humidity === 'number' &&
               typeof this._windSpeed === 'number';
    }
}

// Enhanced Weather Factory (Abstraction)
class WeatherFactory {
    static createWeather(data) {
        const weather = new Weather(
            Date.now().toString(), // Using timestamp as ID
            data.name,
            data.main.temp,
            data.weather[0].main,
            data.main.humidity,
            data.wind.speed
        );

        if (!weather.validate()) {
            throw new Error("Invalid weather data");
        }

        return weather;
    }
}

// Export enhanced classes
export { 
    Entity,
    User, 
    Farmer, 
    Buyer, 
    Product, 
    Weather, 
    WeatherFactory 
}; 