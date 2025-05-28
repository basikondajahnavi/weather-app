// OpenWeatherMap API key - replace with your own key
const API_KEY = 'a9f5606f04fdeed207c7bba36ecbd36f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherInfo = document.getElementById('weatherInfo');
const suggestionsList = document.getElementById('suggestions'); // UL for suggestions

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

const themeToggle = document.getElementById('themeToggle');

searchBtn.addEventListener('click', searchWeather);

cityInput.addEventListener('input', showSuggestions);

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWeather();
        suggestionsList.innerHTML = '';
    }
});

// When clicking on a suggestion
suggestionsList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        cityInput.value = e.target.textContent;
        searchWeather();
        suggestionsList.innerHTML = '';
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeatherMap API key to the script.js file');
        return;
    }
    loadSavedCities();
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
    suggestionsList.innerHTML = '';
}

async function searchWeatherByCity(city) {
    try {
        // Hide old data/errors and show loading spinner
        errorMessage.classList.add('hidden');
        weatherInfo.classList.add('hidden');
        showLoading();

        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching weather data');
        }

        displayWeatherData(data);
        saveCity(city);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(
            error.message.toLowerCase().includes('city not found')
                ? 'City not found. Please try again.'
                : 'Failed to fetch weather data. Please try again.'
        );
    }
}

function displayWeatherData(data) {
    loading.classList.add('hidden');
    errorMessage.classList.add('hidden');

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

    weatherInfo.classList.remove('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    weatherInfo.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    loading.classList.add('hidden');
    weatherInfo.classList.add('hidden');
}

// Save city to localStorage - no duplicates, max 10 cities
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    city = city.toLowerCase();

    // Avoid duplicates
    if (!cities.includes(city)) {
        cities.unshift(city); // add to front
        if (cities.length > 10) cities.pop(); // keep max 10
        localStorage.setItem('savedCities', JSON.stringify(cities));
    }
}

// Load saved cities from localStorage
function loadSavedCities() {
    const cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    // No UI on load needed but ready for suggestions
}

// Show suggestions dropdown from saved cities filtered by input
function showSuggestions() {
    const input = cityInput.value.trim().toLowerCase();
    suggestionsList.innerHTML = '';

    if (!input) return;

    const cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    const filtered = cities.filter(city => city.startsWith(input));

    if (filtered.length === 0) return;

    filtered.forEach(city => {
        const li = document.createElement('li');
        // Capitalize first letter for display
        li.textContent = city.charAt(0).toUpperCase() + city.slice(1);
        suggestionsList.appendChild(li);
    });
}
