
"use client";
// import { FiSearch } from 'react-icons/fi'
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../ui/LoadingSpinner";

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

export default function WeatherCard() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [city, setCity] = useState("Multan");
    const [loading, setLoading] = useState(false);

    const fetchWeather = async (query: string) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${query}`
            );
            setWeather(res.data);
        } catch (error) {
            console.error("Failed to fetch weather data", error);
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(city);
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (city) fetchWeather(city);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        return "Evening";
    };

    return (
        <div className=" align-middle w-full p-20 justify-center bg-amber-300 gap-2 mb-4">
        <div className="w-full mx-auto my-10  ">
            <form
                onSubmit={handleSearch}
                className="flex items-center w-full max-w-5xl rounded-full border-4 border-blue-600 overflow-hidden bg-white mb-10 justify-between"
            >
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city..."
                    className="flex-grow px-4 py-2 text-lg text-gray-700 focus:outline-none"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 flex items-center justify-center"
                >
                    Search 
                    {/* <FiSearch size={24} /> */}
                </button>
            </form>


            {/* Weather Card */}
            {loading ? (
               <LoadingSpinner/>
            ) : weather ? (
                <div className="bg-white shadow-xl rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
                    {/* Left / Main Temperature */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                            <span>{weather.location.name}</span>
                            <span>{new Date(weather.location.localtime).toLocaleDateString()}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="text-7xl font-light">{Math.round(weather.current.temp_c)}°</div>
                            <div className="flex items-center space-x-2">
                                <img src={weather.current.condition.icon} alt="icon" />
                                <span className="text-xl">{weather.current.condition.text}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-6 text-sm">
                            <div className="flex items-center space-x-1">💨 <span>{weather.current.wind_kph} kph</span></div>
                            <div className="flex items-center space-x-1">💧 <span>{weather.current.humidity}%</span></div>
                            <div className="flex items-center space-x-1">🤒 <span>Feels like {weather.current.feelslike_c}°</span></div>
                        </div>
                    </div>

                    {/* Right / Summary */}
                    <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <div className="text-lg font-medium mb-1">Good {getGreeting()}</div>
                        <div className="text-2xl font-light mb-4">
                            {new Date(weather.location.localtime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>

                        <div className="text-sm font-medium text-gray-600">Weather Summary</div>
                        <div className="mt-2 text-sm">Temp: <span className="font-semibold">{weather.current.temp_c}°C</span></div>
                        <div className="text-sm">Condition: <span className="font-semibold">{weather.current.condition.text}</span></div>
                        <div className="text-sm">Humidity: <span className="font-semibold">{weather.current.humidity}%</span></div>
                        <div className="text-sm">Wind: <span className="font-semibold">{weather.current.wind_kph} kph</span></div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500">City not found.</div>
            )}
            </div>
        </div>
    );
}
