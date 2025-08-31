import { weatherData } from '@/lib/data';

export default function WeatherForecast() {
  const WeatherIcon = weatherData[0].icon;

  return (
      <div className="hidden lg:flex items-center space-x-3 weather-enhanced">
        <div className="text-center">
            <WeatherIcon className="text-yellow-400 text-2xl weather-icon" />
             <p className="text-xs text-gray-400 mt-1">Weather</p>
        </div>
        <div>
            <p className="text-white text-lg font-bold font-orbitron">{weatherData[0].temp}°C</p>
            <p className="text-xs text-yellow-400 font-rajdhani">Lagos, Nigeria</p>
            <p className="text-xs text-gray-400">Partly Cloudy</p>
        </div>
      </div>
  );
}
