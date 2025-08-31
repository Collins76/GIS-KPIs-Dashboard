
"use client";

import { weatherData } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function WeatherForecast() {
  const today = weatherData[0];
  const forecast = weatherData.slice(1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="hidden lg:flex items-center space-x-3 weather-enhanced p-2 h-auto">
          <div className="text-center">
            <today.icon className="text-yellow-400 text-2xl weather-icon" />
            <p className="text-xs text-gray-400 mt-1">Now</p>
          </div>
          <div>
            <p className="text-white text-lg font-bold font-orbitron">{today.temp}°C</p>
            <p className="text-xs text-yellow-400 font-rajdhani">Lagos, Nigeria</p>
            <p className="text-xs text-gray-400">{today.condition}</p>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glow-container p-4">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h4 className="font-orbitron text-lg font-bold text-white">5-Day Forecast</h4>
                 <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
           
            <div className="space-y-3">
            {forecast.map((day) => {
              const DayIcon = day.icon;
              return (
                <div key={day.day} className="flex items-center justify-between text-sm">
                  <span className="font-rajdhani font-semibold text-gray-300 w-12">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <DayIcon className="h-5 w-5 text-yellow-400" />
                    <span className="w-24 text-gray-400">{day.condition}</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{day.temp}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
