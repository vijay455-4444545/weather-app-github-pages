<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Forecast - Vijay Rao</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>🌤️ Weather Forecast</h1>
    <p class="credit">Created by Vijay Rao</p>
    
    <div class="search-box">
      <input type="text" id="cityInput" placeholder="Enter city name (e.g., Bengaluru)" />
      <button id="getWeatherBtn">Get Weather</button>
    </div>

    <div id="currentWeather" class="weather-section"></div>
    <div id="forecast" class="weather-section"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 5px;
}

.credit {
  text-align: center;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

#cityInput {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

#cityInput:focus {
  outline: none;
  border-color: #667eea;
}

#getWeatherBtn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

#getWeatherBtn:hover {
  background: #5568d3;
}

#getWeatherBtn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.weather-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.weather-section h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.weather-section p {
  color: #555;
  margin: 8px 0;
  line-height: 1.6;
}

.forecast-day {
  padding: 15px;
  margin: 10px 0;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

img {
  vertical-align: middle;
  margin-left: 10px;
}

@media (max-width: 480px) {
  .search-box {
    flex-direction: column;
  }
  
  #getWeatherBtn {
    width: 100%;
  }
}
const API_KEY = "YOUR_API_KEY"; // ← replace with your OpenWeatherMap API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const currentSection = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecast");

getWeatherBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  getWeatherBtn.textContent = "Loading...";
  getWeatherBtn.disabled = true;

  try {
    const currentData = await getCurrentWeather(city);
    const forecastData = await getForecast(city);

    renderCurrentWeather(currentData);
    renderForecast(forecastData);
  } catch (err) {
    alert(err.message);
    currentSection.innerHTML = "";
    forecastSection.innerHTML = "";
  } finally {
    getWeatherBtn.textContent = "Get Weather";
    getWeatherBtn.disabled = false;
  }
});

async function getCurrentWeather(city) {
  const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error("City not found. Check spelling.");
    throw new Error("Failed to fetch current weather.");
  }
  return res.json();
}

async function getForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error("City not found. Check spelling.");
    throw new Error("Failed to fetch forecast.");
  }
  return res.json();
}

function renderCurrentWeather(data) {
  const { name, main, weather, wind } = data;
  const temp = Math.round(main.temp);
  const feels = Math.round(main.feels_like);
  const desc = weather[0].description;
  const icon = weather[0].icon;

  let rainAlert = "";
  if (desc.toLowerCase().includes("rain") || desc.toLowerCase().includes("drizzle")) {
    rainAlert = "<p><strong>🌧️ Monsoon alert:</strong> Heavy rain possible. Carry an umbrella and stay safe.</p>";
  }

  currentSection.innerHTML = `
    <h2>Current Weather in ${name}</h2>
    <p><strong>Temperature:</strong> ${temp}°C (feels like ${feels}°C)</p>
    <p><strong>Condition:</strong> ${desc} <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" /></p>
    <p><strong>Humidity:</strong> ${main.humidity}%</p>
    <p><strong>Wind:</strong> ${wind.speed} m/s</p>
    ${rainAlert}
  `;
}

function renderForecast(data) {
  const byDay = {};
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
    if (!byDay[date]) {
      byDay[date] = [];
    }
    byDay[date].push(item);
  });

  let html = "<h2>5-Day Forecast</h2>";
  for (const [date, entries] of Object.entries(byDay)) {
    const avgTemp = entries.reduce((sum, e) => sum + e.main.temp, 0) / entries.length;
    const mainDesc = entries[0].weather[0].description;
    const icon = entries[0].weather[0].icon;

    let rainNote = "";
    if (mainDesc.toLowerCase().includes("rain") || mainDesc.toLowerCase().includes("drizzle")) {
      rainNote = " – <strong>🌧️ Monsoon season:</strong> expect heavy rain.";
    }

    html += `
      <div class="forecast-day">
        <p><strong>${date}</strong></p>
        <p>Temp: ~${Math.round(avgTemp)}°C | ${mainDesc}${rainNote}
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${mainDesc}" />
        </p>
      </div>
    `;
  }

  forecastSection.innerHTML = html;
}
