import { Injectable } from '@angular/core';
import { WEATHER_CONFIG } from './weather.config';

// Minimal WeatherService stub - replace with real API integration later
@Injectable({ providedIn: 'root' })
export class WeatherService {
  // Simulated current weather data
  async getCurrentWeather(city: string) {
    // If OPENWEATHER_API_KEY is configured, call the real API
    const key = (WEATHER_CONFIG && WEATHER_CONFIG.OPENWEATHER_API_KEY) || '';
    if (key) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(key)}&units=metric`;
        const resp = await fetch(url, { headers: { Accept: 'application/json' } });
        if (resp.ok) {
          const j = await resp.json();
          // normalize shape to what components expect
          return {
            name: j.name,
            sys: { country: j.sys?.country },
            main: { temp: j.main?.temp, temp_min: j.main?.temp_min, temp_max: j.main?.temp_max, humidity: j.main?.humidity },
            wind: { speed: j.wind?.speed },
            weather: j.weather || []
          };
        }
      } catch (e) {
        // fall back to stub
      }
    }

    // Fallback stubbed data (demo mode)
    const indian = ['Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad','Chennai','Kolkata','Surat','Pune','Jaipur'];
    const base = indian.includes(city) ? 30 : 22;
    const rand = Math.floor(Math.random() * 6) - 2; // -2..3
    return {
      name: city,
      sys: { country: indian.includes(city) ? 'IN' : 'US' },
      main: { temp: base + rand, temp_min: base + rand - 2, temp_max: base + rand + 2, humidity: 60 },
      wind: { speed: Math.round((2 + Math.random() * 6) * 10) / 10 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
    };
  }

  // Accept lat/lon coords and return a stubbed object
  async getCurrentWeatherByCoords(lat: number, lon: number) {
    // If we have an OpenWeather API key, try fetching by coords first
    const key = (WEATHER_CONFIG && WEATHER_CONFIG.OPENWEATHER_API_KEY) || '';
    if (key) {
      const byCoords = await this.fetchOpenWeatherByCoords(lat, lon);
      if (byCoords) return byCoords;
    }

    // Try reverse geocoding to get a friendly place name (OpenStreetMap Nominatim)
    try {
      const loc = await this.reverseGeocode(lat, lon);
      if (loc && loc.city) {
        // use the existing getCurrentWeather which will call OpenWeather by name if configured
        const data = await this.getCurrentWeather(loc.city);
        data.name = loc.city;
        data.sys = data.sys || {};
        if (loc.country) data.sys.country = loc.country;
        return data;
      }
    } catch (e) {
      // ignore and fall back to coords-based stub below
    }

    // fallback stub if reverse-geocoding fails
    const city = `Lat${Math.round(lat)},Lon${Math.round(lon)}`;
    const base = 28 + (Math.round(lat) % 5);
    const rand = Math.floor(Math.random() * 6) - 2;
    return {
      name: city,
      sys: { country: 'IN' },
      main: { temp: base + rand, temp_min: base + rand - 2, temp_max: base + rand + 2, humidity: 58 },
      wind: { speed: Math.round((2 + Math.random() * 6) * 10) / 10 },
      weather: [{ id: 801, main: 'Clouds', description: 'partly cloudy', icon: '02d' }]
    };
  }

  // Reverse geocode using OpenStreetMap Nominatim to get a friendly place name
  // Exposed for unit tests
  public async reverseGeocode(lat: number, lon: number): Promise<{ city?: string, country?: string } | null> {
    try {
      if (!WEATHER_CONFIG || WEATHER_CONFIG.ENABLE_REVERSE_GEOCODE === false) return null;
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) return null;
      const j = await resp.json();
      const addr = j?.address || {};
      // Prefer more specific locality fields when present
      const city = addr.city || addr.town || addr.village || addr.hamlet || addr.locality || addr.county || addr.state;
      const country = (addr.country_code || '').toUpperCase();
      return { city, country };
    } catch (err) {
      return null;
    }
  }

  // If OPENWEATHER_API_KEY is provided, we can also fetch by coords directly
  private async fetchOpenWeatherByCoords(lat: number, lon: number) {
    const key = (WEATHER_CONFIG && WEATHER_CONFIG.OPENWEATHER_API_KEY) || '';
    if (!key) return null;
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(key)}&units=metric`;
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) return null;
      const j = await resp.json();
      return {
        name: j.name,
        sys: { country: j.sys?.country },
        main: { temp: j.main?.temp, temp_min: j.main?.temp_min, temp_max: j.main?.temp_max, humidity: j.main?.humidity },
        wind: { speed: j.wind?.speed },
        weather: j.weather || []
      };
    } catch (e) {
      return null;
    }
  }

  async getForecast(city: string) {
    // return stubbed 5-day forecast
    const days = [];
    for (let i = 0; i < 5; i++) {
      days.push({
        date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        temp_min: 15 + i,
        temp_max: 22 + i,
        weather: { id: 800 + i, description: 'clear', icon: '01d' }
      });
    }
    return days;
  }
}
