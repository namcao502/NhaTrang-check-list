"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData, Destination, WeatherSuggestion } from './types';
import { isValidDestination, isValidWeatherCache } from './validation';
import { fetchWeather, getWeatherSuggestions } from './weatherApi';

const DESTINATION_KEY = 'beach-destination';
const CACHE_KEY = 'beach-weather-cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DEFAULT_DESTINATION: Destination = {
  name: 'Nha Trang',
  lat: 12.2388,
  lon: 109.1967,
};

function loadDestination(): Destination {
  try {
    const raw = localStorage.getItem(DESTINATION_KEY);
    if (!raw) return DEFAULT_DESTINATION;
    const parsed: unknown = JSON.parse(raw);
    if (isValidDestination(parsed)) return parsed;
  } catch {
    // Fall through to default
  }
  return DEFAULT_DESTINATION;
}

function saveDestination(dest: Destination): void {
  try {
    localStorage.setItem(DESTINATION_KEY, JSON.stringify(dest));
  } catch {
    // Ignore quota errors
  }
}

function loadCachedWeather(lat: number, lon: number, date: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidWeatherCache(parsed)) return null;
    // Check cache validity: same location, date, and within TTL
    const isMatch = parsed.lat === lat && parsed.lon === lon && parsed.date === date;
    const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
    if (isMatch && isFresh) return parsed.data;
  } catch {
    // Fall through
  }
  return null;
}

function saveCachedWeather(data: WeatherData, lat: number, lon: number, date: string): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      lat,
      lon,
      date,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore quota errors
  }
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date(getTodayDateString() + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export interface UseWeatherResult {
  weather: WeatherData | null;
  destination: Destination;
  setDestination: (dest: Destination) => void;
  loading: boolean;
  error: string | null;
  forecastUnavailable: boolean;
  suggestions: WeatherSuggestion[];
}

export function useWeather(departureDate: string | null): UseWeatherResult {
  const [destination, setDestinationState] = useState<Destination>(DEFAULT_DESTINATION);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastUnavailable, setForecastUnavailable] = useState(false);

  // Load destination from localStorage on mount
  useEffect(() => {
    setDestinationState(loadDestination());
  }, []);

  const setDestination = useCallback((dest: Destination) => {
    setDestinationState(dest);
    saveDestination(dest);
  }, []);

  // Fetch weather whenever destination or departure date changes
  useEffect(() => {
    const targetDate = departureDate ?? getTodayDateString();
    const daysOut = daysBetween(targetDate);

    // Open-Meteo only provides 7-day forecasts
    if (daysOut > 7 || daysOut < 0) {
      setForecastUnavailable(true);
      setWeather(null);
      setError(null);
      setLoading(false);
      return;
    }

    setForecastUnavailable(false);

    // Check cache first
    const cached = loadCachedWeather(destination.lat, destination.lon, targetDate);
    if (cached) {
      setWeather(cached);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeather(destination.lat, destination.lon, targetDate)
      .then((data) => {
        if (cancelled) return;
        setWeather(data);
        setError(null);
        saveCachedWeather(data, destination.lat, destination.lon, targetDate);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === 'DATE_OUT_OF_RANGE') {
          setForecastUnavailable(true);
          setWeather(null);
        } else {
          setError('Khong the tai thoi tiet');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destination.lat, destination.lon, departureDate]);

  const suggestions = weather ? getWeatherSuggestions(weather) : [];

  return {
    weather,
    destination,
    setDestination,
    loading,
    error,
    forecastUnavailable,
    suggestions,
  };
}
