// Base User Class (Encapsulation)
class User {
    constructor(name, email, password) {
        this._name = name;
        this._email = email;
        this._password = password;
    }

    // Getters and Setters (Encapsulation)
    getName() {
        return this._name;
    }

    getEmail() {
        return this._email;
    }

    setEmail(newEmail) {
        this._email = newEmail;
    }

    // Abstract method (Abstraction)
    updateProfile() {
        throw new Error('Method not implemented');
    }
}

// Farmer Class (Inheritance)
class Farmer extends User {
    constructor(name, email, password, farmType, location) {
        super(name, email, password);
        this._farmType = farmType;
        this._location = location;
        this._products = [];
    }

    // Polymorphism - Different implementation of updateProfile
    updateProfile() {
        console.log(`Farmer profile updated: ${this._name} - ${this._farmType}`);
        return true;
    }

    addProduct(product) {
        this._products.push(product);
    }

    getProducts() {
        return this._products;
    }
}

// Buyer Class (Inheritance)
class Buyer extends User {
    constructor(name, email, password, preferredLocation) {
        super(name, email, password);
        this._preferredLocation = preferredLocation;
        this._cart = [];
    }

    // Polymorphism - Different implementation of updateProfile
    updateProfile() {
        console.log(`Buyer profile updated: ${this._name} - ${this._preferredLocation}`);
        return true;
    }

    addToCart(product) {
        this._cart.push(product);
    }

    getCart() {
        return this._cart;
    }
}

// Product Class (Encapsulation)
class Product {
    constructor(name, price, category, farmer) {
        this._name = name;
        this._price = price;
        this._category = category;
        this._farmer = farmer;
    }

    getName() {
        return this._name;
    }

    getPrice() {
        return this._price;
    }

    getFarmer() {
        return this._farmer;
    }
}

// Weather Class (Encapsulation)
class Weather {
    constructor(location, temperature, condition, humidity, windSpeed) {
        this._location = location;
        this._temperature = temperature;
        this._condition = condition;
        this._humidity = humidity;
        this._windSpeed = windSpeed;
    }

    getWeatherData() {
        return {
            location: this._location,
            temperature: this._temperature,
            condition: this._condition,
            humidity: this._humidity,
            windSpeed: this._windSpeed
        };
    }
}

// Weather Factory (Abstraction)
class WeatherFactory {
    static createWeather(data) {
        return new Weather(
            data.name,
            data.main.temp,
            data.weather[0].main,
            data.main.humidity,
            data.wind.speed
        );
    }
}

// Export classes for use in other files
export { User, Farmer, Buyer, Product, Weather, WeatherFactory }; 