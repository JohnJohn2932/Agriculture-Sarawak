// import { Farmer, Buyer, Product, Weather, WeatherFactory } from './classes.js';

const weatherApiKey = '2bcd4395f36d772d65499f93916e087a';

// At the top of the script, store allPlants globally
window.allPlants = [];

// Place this at the top-level scope, outside any function
function getLangField(field) {
    const lang = localStorage.getItem('language') || 'en';
    if (typeof field === 'object' && field !== null) {
        return field[lang] || field['en'] || Object.values(field)[0];
    }
    return field;
}

// Translation functionality
async function loadTranslations() {
    const lang = localStorage.getItem('language') || 'en';
    try {
        const response = await fetch(`/${lang}.json`);
        const translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

// Global translation function for use throughout the app
function t(key, vars = {}) {
    if (!window.translations) return key;
    let str = window.translations[key] || key;
    // Replace {var} in string with values from vars
    Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), vars[k]);
    });
    return str;
}

async function updatePageTranslations() {
    const translations = await loadTranslations();
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });
}

// Language selector functionality
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = localStorage.getItem('language') || 'en';
        languageSelect.addEventListener('change', async function() {
            localStorage.setItem('language', this.value);
            await updatePageTranslations();
        });
    }
    // Initial translation load
    updatePageTranslations();
});

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

    // Sarawak district coordinates for reliable weather fetching
    const sarawakDistricts = {
        Kuching: { lat: 1.5533, lon: 110.3592 },
        Miri: { lat: 4.3993, lon: 113.9914 },
        Sibu: { lat: 2.2870, lon: 111.8262 },
        Bintulu: { lat: 3.1707, lon: 113.0415 },
        Limbang: { lat: 4.7500, lon: 115.0000 },
        Sarikei: { lat: 2.1271, lon: 111.5183 },
        "Sri Aman": { lat: 1.2400, lon: 111.4650 },
        Kapit: { lat: 2.0167, lon: 112.9333 },
        Mukah: { lat: 2.9000, lon: 112.0833 },
        Betong: { lat: 1.3892, lon: 111.5610 },
        Samarahan: { lat: 1.4567, lon: 110.4717 },
        Serian: { lat: 1.1833, lon: 110.5333 },
        Lundu: { lat: 1.4017, lon: 109.9833 }
    };

    // Fetch Real-Time Weather Data for Sarawak Locations
    async function fetchWeather(city) {
        city = city || "Kuching";
        console.log('Selected city:', city, '| After trim:', city.trim());
        const coords = sarawakDistricts[city.trim()];
        if (!coords) {
            alert('Weather data for this district is not available.');
            return;
        }
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${weatherApiKey}&units=metric`);
            const data = await response.json();
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
            // Fetch and update forecast
            fetchForecast(coords.lat, coords.lon);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            const weatherContainer = document.getElementById("weatherContainer");
            if (weatherContainer) {
                weatherContainer.innerHTML = "<p>⚠️ Error loading weather data</p>";
            }
        }
    }

    // On page load, call the correct fetchWeather for default city
    if (document.querySelector(".weather-container")) {
        (async () => {
            if (!window.translations || Object.keys(window.translations).length === 0) {
                window.translations = await loadTranslations();
            }
            fetchWeather("Kuching");
        })();
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
                    <a href="account.html" class="dropdown-item" style="display: block; padding: 10px 16px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;" data-i18n="dropdown_my_account">My Account</a>
                    <a href="settings.html" class="dropdown-item" style="display: block; padding: 10px 16px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;" data-i18n="dropdown_settings">Setting</a>
                    <a href="#" class="dropdown-item" id="dropdownLogoutBtn" style="display: block; padding: 10px 16px; color: #333; text-decoration: none;" data-i18n="dropdown_logout">Logout</a>
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
        // Logout logic for dropdown
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                window.location.href = 'index.html';
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
    const locationSelect = document.getElementById('location');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            const city = this.value;
            updateWeatherLocationHeader(city);
            fetchWeather(city);
        });
    }

    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn && locationSelect) {
        searchBtn.addEventListener('click', function() {
            const city = locationSelect.value;
            updateWeatherLocationHeader(city);
            if (city) fetchWeather(city);
        });
    }

    function updateWeatherLocationHeader(city) {
        const loc = document.getElementById('weatherLocation');
        if (loc) loc.textContent = `${capitalize(city)}, Sarawak`;
    }

    async function fetchForecast(lat, lon) {
        try {
            // Open-Meteo API: get hourly and daily forecast
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
            const response = await fetch(url);
            const data = await response.json();
            console.log('[DEBUG] Open-Meteo API response:', data);
            // Hourly Forecast
            const hourlyList = document.querySelector('.hourly-list');
            if (hourlyList && data.hourly && data.hourly.time) {
                hourlyList.innerHTML = '';
                const now = new Date();
                let currentHourIdx = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
                if (currentHourIdx === -1) currentHourIdx = 0;
                for (let i = 0; i < 5; i++) {
                    const idx = currentHourIdx + i;
                    if (idx >= data.hourly.time.length) break;
                    const hour = i === 0 ? t('now') : new Date(data.hourly.time[idx]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const temp = `${Math.round(data.hourly.temperature_2m[idx])}°C`;
                    const iconClass = getWeatherIconFromCode(data.hourly.weathercode[idx]);
                    hourlyList.innerHTML += `
                        <div class="hourly-item">
                            <span class="hour">${hour}</span>
                            <i class="${iconClass}"></i>
                            <span class="temp">${temp}</span>
                        </div>
                    `;
                }
            }
            // Daily Forecast
            const dailyList = document.querySelector('.daily-list');
            if (dailyList && data.daily && data.daily.time) {
                dailyList.innerHTML = '';
                for (let i = 0; i < 7; i++) {
                    if (i >= data.daily.time.length) break;
                    let day;
                    if (i === 0) {
                        day = t('today');
                    } else {
                        // Get weekday short name (Sun, Mon, ...)
                        const jsDay = new Date(data.daily.time[i]).getDay();
                        const shortNames = ['sun','mon','tue','wed','thu','fri','sat'];
                        day = t('day_' + shortNames[jsDay] + '_short');
                    }
                    const max = `${Math.round(data.daily.temperature_2m_max[i])}°C`;
                    const min = `${Math.round(data.daily.temperature_2m_min[i])}°C`;
                    const iconClass = getWeatherIconFromCode(data.daily.weathercode[i]);
                    dailyList.innerHTML += `
                        <div class="daily-item">
                            <span class="day">${day}</span>
                            <i class="${iconClass}"></i>
                            <div class="temp-range">
                                <span class="max">${max}</span>
                                <span class="min">${min}</span>
                            </div>
                        </div>
                    `;
                }
            }
            // Weather Alerts
            const alertList = document.querySelector('.alert-list');
            if (alertList) {
                alertList.innerHTML = '';
                let alertShown = false;
                const heavyRainCodes = [95, 96, 99, 61, 63, 65, 80, 81, 82];
                const lightRainCodes = [51, 53, 55, 56, 57];
                if (data.hourly && data.hourly.weathercode && data.hourly.time) {
                    // Align to current hour as in hourly forecast UI
                    const now = new Date();
                    let currentHourIdx = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
                    if (currentHourIdx === -1) currentHourIdx = 0;
                    // Only check the next 5 hours (same as UI)
                    for (let i = 0; i < 5; i++) {
                        const idx = currentHourIdx + i;
                        if (idx >= data.hourly.weathercode.length) break;
                        const code = data.hourly.weathercode[idx];
                        const time = new Date(data.hourly.time[idx]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        if (heavyRainCodes.includes(code)) {
                            alertList.innerHTML = `<div class="alert-item"><i class="fas fa-bolt"></i><div class="alert-content"><h4>${t('alert_heavy_rain_title')}</h4><p>${t('alert_heavy_rain_desc', { time })}</p></div></div>`;
                            alertShown = true;
                            break;
                        }
                    }
                    // If no heavy rain, scan for light rain in the same range
                    if (!alertShown) {
                        for (let i = 0; i < 5; i++) {
                            const idx = currentHourIdx + i;
                            if (idx >= data.hourly.weathercode.length) break;
                            const code = data.hourly.weathercode[idx];
                            const time = new Date(data.hourly.time[idx]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            if (lightRainCodes.includes(code)) {
                                alertList.innerHTML = `<div class="alert-item"><i class="fas fa-cloud-rain"></i><div class="alert-content"><h4>${t('alert_light_rain_title')}</h4><p>${t('alert_light_rain_desc', { time })}</p></div></div>`;
                                alertShown = true;
                                break;
                            }
                        }
                    }
                }
                // If no alert found, show no alerts
                if (!alertShown) {
                    alertList.innerHTML = `<div class="alert-item"><div class="alert-content"><p>${t('weather_alert_no_alerts')}</p></div></div>`;
                }
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
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

    function getWeatherIconFromCode(code) {
        // See https://open-meteo.com/en/docs#api_form for weathercode meanings
        switch (code) {
            case 0: return 'fas fa-sun'; // Clear sky
            case 1:
            case 2:
            case 3: return 'fas fa-cloud-sun'; // Mainly clear, partly cloudy, overcast
            case 45:
            case 48: return 'fas fa-smog'; // Fog
            case 51:
            case 53:
            case 55:
            case 56:
            case 57: return 'fas fa-cloud-drizzle'; // Drizzle
            case 61:
            case 63:
            case 65:
            case 80:
            case 81:
            case 82: return 'fas fa-cloud-showers-heavy'; // Rain
            case 71:
            case 73:
            case 75:
            case 77: return 'fas fa-snowflake'; // Snow
            case 95:
            case 96:
            case 99: return 'fas fa-bolt'; // Thunderstorm
            default: return 'fas fa-cloud';
        }
    }

    // Move plantKey function to top-level scope above initializePlantPage
    function plantKey(name) {
        // If name is an object, use the English version or the first value
        if (typeof name === 'object' && name !== null) {
            name = name['en'] || Object.values(name)[0];
        }
        const match = name.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
        if (!match) return name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const main = match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const paren = match[2] ? match[2].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';
        return paren ? `${main}__${paren}` : main;
    }

    // Plant Page Functions
    async function initializePlantPage() {
        const searchInput = document.getElementById('plantSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const seasonFilter = document.getElementById('seasonFilter');
        const plantGrid = document.querySelector('.plant-grid');
        let allPlants = [];

        // Fetch plant data from JSON
        try {
            const res = await fetch('/plants.json');
            allPlants = await res.json();
            window.allPlants = allPlants; // Store globally for re-rendering

            // Ensure translations are loaded before rendering cards
            if (!window.translations || Object.keys(window.translations).length === 0) {
                const lang = localStorage.getItem('language') || 'en';
                window.translations = await loadTranslations();
            }
            renderPlantCards(allPlants);
        } catch (err) {
            if (plantGrid) plantGrid.innerHTML = '<p style="padding:2rem;">Failed to load plant data.</p>';
            console.error('Plant data load error:', err);
            return;
        }

        // Filtering logic
        function filterPlants() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const categoryValue = categoryFilter ? categoryFilter.value : 'all';
            const seasonValue = seasonFilter ? seasonFilter.value : 'all';
            const filtered = allPlants.filter(plant => {
                const matchesSearch = getLangField(plant.name).toLowerCase().includes(searchTerm) || getLangField(plant.scientific).toLowerCase().includes(searchTerm);
                const matchesCategory = categoryValue === 'all' || plant.category === categoryValue;
                const matchesSeason = seasonValue === 'all' || (Array.isArray(plant.season) ? plant.season.includes(seasonValue) : plant.season === seasonValue);
                return matchesSearch && matchesCategory && matchesSeason;
            });
            renderPlantCards(filtered);
        }

        if (searchInput) searchInput.addEventListener('input', filterPlants);
        if (categoryFilter) categoryFilter.addEventListener('change', filterPlants);
        if (seasonFilter) seasonFilter.addEventListener('change', filterPlants);

        // Render plant cards
        function renderPlantCards(plants) {
            if (!plantGrid) return;
            if (!plants.length) {
                plantGrid.innerHTML = `<p style="padding:2rem;" data-i18n="plant_no_results"></p>`;
                updatePageTranslations();
                return;
            }

            plantGrid.innerHTML = '';
            plants.forEach(plant => {
                const card = document.createElement('div');
                card.className = 'plant-card';
                card.dataset.category = plant.category;
                card.dataset.season = plant.season;

                const nameKey = `plant_${plantKey(plant.name)}_name`;
                const descKey = `plant_${plantKey(plant.name)}_desc`;

                // Build season text from data
                let seasonDisplay = '';
                if (Array.isArray(plant.season)) {
                    seasonDisplay = plant.season.map(season => {
                        const seasonKey = 'plant_season_' + season.replace(/[-\s]/g, '_').toLowerCase();
                        return t(seasonKey);
                    }).join(', ');
                } else if (plant.season) {
                    const seasonKey = 'plant_season_' + plant.season.replace(/[-\s]/g, '_').toLowerCase();
                    seasonDisplay = t(seasonKey);
                }

                card.innerHTML = `
                    <div class="plant-image">
                        <img src="${plant.image}" alt="${getLangField(plant.name)}">
                    </div>
                    <div class="plant-info">
                        <h3>${getLangField(plant.name)}</h3>
                        <p class="scientific-name">${getLangField(plant.scientific)}</p>
                        <div class="plant-details">
                            <p><strong data-i18n="plant_growing_season">Growing Season:</strong> ${seasonDisplay}</p>
                            <p><strong data-i18n="plant_best_regions">Best Regions:</strong> ${getLangField(plant.regions)}</p>
                            <p><strong data-i18n="plant_soil_type">Soil Type:</strong> ${getLangField(plant.soil)}</p>
                            <p><strong data-i18n="plant_water_needs">Water Needs:</strong> ${getLangField(plant.water)}</p>
                        </div>
                        <button class="details-btn" data-i18n="plant_view_details">View Details</button>
                    </div>
                `;
                plantGrid.appendChild(card);
            });
            // Re-apply translations after cards are added to the DOM
            updatePageTranslations();

            // Attach event listeners to all details buttons after rendering
            const detailButtons = plantGrid.querySelectorAll('.details-btn');
            detailButtons.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    showPlantDetails(plants[idx]);
                });
            });
        }

        // Modal for plant details
        function showPlantDetails(plant) {
            const modal = document.getElementById('plant-modal');
            const modalBody = document.getElementById('plant-modal-body');
            if (!modal || !modalBody) return;

            modalBody.innerHTML = `
                <h2>${getLangField(plant.name)}</h2>
                <p>${getLangField(plant.description) || t('plant_no_description')}</p>
            `;
            modal.style.display = 'flex';

            document.getElementById('close-plant-modal').onclick = () => {
                modal.style.display = 'none';
            };
            // Close modal when clicking outside content
            modal.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        }
    }

    // Initialize plant page when DOM is loaded
    if (document.querySelector('.plant-grid')) {
        initializePlantPage();
    }

    // === Settings Page Logic ===
    // ... rest of the code remains unchanged ...
});