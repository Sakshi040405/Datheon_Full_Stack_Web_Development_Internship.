
const API_KEY = "eabf2b53264cee647fc2675fd7121155";

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const dashboard = document.getElementById("weatherDashboard");
const emptyState = document.getElementById("emptyState");
const currentWeather = document.getElementById("currentWeather");
const forecastCards = document.getElementById("forecastCards");
const unitToggle = document.getElementById("unitToggle");

let currentData = null;
let forecastData = null;
let isCelsius = true;

document.getElementById("year").textContent = new Date().getFullYear();

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showMessage("Please enter a city name.");
    return;
  }

  if (API_KEY === "YOUR_NEW_API_KEY") {
    showMessage("Add your OpenWeatherMap API key in script.js first.");
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";
  showMessage("Fetching live weather data...", true);

  try {
    const [current, forecast] = await Promise.all([
      fetchWeather(city),
      fetchForecast(city)
    ]);

    currentData = current;
    forecastData = forecast;

    renderCurrentWeather();
    renderForecast();
    updateBackground(currentData.weather[0].main);

    dashboard.hidden = false;
    emptyState.hidden = true;
    showMessage("");
  } catch (error) {
    showMessage(error.message);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search ↗";
  }
});

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("City not found. Check the spelling and try again.");
    }
    if (response.status === 401) {
      throw new Error("API key is invalid or not active yet. Check your key.");
    }
    throw new Error(data.message || "Unable to fetch weather data.");
  }

  return data;
}

async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch the forecast.");
  }

  return data;
}

function renderCurrentWeather() {
  const data = currentData;
  const weather = data.weather[0];

  document.getElementById("cityName").textContent =
    `${data.name}, ${data.sys.country}`;

  document.getElementById("currentDate").textContent =
    new Date().toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

  document.getElementById("condition").textContent = weather.description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind").textContent = `${data.wind.speed} m/s`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;

  const icon = document.getElementById("weatherIcon");
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  renderTemperature();
}

function renderTemperature() {
  if (!currentData) return;

  const temperature = currentData.main.temp;
  const feelsLike = currentData.main.feels_like;

  const convert = (value) =>
    isCelsius ? value : (value * 9 / 5) + 32;

  const symbol = isCelsius ? "°C" : "°F";

  document.getElementById("temperature").textContent =
    `${Math.round(convert(temperature))}${symbol}`;

  document.getElementById("feelsLike").textContent =
    `Feels like ${Math.round(convert(feelsLike))}${symbol}`;

  unitToggle.textContent = isCelsius ? "Switch to °F" : "Switch to °C";
}

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  renderTemperature();
  renderForecast();
});

function renderForecast() {
  if (!forecastData) return;

  // OpenWeatherMap provides forecasts in 3-hour intervals.
  // Pick the forecast closest to midday for each upcoming day.
  const daily = new Map();

  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("en-CA");

    if (!daily.has(key)) {
      daily.set(key, []);
    }

    daily.get(key).push(item);
  });

  const days = [...daily.entries()].slice(0, 5);

  forecastCards.innerHTML = days.map(([dateKey, entries]) => {
    const midday = entries.reduce((best, item) => {
      const hour = new Date(item.dt * 1000).getHours();
      const bestHour = new Date(best.dt * 1000).getHours();

      return Math.abs(hour - 12) < Math.abs(bestHour - 12)
        ? item
        : best;
    }, entries[0]);

    const minTemp = Math.min(...entries.map(item => item.main.temp_min));
    const maxTemp = Math.max(...entries.map(item => item.main.temp_max));
    const weather = midday.weather[0];

    const convert = value =>
      isCelsius ? value : (value * 9 / 5) + 32;

    const symbol = isCelsius ? "°" : "°";

    const date = new Date(`${dateKey}T12:00:00`);

    return `
      <article class="forecast-card">
        <h3>${date.toLocaleDateString(undefined, { weekday: "short" })}</h3>
        <img
          src="https://openweathermap.org/img/wn/${weather.icon}@2x.png"
          alt="${weather.description}"
        >
        <p class="forecast-condition">${weather.description}</p>
        <div class="forecast-temps">
          <strong>${Math.round(convert(maxTemp))}${symbol}</strong>
          <span>${Math.round(convert(minTemp))}${symbol}</span>
        </div>
      </article>
    `;
  }).join("");
}

function updateBackground(condition) {
  document.body.classList.remove("sunny", "rainy", "cloudy", "night");

  const icon = currentData.weather[0].icon;
  const isNight = icon.endsWith("n");

  if (isNight) {
    document.body.classList.add("night");
    return;
  }

  const value = condition.toLowerCase();

  if (["rain", "drizzle", "thunderstorm"].includes(value)) {
    document.body.classList.add("rainy");
  } else if (["clouds", "mist", "fog", "haze", "smoke"].includes(value)) {
    document.body.classList.add("cloudy");
  } else {
    document.body.classList.add("sunny");
  }
}

function showMessage(text, loading = false) {
  message.textContent = text;
  message.classList.toggle("loading", loading);
}
