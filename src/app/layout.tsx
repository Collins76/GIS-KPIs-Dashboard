
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Ikeja Electric GIS Pulse',
  description: 'GIS Key Performance Indicator Dashboard for Ikeja Electric Plc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
       <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </Head>
      <body className={cn('min-h-screen bg-black font-space antialiased text-white')}>
        {children}
        <Toaster />
        <script src="/js/charts.js" defer></script>
        <script src="/js/map.js" defer></script>
        <script src="/js/upload.js" defer></script>
      </body>
    </html>
  );
}
