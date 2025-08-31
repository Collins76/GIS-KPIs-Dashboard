"use client";

import { useState, useMemo } from 'react';
import type { Role, Kpi, KpiStatus } from '@/lib/types';
import { kpis as allKpis, roles } from '@/lib/data';
import {
  Activity,
  BarChart,
  File,
  Map,
  LayoutGrid,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KpiSummaryCards from '@/components/dashboard/kpi-summary-cards';
import KpiStatusChart from '@/components/dashboard/kpi-status-chart';
import KpiPerformanceChart from '@/components/dashboard/kpi-performance-chart';
import AiInsights from '@/components/dashboard/ai-insights';
import KpiTable from '@/components/dashboard/kpi-table';
import LocationMap from '@/components/dashboard/location-map';
import FileManager from '@/components/dashboard/file-manager';
import Clock from '@/components/dashboard/clock';
import WeatherForecast from '@/components/dashboard/weather-forecast';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<Kpi[]>(() => allKpis.map(kpi => ({...kpi, progress: 0, status: 'Not Started'})));
  const [selectedRole, setSelectedRole] = useState<Role | 'All'>('GIS Coordinator');
  const [selectedStatus, setSelectedStatus] = useState<KpiStatus | 'All'>('All');
  const { toast } = useToast();

  const handleKpiUpdate = (updatedKpi: Kpi) => {
    const newData = kpiData.map(kpi => (kpi.id === updatedKpi.id ? updatedKpi : kpi));
    setKpiData(newData);
     toast({
      title: "KPI Updated",
      description: `Progress for "${updatedKpi.title}" is now ${updatedKpi.progress}%.`,
    });
  };

  const filteredKpis = useMemo(() => {
    return kpiData.filter(kpi => 
      (selectedRole === 'All' || kpi.role === selectedRole) &&
      (selectedStatus === 'All' || kpi.status === selectedStatus)
    );
  }, [kpiData, selectedRole, selectedStatus]);
  
  const roleKpis = useMemo(() => {
     return kpiData.filter((kpi) => selectedRole === 'All' || kpi.role === selectedRole);
  }, [kpiData, selectedRole]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
               <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role | 'All')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>
        </div>
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
              <KpiSummaryCards kpis={roleKpis} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4 card-glow">
                <CardHeader>
                  <CardTitle className="text-glow">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <KpiPerformanceChart kpis={roleKpis} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3 card-glow">
                <CardHeader>
                  <CardTitle className="text-glow">KPI Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <KpiStatusChart kpis={roleKpis} />
                </CardContent>
              </Card>
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AiInsights kpis={roleKpis} role={selectedRole} />
                <Clock />
                <WeatherForecast />
            </div>
          </TabsContent>

          <TabsContent value="kpis">
             <KpiTable 
                kpiData={kpiData}
                onKpiUpdate={handleKpiUpdate}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                filteredKpis={filteredKpis}
             />
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
