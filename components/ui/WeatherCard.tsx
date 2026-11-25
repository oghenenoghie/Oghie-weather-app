"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Eye,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";

type Condition = { text: string; icon: string; code: number };
type Hour = { time: string; temp_c: number; chance_of_rain: number; condition: Condition };
type Day = {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    daily_chance_of_rain: number;
    uv: number;
    condition: Condition;
  };
  astro: { sunrise: string; sunset: string };
  hour: Hour[];
};
type WeatherData = {
  location: { name: string; region: string; country: string; localtime: string };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    vis_km: number;
    uv: number;
    cloud: number;
    precip_mm: number;
    condition: Condition;
  };
  forecast: { forecastday: Day[] };
};

const weatherIcon = (code: number, isDay = true) => {
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return CloudLightning;
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return CloudRain;
  if ([1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return CloudSnow;
  if ([1030, 1135, 1147].includes(code)) return CloudFog;
  if ([1068, 1072, 1168, 1171, 1198, 1201, 1249, 1252].includes(code)) return CloudDrizzle;
  if ([1000].includes(code) && isDay) return Sun;
  return Cloud;
};

const formatHour = (time: string) =>
  new Date(time.replace(" ", "T")).toLocaleTimeString([], { hour: "numeric" });

const formatDay = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" });

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="weather-metric">
      <div className="weather-metric-icon"><Icon size={17} strokeWidth={1.8} /></div>
      <div className="min-w-0">
        <p className="weather-eyebrow">{label}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("Kuwait City");
  const [query, setQuery] = useState("Kuwait City");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");

  const fetchWeather = useCallback(async (place: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get<WeatherData>(
        "https://api.weatherapi.com/v1/forecast.json",
        {
          params: {
            key: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
            q: place,
            days: 3,
            aqi: "no",
            alerts: "no",
          },
          timeout: 12000,
        },
      );
      setWeather(response.data);
      setCity(response.data.location.name);
      setQuery(response.data.location.name);
    } catch {
      setError("We couldn't find that location. Check the spelling and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWeather("Kuwait City");
  }, [fetchWeather]);

  const temperature = (celsius: number) =>
    Math.round(unit === "C" ? celsius : (celsius * 9) / 5 + 32);
  const currentDay = weather?.forecast.forecastday[0];
  const localNow = weather?.location.localtime;
  const hourly = useMemo(() => {
    if (!currentDay || !localNow) return [];
    const locationTime = new Date(localNow.replace(" ", "T")).getTime();
    return currentDay.hour
      .filter((item) => new Date(item.time.replace(" ", "T")).getTime() >= locationTime)
      .slice(0, 8);
  }, [currentDay, localNow]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) void fetchWeather(query.trim());
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError("Location services are not available in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void fetchWeather(`${coords.latitude},${coords.longitude}`),
      () => {
        setLoading(false);
        setError("Location access was denied. Search for a city instead.");
      },
      { timeout: 10000 },
    );
  };

  const CurrentIcon = weather ? weatherIcon(weather.current.condition.code) : Cloud;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-6 sm:px-7 lg:px-10">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Skyline weather home">
          <span className="brand-mark"><Sun size={22} /></span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-950">Skyline<span className="text-sky-600">.</span></span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Weather intelligence</span>
          </span>
        </Link>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <form onSubmit={handleSearch} className="weather-search">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              aria-label="Search city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city or postcode"
            />
            <button type="submit" aria-label="Search weather" disabled={loading}><span className="hidden sm:inline">Search</span><Search size={16} className="sm:hidden" /></button>
          </form>
          <button type="button" onClick={handleLocation} className="weather-utility" aria-label="Use my location">
            <LocateFixed size={17} /><span>My location</span>
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="weather-eyebrow mb-2">Your daily forecast</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Weather report</h1>
          <p className="mt-1 text-sm text-slate-500">A clearer view of what’s happening outside.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="unit-switch" aria-label="Temperature unit">
            <button type="button" onClick={() => setUnit("C")} className={unit === "C" ? "active" : ""} aria-pressed={unit === "C"}>°C</button>
            <button type="button" onClick={() => setUnit("F")} className={unit === "F" ? "active" : ""} aria-pressed={unit === "F"}>°F</button>
          </div>
          <button type="button" onClick={() => void fetchWeather(city)} className="icon-button" aria-label="Refresh weather" disabled={loading}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading && !weather ? (
        <div className="weather-loading"><span className="loading-orbit" /><p>Gathering the latest conditions…</p></div>
      ) : weather ? (
        <>
          <section className="weather-hero">
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-white/85">
                  <MapPin size={16} />
                  <span>{weather.location.name}, {weather.location.country}</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Live</span>
                </div>
                <p className="text-xs text-white/65">Updated {new Date(weather.location.localtime.replace(" ", "T")).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
              </div>
              <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-sm font-medium text-white/70">Right now</p>
                  <div className="mt-1 flex items-start gap-3">
                    <span className="text-[88px] font-semibold leading-none tracking-[-0.09em] text-white sm:text-[112px]">{temperature(weather.current.temp_c)}°</span>
                    <div className="pt-3 text-white">
                      <CurrentIcon size={42} strokeWidth={1.25} />
                      <p className="mt-2 text-sm font-medium">{weather.current.condition.text}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/75">Feels like {temperature(weather.current.feelslike_c)}° · {weather.current.condition.text}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-7 gap-y-5 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">High</p><p className="mt-1 flex items-center gap-1 text-xl font-semibold text-white"><ArrowUp size={15} />{temperature(currentDay?.day.maxtemp_c ?? weather.current.temp_c)}°</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Low</p><p className="mt-1 flex items-center gap-1 text-xl font-semibold text-white"><ArrowDown size={15} />{temperature(currentDay?.day.mintemp_c ?? weather.current.temp_c)}°</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Humidity</p><p className="mt-1 text-xl font-semibold text-white">{weather.current.humidity}%</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Wind</p><p className="mt-1 text-xl font-semibold text-white">{Math.round(weather.current.wind_kph)} <span className="text-xs font-medium text-white/65">km/h</span></p></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs text-white/70">
                <span>{new Date(weather.location.localtime.replace(" ", "T")).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</span>
                <span>{weather.current.wind_dir} wind · {weather.current.cloud}% cloud cover</span>
              </div>
            </div>
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-orb" aria-hidden="true" />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="weather-eyebrow">The next few hours</p><h2 className="mt-1 text-lg font-bold text-slate-950">Hourly outlook</h2></div>
                <span className="text-xs text-slate-400">Next 8 hours</span>
              </div>
              <div className="weather-panel overflow-hidden">
                <div className="hourly-scroll">
                  {hourly.map((hour, index) => {
                    const HourIcon = weatherIcon(hour.condition.code);
                    return <div className={`hour-item ${index === 0 ? "hour-current" : ""}`} key={hour.time}>
                      <p className="text-xs font-medium text-slate-500">{index === 0 ? "Now" : formatHour(hour.time)}</p>
                      <HourIcon size={23} className="my-3 text-sky-600" strokeWidth={1.6} />
                      <p className="text-lg font-bold text-slate-900">{temperature(hour.temp_c)}°</p>
                      <p className="mt-2 flex items-center gap-1 text-[10px] text-sky-600"><Droplets size={11} />{hour.chance_of_rain}%</p>
                    </div>;
                  })}
                </div>
              </div>

              <div className="mb-3 mt-7">
                <p className="weather-eyebrow">Plan ahead</p><h2 className="mt-1 text-lg font-bold text-slate-950">3-day forecast</h2>
              </div>
              <div className="weather-panel divide-y divide-slate-100">
                {weather.forecast.forecastday.map((day, index) => {
                  const DayIcon = weatherIcon(day.day.condition.code);
                  return <div className="forecast-row" key={day.date}>
                    <div className="w-20"><p className="font-semibold text-slate-800">{index === 0 ? "Today" : formatDay(day.date)}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(`${day.date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}</p></div>
                    <div className="flex min-w-0 flex-1 items-center gap-2"><DayIcon size={22} className="shrink-0 text-sky-600" /><span className="truncate text-xs text-slate-500">{day.day.condition.text}</span></div>
                    <div className="flex w-24 items-center justify-end gap-3 text-sm"><span className="font-semibold text-slate-900">{temperature(day.day.maxtemp_c)}°</span><span className="text-slate-400">{temperature(day.day.mintemp_c)}°</span></div>
                    <div className="hidden w-16 items-center justify-end gap-1 text-xs text-sky-600 sm:flex"><Droplets size={13} />{day.day.daily_chance_of_rain}%</div>
                  </div>;
                })}
              </div>
            </div>

            <aside className="min-w-0">
              <div className="mb-3"><p className="weather-eyebrow">At a glance</p><h2 className="mt-1 text-lg font-bold text-slate-950">Weather details</h2></div>
              <div className="weather-panel grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-2">
                <Metric icon={Thermometer} label="Feels like" value={`${temperature(weather.current.feelslike_c)}°`} detail="Perceived temperature" />
                <Metric icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} detail="Relative humidity" />
                <Metric icon={Wind} label="Wind" value={`${Math.round(weather.current.wind_kph)} km/h`} detail={`Direction ${weather.current.wind_dir}`} />
                <Metric icon={Eye} label="Visibility" value={`${weather.current.vis_km} km`} detail="Horizontal visibility" />
                <Metric icon={Sun} label="UV index" value={`${weather.current.uv}`} detail="Today's UV strength" />
                <Metric icon={Activity} label="Pressure" value={`${Math.round(weather.current.pressure_mb)} mb`} detail="Atmospheric pressure" />
              </div>

              <div className="weather-panel mt-5 p-5">
                <p className="weather-eyebrow">Daylight</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">Sunrise & sunset</h3>
                <div className="sun-track"><span className="sun-track-line" /><span className="sun-track-sun"><Sun size={17} /></span></div>
                <div className="mt-3 flex justify-between">
                  <div className="flex items-center gap-2"><Sunrise size={17} className="text-amber-500" /><div><p className="text-[10px] text-slate-400">Sunrise</p><p className="text-sm font-semibold text-slate-800">{currentDay?.astro.sunrise ?? "—"}</p></div></div>
                  <div className="flex items-center gap-2 text-right"><div><p className="text-[10px] text-slate-400">Sunset</p><p className="text-sm font-semibold text-slate-800">{currentDay?.astro.sunset ?? "—"}</p></div><Sunset size={17} className="text-orange-500" /></div>
                </div>
              </div>
            </aside>
          </section>
        </>
      ) : (
        <div className="weather-panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <Cloud size={36} className="text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Weather unavailable</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Check your connection or search for another location.</p>
          <button type="button" onClick={() => void fetchWeather(city)} className="weather-utility mt-5"><RefreshCw size={15} />Try again</button>
        </div>
      )}
      {loading && weather && <p className="mt-3 text-right text-xs text-slate-400">Refreshing weather data…</p>}
      <div className="mt-12 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">Weather data provided by WeatherAPI.com · Forecasts are updated regularly.</div>
    </main>
  );
}
