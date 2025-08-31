
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { businessUnits, kpis } from "@/lib/data";
import type { BusinessUnit, Kpi } from '@/lib/types';
import { MapPin, Copy, AlertTriangle, Globe, Building, Zap, Plus, Layers, LocateFixed, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

// Helper to associate KPIs with business units. In a real app, this link would exist in the data.
// For now, we'll distribute KPIs somewhat evenly for demonstration.
const getKpisForBusinessUnit = (buId: string, allKpis: Kpi[]): Kpi[] => {
    // This is a mock distribution.
    const buIndex = parseInt(buId.replace('bu', ''), 10);
    return allKpis.filter((_, index) => (index % businessUnits.length) + 1 === buIndex);
};

const LocationCard = ({ unit, kpis }: { unit: BusinessUnit, kpis: Kpi[] }) => {
    
    const totalKpis = kpis.length;
    const completedKpis = kpis.filter(k => k.status === 'Completed').length;
    const inProgressKpis = kpis.filter(k => k.status === 'On Track').length;
    const atRiskKpis = kpis.filter(k => k.status === 'At Risk' || k.status === 'Off Track').length;
    
    const performance = totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;

    const getPerformanceColor = (perf: number) => {
        if (perf >= 80) return 'text-green-400';
        if (perf >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const icons = [Building, Zap, Globe, Layers, LocateFixed, Zap, Globe];
    const CardIcon = icons[parseInt(unit.id.replace('bu',''))-1] || Building;

    return (
        <div className="location-card">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        <CardIcon className="w-6 h-6 text-yellow-400"/>
                    </div>
                    <div>
                        <h3 className="text-white font-bold font-orbitron text-lg">{unit.id.replace('bu','')}. {unit.name}</h3>
                        <p className="text-xs text-gray-400">{unit.address}</p>
                    </div>
                </div>
                <div className={cn("text-xl font-bold font-orbitron", getPerformanceColor(performance))}>
                    {performance}%
                    <p className="text-xs text-gray-400 font-sans font-normal text-right">Perf.</p>
                </div>
            </div>

            <div className="my-4">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>KPI Progress</span>
                    <span>{completedKpis}/{totalKpis}</span>
                </div>
                <Progress value={performance} indicatorClassName={cn(
                    performance >= 80 ? 'bg-green-500' : performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                )} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-green-500/20 text-green-400 p-2 rounded-md">
                    <p className="font-bold text-lg">{completedKpis}</p>
                    <p>Completed</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-md">
                    <p className="font-bold text-lg">{inProgressKpis}</p>
                    <p>In Progress</p>
                </div>
                <div className="bg-red-500/20 text-red-400 p-2 rounded-md">
                    <p className="font-bold text-lg">{atRiskKpis}</p>
                    <p>At Risk</p>
                </div>
            </div>
            
            <div className="text-yellow-500 text-xs font-semibold flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-2"/>
                Address Required
            </div>

            <Button className="w-full glow-button">
                <Plus className="w-4 h-4 mr-2"/>
                Add Address
            </Button>
        </div>
    );
};


export default function LocationMap() {
    const { toast } = useToast();
    const totalKpis = kpis.length;
    const avgPerformance = totalKpis > 0 ? Math.round(kpis.reduce((acc, kpi) => acc + kpi.progress, 0) / totalKpis) : 0;

    return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3">
             <Globe className="w-8 h-8 text-yellow-400 animate-pulse-glow"/>
             <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
                Interactive Location Management
            </h2>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessUnits.map((bu) => (
                <LocationCard key={bu.id} unit={bu} kpis={getKpisForBusinessUnit(bu.id, kpis)} />
            ))}
        </div>
        
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-yellow-400 animate-pulse-glow"/>
                <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
                    Interactive Network Map
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div className="bg-blue-600/80 p-4 rounded-lg text-center flex flex-col justify-center items-center glow-container">
                    <p className="text-4xl font-bold font-orbitron">{businessUnits.length}</p>
                    <p className="text-sm">Total Locations</p>
                </div>
                <div className="bg-green-600/80 p-4 rounded-lg text-center flex flex-col justify-center items-center glow-container">
                     <p className="text-4xl font-bold font-orbitron">{businessUnits.filter(bu => bu.address).length}</p>
                    <p className="text-sm">With Addresses</p>
                </div>
                 <div className="bg-yellow-600/80 p-4 rounded-lg text-center flex flex-col justify-center items-center glow-container">
                     <p className="text-4xl font-bold font-orbitron">{avgPerformance}%</p>
                    <p className="text-sm">Avg Performance</p>
                </div>
                <div className="bg-purple-600/80 p-4 rounded-lg text-center flex flex-col justify-center items-center glow-container">
                     <p className="text-4xl font-bold font-orbitron">{totalKpis}</p>
                    <p className="text-sm">Total KPIs</p>
                </div>
            </div>

             <div className="network-map-display p-6 flex flex-col items-center justify-center text-center relative">
                 <div className="absolute top-4 right-4 flex space-x-2">
                    <Button id="satellite-btn" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">Satellite</Button>
                    <Button id="terrain-btn" className="bg-green-500 hover:bg-green-600 text-white font-semibold">Terrain</Button>
                    <Button id="refresh-btn" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"><RefreshCw className="w-4 h-4"/></Button>
                </div>

                <div className="mb-4">
                    <Image src="https://i.imgur.com/gKeA2pE.png" alt="Ikeja Electric Logo" width={80} height={80} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-white font-orbitron mb-2">Lagos Network Coverage Map</h3>
                <p className="text-gray-400 max-w-lg mx-auto mb-6">
                    Interactive map showing all Ikeja Electric business units and their KPI performance across Lagos State.
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-300 mb-6">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>High Performance (80%+)</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Medium Performance (60-79%)</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Needs Attention (&lt;60%)</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Corporate Headquarters</div>
                </div>

                <div className="text-yellow-400 text-xs font-semibold animate-pulse-glow">
                    💡 Click on any location card above to view detailed maps <br/>
                    <span className="text-gray-500 font-normal">Real-time KPI data visualization • Coverage analysis • Performance monitoring</span>
                </div>
             </div>
        </div>
    </div>
  )
}
