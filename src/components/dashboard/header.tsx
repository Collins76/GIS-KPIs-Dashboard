
"use client"

import { LogOut, Zap } from 'lucide-react';
import UserProfile from '@/components/dashboard/user-profile';
import Clock from '@/components/dashboard/clock';
import WeatherForecast from '@/components/dashboard/weather-forecast';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('gis-user-profile');
        router.push('/login');
    }
  }

  return (
    <header className="glow-container shadow-lg relative z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden animate-pulse-glow">
              <Zap className="text-white text-2xl animate-float" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-sweep"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">Ikeja Electric Plc</h1>
              <p className="text-sm text-green-400 font-rajdhani tracking-wide glow-text-green">⚡ GIS KPI Dashboard ⚡</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center hidden md:block">
                <Clock />
            </div>
            <div className="hidden lg:block">
              <WeatherForecast />
            </div>
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
