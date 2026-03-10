import type { WeatherData, WeatherSuggestion } from './types';
import { WEATHER, WEATHER_SUGGESTIONS } from './constants';

// WMO Weather interpretation codes mapped to Vietnamese descriptions
export const WMO_WEATHER_CODES: Record<number, { text: string; emoji: string }> = {
  0: { text: 'Trời quang', emoji: '☀️' },
  1: { text: 'Ít mây', emoji: '🌤️' },
  2: { text: 'Có mây', emoji: '⛅' },
  3: { text: 'Nhiều mây', emoji: '☁️' },
  45: { text: 'Sương mù', emoji: '🌫️' },
  48: { text: 'Sương mù đọng', emoji: '🌫️' },
  51: { text: 'Mưa phùn nhẹ', emoji: '🌦️' },
  53: { text: 'Mưa phùn', emoji: '🌦️' },
  55: { text: 'Mưa phùn dày', emoji: '🌧️' },
  56: { text: 'Mưa phùn lạnh nhẹ', emoji: '🌧️' },
  57: { text: 'Mưa phùn lạnh', emoji: '🌧️' },
  61: { text: 'Mưa nhẹ', emoji: '🌦️' },
  63: { text: 'Mưa vừa', emoji: '🌧️' },
  65: { text: 'Mưa to', emoji: '🌧️' },
  66: { text: 'Mưa lạnh nhẹ', emoji: '🧊' },
  67: { text: 'Mưa lạnh to', emoji: '🧊' },
  71: { text: 'Tuyết nhẹ', emoji: '🌨️' },
  73: { text: 'Tuyết vừa', emoji: '🌨️' },
  75: { text: 'Tuyết dày', emoji: '❄️' },
  77: { text: 'Hạt tuyết', emoji: '❄️' },
  80: { text: 'Mưa rào nhẹ', emoji: '🌦️' },
  81: { text: 'Mưa rào', emoji: '🌧️' },
  82: { text: 'Mưa rào to', emoji: '⛈️' },
  85: { text: 'Mưa tuyết nhẹ', emoji: '🌨️' },
  86: { text: 'Mưa tuyết to', emoji: '🌨️' },
  95: { text: 'Giông', emoji: '⛈️' },
  96: { text: 'Giông có mưa đá nhẹ', emoji: '⛈️' },
  99: { text: 'Giông có mưa đá', emoji: '⛈️' },
};

export function getWeatherDescription(code: number): { text: string; emoji: string } {
  return WMO_WEATHER_CODES[code] ?? { text: WEATHER.UNKNOWN, emoji: '❓' };
}

interface OpenMeteoResponse {
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
    time: string[];
  };
}

// Fetch weather data from Open-Meteo API
export async function fetchWeather(
  lat: number,
  lon: number,
  date?: string
): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const json: OpenMeteoResponse = await response.json();
  const { daily } = json;

  // Find the index for the requested date (or use today = index 0)
  let dayIndex = 0;
  if (date && daily.time) {
    const idx = daily.time.indexOf(date);
    if (idx !== -1) {
      dayIndex = idx;
    } else {
      // Date not in forecast range
      throw new Error('DATE_OUT_OF_RANGE');
    }
  }

  return {
    temperature_max: daily.temperature_2m_max[dayIndex],
    temperature_min: daily.temperature_2m_min[dayIndex],
    weathercode: daily.weathercode[dayIndex],
    rain_probability: daily.precipitation_probability_max[dayIndex],
  };
}

// Generate packing suggestions based on weather conditions
export function getWeatherSuggestions(data: WeatherData): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];

  // Rain-related suggestions
  if (data.rain_probability >= 50 || (data.weathercode >= 51 && data.weathercode <= 67) || (data.weathercode >= 80 && data.weathercode <= 82)) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.RAIN_JACKET, icon: '🌂' });
  }

  // Hot weather suggestions
  if (data.temperature_max >= 32) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.SUNSCREEN, icon: '🧴' });
  }

  if (data.temperature_max >= 35) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.WIDE_HAT, icon: '👒' });
  }

  // Cool weather
  if (data.temperature_min <= 20) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.LIGHT_JACKET, icon: '🧥' });
  }

  // Thunderstorm
  if (data.weathercode >= 95) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.THUNDERSTORM, icon: '⚡' });
  }

  // Foggy
  if (data.weathercode === 45 || data.weathercode === 48) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.FOG_WARNING, icon: '🌫️' });
  }

  // Good beach weather
  if (data.weathercode <= 1 && data.temperature_max >= 28 && data.rain_probability < 30) {
    suggestions.push({ text: WEATHER_SUGGESTIONS.IDEAL_BEACH, icon: '🏖️' });
  }

  return suggestions;
}

// Geocode a city name using Open-Meteo geocoding API
export async function geocodeCity(name: string): Promise<{ name: string; lat: number; lon: number } | null> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'vi');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) return null;

  const json = await response.json();
  if (!json.results || json.results.length === 0) return null;

  const result = json.results[0];
  return {
    name: result.name as string,
    lat: result.latitude as number,
    lon: result.longitude as number,
  };
}
