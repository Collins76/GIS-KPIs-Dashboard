
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
  const forecast = weatherData.filter(d => !d.isToday).slice(0, 4);

  return (
    <div className="glow-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-orbitron flex items-center">
            <CloudSun className="mr-3 h-8 w-8 text-yellow-400 animate-float" />
            Lagos Weather Intelligence
        </h2>
        <Button onClick={handleRefresh} disabled={loading} className="glow-button">
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Weather */}
        <Card className="kpi-card !border-yellow-400 lg:col-span-1">
          <CardContent className="p-4 text-center text-white">
             <p className="text-sm font-semibold text-yellow-400 font-rajdhani">TODAY</p>
             <p className="font-bold text-lg">{today.dayOfWeek}</p>
             <p className="text-xs text-gray-400 mb-4">{today.date}</p>
             <today.icon className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-float" />
             <p className="text-5xl font-bold font-orbitron">{today.temp}°C</p>
             <p className="text-gray-400 text-sm mb-1">{`${today.minTemp}° / ${today.maxTemp}°`}</p>
             <p className="font-semibold mb-4">{today.condition}</p>
             <div className="flex justify-between text-xs text-gray-300">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <span>{today.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>{today.windSpeed} km/h</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Forecast */}
        {forecast.map((day, index) => (
          <Card key={index} className="kpi-card">
            <CardContent className="p-4 text-center text-white">
                <p className="font-bold text-lg">{day.dayOfWeek}</p>
                <p className="text-xs text-gray-400 mb-4">{day.date}</p>
                <day.icon className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-4xl font-bold font-orbitron">{day.temp}°C</p>
                <p className="text-gray-400 text-sm mb-1">{`${day.minTemp}° / ${day.maxTemp}°`}</p>
                <p className="font-semibold mb-4 text-sm">{day.condition}</p>
                 <div className="flex justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        <span>{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4" />
                        <span>{day.windSpeed} km/h</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
