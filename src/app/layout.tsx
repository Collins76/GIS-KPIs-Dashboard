import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

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
    <html lang="en" className="dark">
      <body className={cn('min-h-screen bg-background font-sans antialiased font-inter')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
