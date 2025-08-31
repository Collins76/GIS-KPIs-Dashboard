
"use client";

import { useState } from 'react';
import { weatherData as initialWeatherData } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wind, Droplets, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/lib/types';

export default function WeatherIntelligence() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>(initialWeatherData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd fetch new data. Here we just shuffle for demonstration.
      const shuffled = [...weatherData].sort(() => Math.random() - 0.5);
      // Ensure there's always one 'isToday'
      const todayIndex = shuffled.findIndex(d => d.isToday);
      if (todayIndex > 0) {
        const todayData = shuffled[todayIndex];
        shuffled.splice(todayIndex, 1);
        shuffled.unshift(todayData);
      }
      setWeatherData(shuffled);
      setLoading(false);
    }, 1000);
  };

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
             <today.icon className="w-10 h-10 text-yellow-400 mx-auto my-1 animate-weather-icon" />
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
                <day.icon className="w-8 h-8 text-blue-300 mx-auto animate-weather-icon" />
                <p className="text-xl font-bold font-orbitron mt-1">{day.temp}°C</p>
                 <div className="flex justify-center gap-3 text-xs text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        <span>{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Wind className="w-3 h-3" />
                        <span>{day.windSpeed}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
