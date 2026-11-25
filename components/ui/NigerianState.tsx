"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Cloud, Droplets, MapPinned, Wind } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface WeatherData {
  location: { name: string; localtime: string };
  current: {
    temp_c: number;
    condition: { text: string; icon: string };
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
  };
}

const NIGERIA_STATES = [
  "Lagos", "Abuja", "Kano", "Kaduna", "Rivers", "Oyo", "Enugu", "Benue", "Borno", "Edo",
  "Delta", "Anambra", "Cross River", "Akwa Ibom", "Imo", "Osun", "Ekiti", "Kwara", "Ondo", "Bauchi",
  "Niger", "Plateau", "Kogi", "Sokoto", "Zamfara", "Kebbi", "Taraba", "Yobe", "Adamawa", "Gombe",
  "Jigawa", "Nasarawa", "Bayelsa", "Ebonyi", "Abia", "Katsina",
];

export default function NigerianState() {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchAllWeather = async () => {
      const data: Record<string, WeatherData | null> = {};
      await Promise.all(
        NIGERIA_STATES.map(async (state) => {
          try {
            const response = await axios.get<WeatherData>(
              "https://api.weatherapi.com/v1/current.json",
              {
                params: { key: process.env.NEXT_PUBLIC_WEATHER_API_KEY, q: state },
                timeout: 12000,
              },
            );
            data[state] = response.data;
          } catch {
            data[state] = null;
          }
        }),
      );
      if (active) {
        setWeatherData(data);
        setLoading(false);
      }
    };
    void fetchAllWeather();
    return () => { active = false; };
  }, []);

  return (
    <section className="state-weather-section">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="weather-eyebrow mb-2">Explore by location</p>
          <h2>Weather across Nigeria</h2>
          <p className="mt-1 text-sm text-slate-500">Current conditions from cities and state capitals nationwide.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
          {NIGERIA_STATES.length} locations
        </span>
      </div>
      {loading ? (
        <div className="weather-panel flex min-h-40 items-center justify-center gap-3 p-8 text-sm text-slate-500">
          <LoadingSpinner /> Loading state weather reports…
        </div>
      ) : (
        <div className="state-weather-grid">
          {NIGERIA_STATES.map((state) => {
            const weather = weatherData[state];
            return (
              <article key={state} className="state-weather-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><MapPinned size={17} /></span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">{state}</h3>
                      <p className="text-[10px] text-slate-400">{weather?.location.name ?? "Weather unavailable"}</p>
                    </div>
                  </div>
                  {weather && <img src={weather.current.condition.icon.startsWith("//") ? `https:${weather.current.condition.icon}` : weather.current.condition.icon} alt="" className="h-10 w-10" />}
                </div>
                {weather ? (
                  <>
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div><p className="text-4xl font-semibold tracking-tight text-slate-950">{Math.round(weather.current.temp_c)}°</p><p className="mt-1 text-xs font-medium text-sky-700">{weather.current.condition.text}</p></div>
                      <p className="pb-1 text-[10px] text-slate-400">Feels {Math.round(weather.current.feelslike_c)}°C</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5"><Droplets size={13} className="text-sky-600" />{weather.current.humidity}%</span>
                      <span className="flex items-center gap-1.5"><Wind size={13} className="text-sky-600" />{Math.round(weather.current.wind_kph)} km/h</span>
                      <span className="ml-auto flex items-center gap-1.5"><Cloud size={13} />Live</span>
                    </div>
                  </>
                ) : (
                  <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Weather data is temporarily unavailable.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
