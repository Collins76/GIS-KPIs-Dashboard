
"use client";

import { useState, useEffect } from 'react';
import { MapPin, Calendar } from 'lucide-react';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="glow-container p-4 text-center">
        <div id="digitalClock" className="digital-clock">
          {isClient ? formattedTime : '00:00:00'}
        </div>
        <p className="text-xs text-yellow-400 font-rajdhani tracking-widest mt-2">
            <MapPin className="mr-1 inline-block h-3 w-3" />LAGOS, NIGERIA
        </p>
        <div className="text-xs text-gray-400 mt-1 font-space">
            <Calendar className="mr-1 inline-block h-3 w-3" />
            <span id="currentDate">{isClient ? formattedDate : 'Loading...'}</span>
        </div>
    </div>
  );
}
