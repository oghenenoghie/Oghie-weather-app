// components/WeatherNigeria.tsx
"use client";
import LoadingSpinner from "./LoadingSpinner";
import { useEffect, useState } from "react";
import axios from "axios";

interface WeatherData {
    location: {
        name: string;
        localtime: string;
    };
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
    "Jigawa", "Nasarawa", "Bayelsa", "Ebonyi", "Abia", "Katsina"
];

export default function WeatherNigeria() {
    const [weatherData, setWeatherData] = useState<Record<string, WeatherData | null>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllWeather = async () => {
            setLoading(true);
            const data: Record<string, WeatherData | null> = {};

            await Promise.all(
                NIGERIA_STATES.map(async (state) => {
                    try {
                        const res = await axios.get(
                            `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${state}`
                        );
                        data[state] = res.data;
                    } catch (err) {
                        console.error("Error fetching", state, err);
                        data[state] = null;
                    }
                })
            );

            setWeatherData(data);
            setLoading(false);
        };

        fetchAllWeather();
    }, []);

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-10">🌍 Weather Report Across Nigeria</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {NIGERIA_STATES.map((state) => {
                    const weather = weatherData[state];
                    return (
                        <div
                            key={state}
                            className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300 flex flex-col justify-between text-gray-800"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">{state}</h2>
                                    {weather && (
                                        <img
                                            src={weather.current.condition.icon}
                                            alt="icon"
                                            className="w-8 h-8"
                                        />
                                    )}
                                </div>
                                {weather ? (
                                    <>
                                        <div className="text-5xl font-extrabold mb-1">
                                            {Math.round(weather.current.temp_c)}°C
                                        </div>
                                        <p className="text-lg font-medium text-blue-700 mb-4">
                                            {weather.current.condition.text}
                                        </p>
                                        <ul className="text-sm space-y-1">
                                            <li><strong>Feels like:</strong> {weather.current.feelslike_c}°C</li>
                                            <li><strong>Humidity:</strong> {weather.current.humidity}%</li>
                                            <li><strong>Wind:</strong> {weather.current.wind_kph} kph</li>
                                            <li className="text-gray-500 text-xs mt-2">
                                                {new Date(weather.location.localtime).toLocaleString()}
                                            </li>
                                        </ul>
                                    </>
                                ) : (
                                    <p className="text-red-500">Weather data not available.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}