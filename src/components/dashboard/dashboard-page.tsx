"use client";

import { useState } from 'react';
import type { Role } from '@/lib/types';
import { kpis as allKpis } from '@/lib/data';
import {
  Activity,
  BarChart,
  File,
  Map,
  LayoutGrid,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KpiSummaryCards from '@/components/dashboard/kpi-summary-cards';
import KpiStatusChart from '@/components/dashboard/kpi-status-chart';
import KpiPerformanceChart from '@/components/dashboard/kpi-performance-chart';
import AiInsights from '@/components/dashboard/ai-insights';
import KpiTable from '@/components/dashboard/kpi-table';
import LocationMap from '@/components/dashboard/location-map';
import FileManager from '@/components/dashboard/file-manager';
import Clock from '@/components/dashboard/clock';
import WeatherForecast from '@/components/dashboard/weather-forecast';

export default function DashboardPage() {
  const [role] = useState<Role>('GIS Coordinator');
  const kpis = allKpis.filter((kpi) => kpi.role === role);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview"><LayoutGrid className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="kpis"><Activity className="mr-2 h-4 w-4" />KPIs</TabsTrigger>
            <TabsTrigger value="trends"><BarChart className="mr-2 h-4 w-4" />Trends</TabsTrigger>
            <TabsTrigger value="map"><Map className="mr-2 h-4 w-4" />Location Map</TabsTrigger>
            <TabsTrigger value="files"><File className="mr-2 h-4 w-4" />Data Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <KpiSummaryCards kpis={kpis} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4 card-glow">
                <CardHeader>
                  <CardTitle className="text-glow">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <KpiPerformanceChart kpis={kpis} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3 card-glow">
                <CardHeader>
                  <CardTitle className="text-glow">KPI Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <KpiStatusChart kpis={kpis} />
                </CardContent>
              </Card>
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AiInsights kpis={kpis} role={role} />
                <Clock />
                <WeatherForecast />
            </div>
          </TabsContent>

          <TabsContent value="kpis">
             <KpiTable />
          </TabsContent>

          <TabsContent value="trends">
             <div className="grid grid-cols-1 gap-4">
               <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-glow">KPI Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <KpiPerformanceChart kpis={allKpis} />
                </CardContent>
              </Card>
             </div>
          </TabsContent>

          <TabsContent value="map">
            <LocationMap />
          </TabsContent>

          <TabsContent value="files">
            <FileManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
