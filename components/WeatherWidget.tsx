"use client";

import { useWeather } from '@/lib/useWeather';
import { getWeatherDescription } from '@/lib/weatherApi';
import DestinationInput from '@/components/DestinationInput';
import { WEATHER } from '@/lib/constants';

interface Props {
  departureDate: string | null;
}

export default function WeatherWidget({ departureDate }: Props) {
  const {
    weather,
    destination,
    setDestination,
    loading,
    error,
    forecastUnavailable,
    suggestions,
  } = useWeather(departureDate);

  const dateLabel = departureDate ? `ngày ${departureDate}` : 'hôm nay';

  return (
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-600 dark:text-gray-300 font-playfair">
            {WEATHER.TITLE}
          </span>
          <DestinationInput
            destination={destination}
            onDestinationChange={setDestination}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {dateLabel}
        </span>
      </div>

      {/* Loading state — compact skeleton */}
      {loading && (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Forecast unavailable (>7 days out) */}
      {forecastUnavailable && !loading && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {WEATHER.FORECAST_UNAVAILABLE}
        </div>
      )}

      {/* Weather data */}
      {weather && !loading && !error && !forecastUnavailable && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            {/* Condition */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">{getWeatherDescription(weather.weathercode).emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {getWeatherDescription(weather.weathercode).text}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(weather.temperature_min)}° — {Math.round(weather.temperature_max)}°C
                </p>
              </div>
            </div>

            {/* Rain probability */}
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-ocean-600 dark:text-ocean-300">
                {weather.rain_probability}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {WEATHER.RAIN_LABEL}
              </p>
            </div>
          </div>

          {/* Packing suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <span
                  key={s.text}
                  className="inline-flex items-center gap-1 rounded-full bg-sand-100 dark:bg-sand-700/30 text-sand-700 dark:text-sand-300 text-xs font-medium px-2.5 py-1"
                >
                  {s.icon} {s.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
