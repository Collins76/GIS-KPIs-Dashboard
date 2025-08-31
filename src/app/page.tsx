
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/components/dashboard/dashboard-page';

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('gis-user-profile')) {
      router.push('/login');
    }
  }, [router]);

  if (!isClient || (typeof window !== 'undefined' && !localStorage.getItem('gis-user-profile'))) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
    );
  }

  return <DashboardPage />;
}
