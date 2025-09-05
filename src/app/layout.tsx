
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Head from 'next/head';
import { UserProvider } from '@/context/user-context';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Clean up any extension-added attributes after hydration
    const body = document.body
    if (body.hasAttribute('monica-id')) {
      // Don't remove, just acknowledge they exist
      console.log('Monica extension detected - this is normal')
    }
  }, [])

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
       <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
      </Head>
      <body 
        className={cn('min-h-screen bg-black font-space antialiased text-white')}
        suppressHydrationWarning={true}
      >
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/js/charts.js" defer></script>
        <script src="/js/map.js" defer></script>
      </body>
    </html>
  );
}
