

"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Role, Kpi, KpiStatus, KpiCategory } from '@/lib/types';
import { kpis as allKpis, roles } from '@/lib/data';
import {
  Activity,
  BarChart,
  File as FileIcon,
  Map,
  LayoutGrid,
  Users,
  TrendingUp,
  ListChecks,
  CalendarDays,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from './header';
import KpiSummaryCards from './kpi-summary-cards';
import KpiPerformanceChart from './kpi-performance-chart';
import KpiStatusChart from './kpi-status-chart';
import AiInsights from './ai-insights';
import KpiTable from './kpi-table';
import LocationMap from './location-map';
import FileManager from './file-manager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WeatherIntelligence from './weather-intelligence';


const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'roleView', label: 'Role-Based View', icon: Users },
    { id: 'trends', label: 'Trends & Comparison', icon: TrendingUp },
    { id: 'tracking', label: 'KPIs Status & Tracking', icon: ListChecks },
    { id: 'map', label: 'Location Map', icon: Map },
    { id: 'upload', label: 'Data Upload', icon: FileIcon },
];

const PARAMETER_CATEGORIES: KpiCategory[] = ['Business Growth', 'People Development', 'Operational Process', 'Customer'];

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<Kpi[]>(() => allKpis.map(kpi => ({ ...kpi, progress: 0, status: 'Not Started' })));
  const [activeTab, setActiveTab] = useState('overview');
  
  const [selectedRole, setSelectedRole] = useState<Role | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<KpiStatus | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory | 'All'>('All');


  const { toast } = useToast();

  useEffect(() => {
    const initCharts = () => {
      // Ensure Chart is available before initializing
      if (typeof window.Chart === 'undefined') {
        setTimeout(initCharts, 100);
        return;
      }

      if (typeof window.initializeCharts !== 'function' || typeof window.initializeComparisonChart !== 'function') {
        setTimeout(initCharts, 100); // Retry after a short delay
        return;
      }
      
      if (activeTab === 'overview') {
        window.initializeCharts();
      }
      if (activeTab === 'trends') {
          setTimeout(window.initializeComparisonChart, 0);
      }
    };
    initCharts();
  }, [activeTab]);

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
      (selectedStatus === 'All' || kpi.status === selectedStatus) &&
      (selectedCategory === 'All' || kpi.category === selectedCategory)
    );
  }, [kpiData, selectedRole, selectedStatus, selectedCategory]);
  
  const safeToggleChartType = (chartName: 'category' | 'trend') => {
    if (typeof window.toggleChartType === 'function') {
      window.toggleChartType(chartName);
    } else {
      console.warn('toggleChartType function not available');
    }
  }

  const safeChangeTrendView = (view: 'daily' | 'monthly' | 'quarterly') => {
    if (typeof window.changeTrendView === 'function') {
        window.changeTrendView(view);
    } else {
        console.warn('changeTrendView function not available');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
        <div className="scrolling-text-container overflow-hidden relative">
            <div className="animate-scroll whitespace-nowrap">
            <span className="inline-block px-6 py-3 scrolling-text-content">
                This GIS KPI Dashboard was designed by Collins Anyanwu - A Guru in GIS, Data Engineering/Analytics and Data Science 🚀 Expert in Geospatial Technologies, Advanced Analytics, and Business Intelligence Solutions.
            </span>
            <span className="inline-block px-6 py-3 scrolling-text-content">
                This GIS KPI Dashboard was designed by Collins Anyanwu - A Guru in GIS, Data Engineering/Analytics and Data Science 🚀 Expert in Geospatial Technologies, Advanced Analytics, and Business Intelligence Solutions.
            </span>
            </div>
      </div>
      <Header />
       <div className="scrolling-text-container-slow">
            <div className="animate-scroll-slow">
                <span className="scrolling-text-content-green">
                    Powered by the GIS Team
                </span>
            </div>
        </div>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
      <div className="filter-section mb-6">
            <h3 className="text-xl font-bold text-white font-orbitron glow-text-yellow mb-4">🎛️ Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="text-yellow-400 text-sm mb-2 block font-rajdhani font-semibold">
                        Role in GIS
                    </label>
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role | 'All')}>
                        <SelectTrigger className="glow-input w-full text-sm">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-yellow-400 text-sm mb-2 block font-rajdhani font-semibold">
                        Parameter Category
                    </label>
                     <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as KpiCategory | 'All')}>
                        <SelectTrigger className="glow-input w-full text-sm">
                           <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Categories</SelectItem>
                           {PARAMETER_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-yellow-400 text-sm mb-2 block font-rajdhani font-semibold">
                       Status
                    </label>
                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as KpiStatus | 'All')}>
                        <SelectTrigger className="glow-input w-full text-sm">
                           <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Statuses</SelectItem>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="On Track">On Track</SelectItem>
                          <SelectItem value="At Risk">At Risk</SelectItem>
                          <SelectItem value="Off Track">Off Track</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <div className="bg-gray-800 rounded-t-lg p-1 flex flex-wrap gap-1">
           {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-all ${activeTab === tab.id ? 'tab-active' : ''}`}
               >
                  <tab.icon className="mr-2 h-4 w-4 inline-block" />{tab.label}
               </button>
           ))}
        </div>

        <div className="bg-gray-800 rounded-b-lg p-6 min-h-[600px]">
            {activeTab === 'overview' && (
                 <div className="space-y-8">
                     <h2 className="text-3xl font-bold text-white mb-8 text-center font-orbitron animate-neon-glow">
                        🚀 GIS KPI Command Center 🚀
                    </h2>
                     <div className="my-8">
                        <WeatherIntelligence />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <KpiSummaryCards kpis={filteredKpis} />
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glow-container p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg font-orbitron">📊 KPI Performance by Category</h3>
                                <button onClick={() => safeToggleChartType('category')} className="text-yellow-400 hover:text-yellow-300">
                                    <i className="fas fa-sync-alt"></i>
                                </button>
                            </div>
                            <div className="chart-container">
                                <canvas id="categoryChart"></canvas>
                            </div>
                        </div>

                        <div className="glow-container p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg font-orbitron">📈 Progress Trend</h3>
                                <div className="flex space-x-2">
                                    <button onClick={() => safeChangeTrendView('daily')} className="text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-110">
                                        <CalendarDays className="h-5 w-5 animate-pulse-glow" />
                                    </button>
                                    <button onClick={() => safeChangeTrendView('monthly')} className="text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-110">
                                        <Calendar className="h-5 w-5 animate-pulse-glow" />
                                    </button>
                                    <button onClick={() => safeChangeTrendView('quarterly')} className="text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-110">
                                        <BarChart3 className="h-5 w-5 animate-pulse-glow" />
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                <canvas id="trendChart"></canvas>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="glow-container p-6">
                            <h3 className="text-white font-bold text-lg font-orbitron mb-4">⚡ Performance Gauge</h3>
                            <div className="chart-container">
                                <canvas id="performanceGauge"></canvas>
                            </div>
                            <div className="text-center mt-4">
                                <div className="text-3xl font-bold text-yellow-400 font-orbitron">84%</div>
                                <div className="text-sm text-gray-400">Overall Performance</div>
                            </div>
                        </div>

                        <div className="glow-container p-6">
                            <h3 className="text-white font-bold text-lg font-orbitron mb-4">🎯 Role Distribution</h3>
                            <div className="chart-container">
                                <canvas id="roleDistributionChart"></canvas>
                            </div>
                        </div>

                        <div className="glow-container p-6">
                             <AiInsights kpis={filteredKpis} role={selectedRole} />
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'roleView' && (
                <div>
                     <h2 className="text-2xl font-bold text-white mb-6">Role-Based KPI View</h2>
                      <KpiTable
                        kpiData={kpiData}
                        onKpiUpdate={handleKpiUpdate}
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        filteredKpis={filteredKpis}
                     />
                </div>
            )}
            {activeTab === 'trends' && (
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Trends & Comparison</h2>
                    <div className="glow-container p-6">
                       <div className="chart-container" style={{height: '500px'}}>
                         <canvas id="comparisonChart"></canvas>
                       </div>
                    </div>
                </div>
            )}
            {activeTab === 'tracking' && (
                <KpiTable 
                    kpiData={kpiData}
                    onKpiUpdate={handleKpiUpdate}
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    filteredKpis={filteredKpis}
                />
            )}
            {activeTab === 'map' && <LocationMap />}
            {activeTab === 'upload' && <FileManager />}
        </div>

      </main>
    </div>
  );
}

    