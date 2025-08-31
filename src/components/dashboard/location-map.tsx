
"use client";

import { useState, useEffect }from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { businessUnits as initialBusinessUnits, kpis } from "@/lib/data";
import type { BusinessUnit, Kpi } from '@/lib/types';
import { MapPin, CheckCircle2, Loader, AlertTriangle, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Helper to associate KPIs with business units.
const getKpisForBusinessUnit = (buId: string, allKpis: Kpi[]): Kpi[] => {
    const buIndex = parseInt(buId.replace('bu', ''), 10);
    return allKpis.filter((_, index) => (index % initialBusinessUnits.length) + 1 === buIndex);
};

const LocationCard = ({ unit, onEditAddress, onViewMap }: { unit: BusinessUnit, onEditAddress: (unit: BusinessUnit, address: string) => void, onViewMap: (unit: BusinessUnit) => void }) => {
    const unitKpis = getKpisForBusinessUnit(unit.id, kpis);
    const completedKpis = unitKpis.filter(k => k.status === 'Completed').length;
    const inProgressKpis = unitKpis.filter(k => k.status === 'On Track').length;
    const atRiskKpis = unitKpis.filter(k => k.status === 'At Risk' || k.status === 'Off Track').length;
    
    const [address, setAddress] = useState(unit.address);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);

    const handleSaveAddress = () => {
        onEditAddress(unit, address);
        setAddressModalOpen(false);
    }
    
    const coordinatesString = unit.address ? `${unit.coordinates.lat.toFixed(4)}, ${unit.coordinates.lng.toFixed(4)}` : 'N/A';

    return (
        <>
            <div className="location-card">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-bold font-orbitron text-xl">{unit.name}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div className="bg-green-500/20 text-green-400 p-2 rounded-md">
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-1 animate-pulse"/>
                        <p className="font-bold text-lg">{completedKpis}</p>
                        <p>Completed</p>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-md">
                        <Loader className="w-6 h-6 mx-auto mb-1 animate-spin"/>
                        <p className="font-bold text-lg">{inProgressKpis}</p>
                        <p>In Progress</p>
                    </div>
                    <div className="bg-red-500/20 text-red-400 p-2 rounded-md">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-1 animate-pulse"/>
                        <p className="font-bold text-lg">{atRiskKpis}</p>
                        <p>At Risk</p>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300 mb-4">
                    <div>
                        <p className="text-xs text-gray-400">Address</p>
                        <p onClick={() => setAddressModalOpen(true)} className="font-semibold truncate cursor-pointer hover:text-yellow-400">
                          {unit.address || 'Click to set address'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Coordinates</p>
                        <p className="font-semibold font-mono">{coordinatesString}</p>
                    </div>
                </div>

                <Button className="w-full glow-button" onClick={() => onViewMap(unit)} disabled={!unit.address}>
                    <MapPin className="w-4 h-4 mr-2"/>
                    View on Google Map
                </Button>
            </div>
             <Dialog open={isAddressModalOpen} onOpenChange={setAddressModalOpen}>
                <DialogContent className="glow-modal">
                    <DialogHeader>
                        <DialogTitle>Update Address for {unit.name}</DialogTitle>
                        <DialogDescription>
                            Enter the address to generate coordinates.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="glow-input mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddressModalOpen(false)}>Cancel</Button>
                        <Button className="glow-button" onClick={handleSaveAddress}>Save Address</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};


export default function LocationMap() {
    const { toast } = useToast();
    const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(initialBusinessUnits);
    const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
    
    useEffect(() => {
        const storedUnits = localStorage.getItem('gis-business-units');
        if (storedUnits) {
            setBusinessUnits(JSON.parse(storedUnits));
        } else {
            const clearedUnits = initialBusinessUnits.map(u => ({...u, address: '', coordinates: {lat: 0, lng: 0}}));
            setBusinessUnits(clearedUnits);
        }
    }, []);

    const handleEditAddress = (unit: BusinessUnit, address: string) => {
        const newLat = 6.5 + Math.random() * 0.2;
        const newLng = 3.3 + Math.random() * 0.2;

        const updatedUnits = businessUnits.map(bu => 
            bu.id === unit.id ? { ...bu, address: address, coordinates: { lat: newLat, lng: newLng } } : bu
        );
        setBusinessUnits(updatedUnits);
        localStorage.setItem('gis-business-units', JSON.stringify(updatedUnits));
        toast({
            title: "Address Updated",
            description: `Coordinates for ${unit.name} have been generated.`,
        });
    };
    
    const handleViewMap = (unit: BusinessUnit) => {
        setSelectedUnit(unit);
    }

    return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3">
             <Globe className="w-8 h-8 text-yellow-400 animate-pulse-glow"/>
             <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
                Location Management
            </h2>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessUnits.map((unit) => (
                <LocationCard 
                    key={unit.id} 
                    unit={unit} 
                    onEditAddress={handleEditAddress}
                    onViewMap={handleViewMap}
                />
            ))}
        </div>
        
        {selectedUnit && (
             <div className="network-map-display p-6 flex flex-col items-center justify-center text-center relative">
                 <div className="absolute top-4 right-4 flex space-x-2">
                    <Button id="satellite-btn" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">Satellite</Button>
                    <Button id="terrain-btn" className="bg-green-500 hover:bg-green-600 text-white font-semibold">Terrain</Button>
                     <Button id="osm-btn" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">OSM</Button>
                    <Button id="refresh-btn" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"><RefreshCw className="w-4 h-4"/></Button>
                </div>

                <div className="mb-4">
                    <MapPin className="w-12 h-12 text-red-500 animate-bounce"/>
                </div>
                <h3 className="text-2xl font-bold text-white font-orbitron mb-2">Map for {selectedUnit.name}</h3>
                <p className="text-gray-400 max-w-lg mx-auto mb-6">
                    Displaying map for address: <span className="text-white">{selectedUnit.address}</span>
                </p>

                <div className="text-yellow-400 text-xs font-semibold animate-pulse-glow">
                    💡 Map interaction is simulated in this environment. <br/>
                    <span className="text-gray-500 font-normal">Controls for zoom and map type are for demonstration purposes.</span>
                </div>
             </div>
        )}
    </div>
  )
}
