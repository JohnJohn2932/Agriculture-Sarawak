// import { Farmer, Buyer, Product, Weather, WeatherFactory } from './classes.js';

const weatherApiKey = '2bcd4395f36d772d65499f93916e087a';

document.addEventListener("DOMContentLoaded", function () {
    console.log("GreenGrow Sarawak Loaded Successfully!");

    // Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("show");
        });
    }

    // Fetch Real-Time Weather Data for Sarawak Locations
    async function fetchWeather() {
        const locations = [
            "Kuching", "Sibu", "Miri", "Bintulu", "Mukah", 
            "Limbang", "Sarikei", "Sri Aman", "Kapit", "Betong", "Lawas"
        ];

        const weatherContainer = document.getElementById("weatherContainer");
        if (!weatherContainer) return;

        weatherContainer.innerHTML = ""; // Clear previous data

        try {
            const apiKey = "your_openweather_api_key"; // 🔹 REPLACE WITH YOUR API KEY
            for (const location of locations) {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location},MY&units=metric&appid=${apiKey}`);
                const data = await response.json();

                // Using WeatherFactory to create Weather objects
                const weather = WeatherFactory.createWeather(data);
                const weatherData = weather.getWeatherData();

                const weatherCard = document.createElement("div");
                weatherCard.classList.add("weather-card");
                weatherCard.innerHTML = `
                    <h3>${weatherData.location}</h3>
                    <p>🌡️ Temperature: ${weatherData.temperature}°C</p>
                    <p>🌥️ Condition: ${weatherData.condition}</p>
                    <p>💧 Humidity: ${weatherData.humidity}%</p>
                    <p>🌬️ Wind Speed: ${weatherData.windSpeed} km/h</p>
                `;

                weatherContainer.appendChild(weatherCard);
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
            weatherContainer.innerHTML = "<p>⚠️ Error loading weather data</p>";
        }
    }

    // Auto-fetch weather data if on the weather page
    if (document.querySelector(".weather-container")) {
        fetchWeather();
    }

    // 📢 Notice Board Updates
    const noticeBoard = document.getElementById("noticeBoard");
    if (noticeBoard) {
        const notices = [
            "🌱 New feature: AI-powered planting recommendations now available!",
            "🚜 Reminder: Submit your farming reports by the end of the month!",
            "☀️ Weather Alert: Heavy rain expected this weekend. Plan accordingly!",
            "🌾 Join our farmer's community forum today!"
        ];
        let noticeIndex = 0;

        function updateNotice() {
            noticeBoard.innerText = notices[noticeIndex];
            noticeIndex = (noticeIndex + 1) % notices.length;
        }

        updateNotice();
        setInterval(updateNotice, 8000);
    }

    // 👤 Profile Settings Form Submission
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("profileEmail").value;
            const password = document.getElementById("password").value;
            const userType = document.getElementById("userType").value;
            
            // Create appropriate user object based on type
            let user;
            if (userType === "farmer") {
                const farmType = document.getElementById("farmType").value;
                const location = document.getElementById("location").value;
                user = new Farmer(fullName, email, password, farmType, location);
            } else {
                const preferredLocation = document.getElementById("preferredLocation").value;
                user = new Buyer(fullName, email, password, preferredLocation);
            }
            
            // Update profile using OOP method
            if (user.updateProfile()) {
                alert(`Profile updated successfully!\nName: ${user.getName()}\nEmail: ${user.getEmail()}`);
                profileForm.reset();
            }
        });
    }

    // Handle product listing
    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const productName = document.getElementById("productName").value;
            const price = document.getElementById("price").value;
            const category = document.getElementById("category").value;
            const farmerName = document.getElementById("farmerName").value;
            
            // Create a new product using the Product class
            const product = new Product(productName, price, category, farmerName);
            
            // Add product to farmer's list (in a real application, this would be stored in a database)
            const farmer = new Farmer(farmerName, "", "", "", "");
            farmer.addProduct(product);
            
            alert(`Product added successfully!\nName: ${product.getName()}\nPrice: RM${product.getPrice()}`);
            productForm.reset();
        });
    }

    // Dynamic header: show user info if logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const headerAuth = document.querySelector('.header-auth');
    if (user && headerAuth) {
        headerAuth.innerHTML = `
            <div class="user-info profile-dropdown-container" style="position: relative; cursor: pointer;">
                <img src="${user.profilePic || '/assets/default-avatar.png'}" alt="Profile" class="profile-pic" id="profilePicBtn">
                <span class="user-name" id="profileNameBtn">${user.fullName}</span>
                <div class="profile-dropdown" id="profileDropdown" style="display: none; position: absolute; top: 110%; right: 0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 8px; min-width: 140px; z-index: 999;">
                    <a href="account.html" class="dropdown-item" style="display: block; padding: 10px 16px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">My Account</a>
                    <a href="#" class="dropdown-item" style="display: block; padding: 10px 16px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">Setting</a>
                    <a href="#" id="logout-link" class="dropdown-item" style="display: block; padding: 10px 16px; color: #c00; text-decoration: none;">Log Out</a>
                </div>
            </div>
        `;
        // Toggle dropdown on profile click
        const profilePicBtn = document.getElementById('profilePicBtn');
        const profileNameBtn = document.getElementById('profileNameBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        function toggleDropdown(e) {
            e.stopPropagation();
            profileDropdown.style.display = (profileDropdown.style.display === 'block') ? 'none' : 'block';
        }
        if (profilePicBtn) profilePicBtn.onclick = toggleDropdown;
        if (profileNameBtn) profileNameBtn.onclick = toggleDropdown;
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileDropdown && profileDropdown.style.display === 'block' && !profileDropdown.contains(e.target) && !profilePicBtn.contains(e.target) && !profileNameBtn.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
        // Logout logic
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('user');
                location.reload();
            };
        }
    }

    // Avatar upload event
    const avatarUploadInput = document.getElementById('avatarUpload');
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Preview the image
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileAvatar').src = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload to server with email
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) {
                alert('User not logged in.');
                window.location.href = 'index.html';
                return;
            }
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('email', user.email);

            fetch('/upload-avatar', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.imageUrl) {
                    // Update localStorage and header
                    user.profilePic = data.imageUrl;
                    localStorage.setItem('user', JSON.stringify(user));
                    document.getElementById('profileAvatar').src = data.imageUrl;
                    // Also update header profile pic if present
                    const headerPic = document.getElementById('profilePicBtn');
                    if (headerPic) headerPic.src = data.imageUrl;
                } else {
                    alert('Failed to upload avatar: ' + data.message);
                }
            });
        });
    }

    // Enable inline editing for profile fields
    const editableFields = ['username', 'email', 'phone', 'address', 'password', 'city', 'state', 'postcode'];
    editableFields.forEach(field => {
        const changeBtn = document.querySelector(`button[data-field="${field}"]`);
        const valueSpan = document.getElementById(`profile${capitalize(field)}`);
        if (changeBtn && valueSpan) {
            changeBtn.addEventListener('click', function () {
                // If already editing, do nothing
                if (valueSpan.querySelector('input')) return;
                const currentValue = valueSpan.textContent;
                let inputType = 'text';
                if (field === 'password') inputType = 'password';
                valueSpan.innerHTML = `<input type="${inputType}" id="input${capitalize(field)}" value="${field === 'password' ? '' : currentValue}" style="width: 70%;">`;
                changeBtn.textContent = 'Cancel';
                // Cancel logic
                changeBtn.onclick = function () {
                    valueSpan.textContent = field === 'password' ? '********' : currentValue;
                    changeBtn.textContent = 'Change';
                    changeBtn.onclick = null;
                    changeBtn.addEventListener('click', arguments.callee);
                };
            });
        }
    });
    function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

    // Update Save Changes logic to get values from input fields if present
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function () {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const originalEmail = user.email; // Store the old email
            function getFieldValue(field) {
                const input = document.getElementById(`input${capitalize(field)}`);
                if (input) return input.value;
                const span = document.getElementById(`profile${capitalize(field)}`);
                if (field === 'password') return '';
                return span ? span.textContent : user[field];
            }
            const username = getFieldValue('username') || user.username;
            const email = getFieldValue('email') || user.email;
            const phone = getFieldValue('phone') || user.phone;
            const address = getFieldValue('address') || user.address;
            const password = getFieldValue('password');
            const city = getFieldValue('city') || user.city;
            const state = getFieldValue('state') || user.state;
            const postcode = getFieldValue('postcode') || user.postcode;
            const avatarInput = document.getElementById('avatarUpload');
            const avatarFile = avatarInput && avatarInput.files[0];

            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('address', address);
            formData.append('oldEmail', originalEmail); // Always send oldEmail
            formData.append('city', city);
            formData.append('state', state);
            formData.append('postcode', postcode);
            if (password) formData.append('password', password);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            fetch('/update-profile', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Profile updated successfully!');
                    // Fetch latest user info and update DOM
                    fetch(`/user-info?email=${encodeURIComponent(email)}`)
                        .then(res => res.json())
                        .then(data => {
                            console.log('[DEBUG] /user-info full response:', data);
                            if (data.success) {
                                let updatedUser = data.user;
                                updatedUser.fullName = updatedUser.username;
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                document.getElementById('profileUsername').textContent = updatedUser.username || '';
                                document.getElementById('profileEmail').textContent = updatedUser.email || '';
                                document.getElementById('profilePhone').textContent = updatedUser.phone || '';
                                document.getElementById('profileAddress').textContent = updatedUser.address || '';
                                document.getElementById('profileCity').textContent = updatedUser.city || '';
                                document.getElementById('profileState').textContent = updatedUser.state || '';
                                document.getElementById('profilePostcode').textContent = updatedUser.postcode || '';
                                document.getElementById('profileAvatar').src = updatedUser.profilePic || 'assets/default-avatar.png';
                                // Update header profile info if present
                                const headerPic = document.getElementById('profilePicBtn');
                                if (headerPic) headerPic.src = updatedUser.profilePic || '/assets/default-avatar.png';
                                const headerName = document.getElementById('profileNameBtn');
                                if (headerName) headerName.textContent = updatedUser.username || updatedUser.fullName || 'User';
                            }
                        });
                    // Restore spans if they were inputs
                    editableFields.forEach(field => {
                        const input = document.getElementById(`input${capitalize(field)}`);
                        const span = document.getElementById(`profile${capitalize(field)}`);
                        if (input && span) {
                            span.textContent = field === 'password' ? '********' : input.value;
                            const btn = document.querySelector(`button[data-field="${field}"]`);
                            if (btn) btn.textContent = 'Change';
                        }
                    });
                } else {
                    alert('Failed to update profile: ' + data.message);
                }
            });
        });
    }

    // Load user info into account page fields with debug logging
    console.log('[DEBUG] localStorage user:', user);
    if (window.location.pathname.includes('account.html')) {
        console.log('[DEBUG] On account page');
        if (user && user.email) {
            const fetchUrl = `/user-info?email=${encodeURIComponent(user.email)}`;
            console.log('[DEBUG] Fetching user info from:', fetchUrl);
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    console.log('[DEBUG] /user-info response:', data);
                    if (data.success) {
                        // Update localStorage with latest info
                        user.profilePic = data.user.profilePic;
                        user.username = data.user.username;
                        user.email = data.user.email;
                        user.phone = data.user.phone;
                        user.address = data.user.address;
                        user.city = data.user.city;
                        user.state = data.user.state;
                        user.postcode = data.user.postcode;
                        localStorage.setItem('user', JSON.stringify(user));
                        // Update DOM for all fields
                        const setField = (id, value) => {
                            const el = document.getElementById(id);
                            if (el) {
                                el.textContent = value || '';
                            } else {
                                console.error('[DEBUG] Element not found:', id);
                            }
                        };
                        setField('profileUsername', data.user.username);
                        setField('profileEmail', data.user.email);
                        setField('profilePhone', data.user.phone);
                        setField('profileAddress', data.user.address);
                        setField('profileCity', data.user.city);
                        setField('profileState', data.user.state);
                        setField('profilePostcode', data.user.postcode);
                        const avatarEl = document.getElementById('profileAvatar');
                        if (avatarEl) avatarEl.src = data.user.profilePic || 'assets/default-avatar.png';
                    } else {
                        alert('User not found in database.');
                    }
                })
                .catch(err => {
                    console.error('[DEBUG] Error fetching user info:', err);
                });
        } else {
            // Redirect to homepage if not logged in
            window.location.href = 'index.html';
        }
    }

    // === Weather Page Logic ===
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            const city = this.value;
            fetchWeather(city);
        });
    }

    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn && locationSelect) {
        searchBtn.addEventListener('click', function() {
            const city = locationSelect.value;
            console.log('[DEBUG] Search button clicked, city:', city);
            if (city) fetchWeather(city);
        });
    }

    function fetchWeather(city) {
        console.log('[DEBUG] fetchWeather called for:', city);
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},MY&appid=${weatherApiKey}&units=metric`)
            .then(res => res.json())
            .then(data => {
                console.log('[DEBUG] OpenWeatherMap response:', data);
                // Update location
                const loc = document.getElementById('weatherLocation');
                if (loc) loc.textContent = `${capitalize(city)}, Sarawak`;
                // Update temperature
                const temp = document.getElementById('temperature');
                if (temp) temp.textContent = `${Math.round(data.main.temp)}°C`;
                const feels = document.getElementById('feelsLike');
                if (feels) feels.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
                // Update wind, humidity, pressure
                const wind = document.getElementById('wind');
                if (wind) wind.textContent = `${data.wind.speed} km/h`;
                const humidity = document.getElementById('humidity');
                if (humidity) humidity.textContent = `${data.main.humidity}%`;
                const pressure = document.getElementById('pressure');
                if (pressure) pressure.textContent = `${data.main.pressure} hPa`;
                // Update last updated
                const lastUpd = document.getElementById('lastUpdated');
                if (lastUpd) lastUpd.textContent = new Date().toLocaleTimeString();
                // Day/Night logic
                const now = Math.floor(Date.now() / 1000);
                const isDay = now > data.sys.sunrise && now < data.sys.sunset;
                const iconClass = getWeatherIcon(data.weather[0].main, isDay);
                const iconEl = document.getElementById('weatherIcon');
                if (iconEl) iconEl.innerHTML = `<i class="${iconClass}"></i>`;
            });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getWeatherIcon(main, isDay) {
        switch(main.toLowerCase()) {
            case 'clear':
                return isDay ? 'fas fa-sun' : 'fas fa-moon';
            case 'clouds':
                return isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
            case 'rain':
            case 'drizzle':
                return 'fas fa-cloud-rain';
            case 'thunderstorm':
                return 'fas fa-bolt';
            case 'snow':
                return 'fas fa-snowflake';
            case 'mist':
            case 'fog':
            case 'haze':
                return 'fas fa-smog';
            default:
                return isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
        }
    }
});
