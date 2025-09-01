
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

const LocationCard = ({ unit, onEditAddress, onResetAddress, onViewOnMap }: { unit: BusinessUnit, onEditAddress: (unit: BusinessUnit, address: string) => void, onResetAddress: (unitId: string) => void, onViewOnMap: (unit: BusinessUnit) => void }) => {
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
    
    const coordinatesString = unit.address && unit.coordinates.lat !== 0 ? `${unit.coordinates.lat.toFixed(4)}, ${unit.coordinates.lng.toFixed(4)}` : 'N/A';

    return (
        <>
            <div className="location-card">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-bold font-orbitron text-xl">{unit.name}</h3>
                      <Button onClick={() => onResetAddress(unit.id)} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <RefreshCw className="w-4 h-4"/>
                    </Button>
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

                <div className="space-y-3 text-sm text-gray-300 mb-4 min-h-[70px]">
                    <div onClick={() => setAddressModalOpen(true)} className="glowing-blue-box cursor-pointer">
                        <p className="text-xs text-blue-300">Address</p>
                        <p className="font-semibold truncate text-white">
                          {unit.address || 'Click to set address'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Coordinates</p>
                        <p className="font-semibold font-mono">{coordinatesString}</p>
                    </div>
                </div>

                <Button className="w-full glow-button" onClick={() => onViewOnMap(unit)} disabled={!unit.address || unit.coordinates.lat === 0}>
                    <MapPin className="w-4 h-4 mr-2"/>
                    View on Map
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
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        const storedUnits = localStorage.getItem('gis-business-units');
        if (storedUnits) {
            const parsedUnits = JSON.parse(storedUnits);
            setBusinessUnits(parsedUnits);
            // Set a default selected unit
            setSelectedUnit(parsedUnits.find((u: BusinessUnit) => u.coordinates.lat !== 0) || parsedUnits[0]);
        } else {
            // On first load, clear addresses and set default coordinates to 0
            const clearedUnits = initialBusinessUnits.map(u => ({...u, address: '', coordinates: {lat: 0, lng: 0}}));
            setBusinessUnits(clearedUnits);
            localStorage.setItem('gis-business-units', JSON.stringify(clearedUnits));
            setSelectedUnit(clearedUnits[0]);
        }
    }, []);

    const handleEditAddress = (unit: BusinessUnit, address: string) => {
        // Simulate geocoding
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
        // If the updated unit is the one being viewed, refresh the map
        if(selectedUnit && selectedUnit.id === unit.id) {
            setSelectedUnit({ ...unit, address: address, coordinates: { lat: newLat, lng: newLng } });
        }
    };

    const handleResetAddress = (unitId: string) => {
        const updatedUnits = businessUnits.map(bu => 
            bu.id === unitId ? { ...bu, address: '', coordinates: { lat: 0, lng: 0 } } : bu
        );
        setBusinessUnits(updatedUnits);
        localStorage.setItem('gis-business-units', JSON.stringify(updatedUnits));
        toast({
            title: "Address Reset",
            description: `Address for the selected unit has been cleared.`,
        });
    };

    const handleViewOnMap = (unit: BusinessUnit) => {
        setSelectedUnit(unit);
    };

    const mapSrc = selectedUnit && selectedUnit.coordinates.lat !== 0
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${selectedUnit.coordinates.lat},${selectedUnit.coordinates.lng}`
    : `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=6.5244,3.3792&zoom=11`;
    
    return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3">
             <Globe className="w-8 h-8 text-yellow-400 animate-spin"/>
             <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
                Location Management
            </h2>
        </div>

        <div className="network-map-display h-[450px]">
            {googleMapsApiKey ? (
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={mapSrc}>
                </iframe>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Google Maps API Key is missing.
                </div>
            )}
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessUnits.map((unit) => (
                <LocationCard 
                    key={unit.id} 
                    unit={unit} 
                    onEditAddress={handleEditAddress}
                    onResetAddress={handleResetAddress}
                    onViewOnMap={handleViewOnMap}
                />
            ))}
        </div>
    </div>
  )
}
