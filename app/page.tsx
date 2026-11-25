import WeatherCard from "../components/ui/WeatherCard";
import NigerianState from "../components/ui/NigerianState";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <WeatherCard />
      <NigerianState />
    </div>
  );
}
