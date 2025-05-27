// OpenWeatherMap API key - You need to get your own free API key from openweathermap.org
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherInfo = document.getElementById('weatherInfo');

// Weather data elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Initialize with default city
document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeatherMap API key to the script.js file');
        return;
    }
    // You can set a default city here
    // searchWeatherByCity('London');
});

async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeatherMap API key to the script.js file');
        return;
    }

    await searchWeatherByCity(city);
    cityInput.value = '';
}

async function searchWeatherByCity(city) {
    try {
        showLoading();
        
        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.cod === '404') {
            throw new Error('City not found');
        }
        
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message === 'City not found' ? 'City not found. Please try again.' : 'Failed to fetch weather data. Please try again.');
    }
}

function displayWeatherData(data) {
    // Hide loading and error states
    loading.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    // Update weather information
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    temp.textContent = Math.round(data.main.temp);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    description.textContent = data.weather[0].description;
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
    
    // Show weather info
    weatherInfo.classList.remove('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    weatherInfo.classList.add('hidden');
}

function showError(message) {
    loading.classList.add('hidden');
    weatherInfo.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.querySelector('p').textContent = message;
}

// Get user's location weather (optional feature)
function getUserLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    showLoading();
                    const response = await fetch(
                        `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                    );
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch weather data');
                    }
                    
                    const data = await response.json();
                    displayWeatherData(data);
                    
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                    showError('Failed to fetch weather data for your location.');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                showError('Unable to get your location.');
            }
        );
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

// Uncomment the line below if you want to automatically get weather for user's location on page load
// getUserLocationWeather();
