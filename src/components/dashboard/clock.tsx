
"use client";

import { useState, useEffect } from 'react';
import { MapPin, Calendar } from 'lucide-react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="glow-container p-4">
        <div id="digitalClock" className="digital-clock text-center">{formattedTime}</div>
        <div className="scrolling-text-container-slow mt-2">
            <div className="animate-scroll-slow whitespace-nowrap">
                <span className="inline-block px-4 py-1 scrolling-text-content-green">
                    Powered by the GIS Team
                </span>
                <span className="inline-block px-4 py-1 scrolling-text-content-green">
                    Powered by the GIS Team
                </span>
            </div>
        </div>
        <p className="text-xs text-yellow-400 font-rajdhani tracking-widest mt-2 text-center">
            <MapPin className="mr-1 inline-block h-3 w-3" />LAGOS, NIGERIA
        </p>
        <div className="text-xs text-gray-400 mt-1 font-space text-center">
            <Calendar className="mr-1 inline-block h-3 w-3" />
            <span id="currentDate">{formattedDate}</span>
        </div>
    </div>
  );
}
