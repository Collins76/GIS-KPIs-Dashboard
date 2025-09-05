
"use client";

import { useState, useEffect } from 'react';
import { initialWeatherData } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wind, Droplets, CloudSun, Sun, CloudRain, Cloudy, CloudDrizzle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/lib/types';
import { addDays, format } from 'date-fns';


const generateWeatherData = (): WeatherData[] => {
  const today = new Date();
  const weather: WeatherData[] = [];
  const conditions = [
    { condition: 'Sunny', icon: Sun },
    { condition: 'Partly Cloudy', icon: CloudSun },
    { condition: 'Light Rain', icon: CloudRain },
    { condition: 'Scattered Showers', icon: CloudDrizzle },
    { condition: 'Cloudy', icon: Cloudy },
    { condition: 'Thunderstorm', icon: Zap },
  ];

  for (let i = 0; i < 6; i++) {
    const date = addDays(today, i);
    const dayOfWeek = format(date, 'EEE');
    const dateString = format(date, 'MMM d');
    const isToday = i === 0;

    // Simulate weather data
    const temp = 25 + Math.floor(Math.random() * 8); // Temp between 25 and 32
    const minTemp = temp - Math.floor(Math.random() * 3) - 1;
    const maxTemp = temp + Math.floor(Math.random() * 3) + 1;
    const humidity = 60 + Math.floor(Math.random() * 25);
    const windSpeed = 5 + Math.floor(Math.random() * 5);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    weather.push({
      dayOfWeek,
      date: dateString,
      temp,
      minTemp,
      maxTemp,
      ...condition,
      humidity,
      windSpeed,
      isToday,
    });
  }
  return weather;
};


export default function WeatherIntelligence() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate data on the client side to avoid hydration mismatch
    setWeatherData(generateWeatherData());
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeatherData(generateWeatherData());
      setLoading(false);
    }, 1000);
  };
  
  // Auto-refresh logic can remain if desired
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
  
  if (weatherData.length === 0) {
    return (
        <div className="glow-container p-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white font-orbitron flex items-center">
                    <CloudSun className="mr-2 h-6 w-6 text-yellow-400 animate-float" />
                    Lagos Weather Intelligence
                </h2>
            </div>
            <div className="text-center p-8 text-gray-400">Loading weather data...</div>
        </div>
    )
  }

  const today = weatherData.find(d => d.isToday) || weatherData[0];
  const forecast = weatherData.filter(d => !d.isToday).slice(0, 5);

  return (
    <div className="glow-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white font-orbitron flex items-center">
            <CloudSun className="mr-2 h-6 w-6 text-yellow-400 animate-float" />
            Lagos Weather Intelligence
        </h2>
        <Button onClick={handleRefresh} disabled={loading} size="sm" className="glow-button">
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today's Weather */}
        <Card className="kpi-card !border-yellow-400 md:col-span-2 lg:col-span-1">
          <CardContent className="p-2 text-center text-white flex flex-col justify-center h-full">
             <p className="text-sm font-semibold text-yellow-400 font-rajdhani">TODAY</p>
             <p className="font-bold text-sm">{today.dayOfWeek}</p>
             <today.icon className={cn("w-10 h-10 text-yellow-400 mx-auto my-1 animate-weather-icon", `weather-icon-${today.icon.displayName}`)} />
             <p className="text-2xl font-bold font-orbitron">{today.temp}°C</p>
             <p className="text-gray-400 text-xs mb-1">{`${today.minTemp}° / ${today.maxTemp}°`}</p>
             <p className="font-semibold text-xs">{today.condition}</p>
          </CardContent>
        </Card>

        {/* Forecast */}
        {forecast.map((day, index) => (
          <Card key={index} className="kpi-card">
            <CardContent className="p-2 text-center text-white">
                <p className="font-bold text-sm">{day.dayOfWeek}</p>
                <p className="text-xs text-gray-400 mb-1">{day.date}</p>
                <day.icon className={cn("w-8 h-8 text-blue-300 mx-auto animate-weather-icon", `weather-icon-${day.icon.displayName}`)} />
                <p className="text-xl font-bold font-orbitron mt-1">{day.temp}°C</p>
                 <div className="flex justify-center gap-3 text-xs text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        <span>{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Wind className="w-3 h-3" />
                        <span>{day.windSpeed}km/h</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
