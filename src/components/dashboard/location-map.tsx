
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
    
    const coordinatesString = unit.address && unit.coordinates.lat !== 0 ? `${unit.coordinates.lat.toFixed(4)}, ${unit.coordinates.lng.toFixed(4)}` : 'N/A';

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

                <div className="space-y-3 text-sm text-gray-300 mb-4 min-h-[70px]">
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

                <Button className="w-full glow-button" onClick={() => onViewMap(unit)} disabled={!unit.address || unit.coordinates.lat === 0}>
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
    const [mapUrl, setMapUrl] = useState('');
    
    useEffect(() => {
        const storedUnits = localStorage.getItem('gis-business-units');
        if (storedUnits) {
            setBusinessUnits(JSON.parse(storedUnits));
        } else {
            const clearedUnits = initialBusinessUnits.map(u => ({...u, address: '', coordinates: {lat: 0, lng: 0}}));
            setBusinessUnits(clearedUnits);
            localStorage.setItem('gis-business-units', JSON.stringify(clearedUnits));
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
    };
    
    const handleViewMap = (unit: BusinessUnit) => {
        setSelectedUnit(unit);
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${unit.coordinates.lng - 0.01},${unit.coordinates.lat - 0.01},${unit.coordinates.lng + 0.01},${unit.coordinates.lat + 0.01}&layer=mapnik&marker=${unit.coordinates.lat},${unit.coordinates.lng}`);
    }
    
    const handleMapTypeChange = (type: 'osm' | 'satellite' | 'terrain') => {
        if (selectedUnit) {
            let newUrl = '';
            const { lat, lng } = selectedUnit.coordinates;
            switch(type) {
                case 'osm':
                    newUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
                    break;
                case 'satellite':
                    // Using a different provider that has satellite view embeddable via query params
                     newUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lng}&zoom=15&maptype=satellite`;
                     // Note: Google Maps embed requires an API key. For this demo, we'll use a placeholder URL that might not work.
                     // A better approach for a real app is a library like Leaflet with different tile layers.
                     // Since I cannot add libraries, I will show a message about the API key.
                     toast({ variant: 'destructive', title: "API Key Needed", description: "Displaying live Google Satellite view requires an API key." });
                     newUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=cyclosm&marker=${lat},${lng}`;
                    break;
                case 'terrain':
                     newUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=cyclemap&marker=${lat},${lng}`;
                    break;
            }
            setMapUrl(newUrl);
        }
    }


    return (
    <div className="space-y-8">
        <div className="flex items-center space-x-3">
             <Globe className="w-8 h-8 text-yellow-400 animate-spin"/>
             <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
                Location Management
            </h2>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Button onClick={() => handleMapTypeChange('satellite')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">Satellite</Button>
                    <Button onClick={() => handleMapTypeChange('terrain')} className="bg-green-500 hover:bg-green-600 text-white font-semibold">Terrain</Button>
                    <Button onClick={() => handleMapTypeChange('osm')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">OSM</Button>
                </div>

                <div className="w-full h-[400px] bg-gray-800 rounded-lg overflow-hidden mt-4">
                     <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={mapUrl}
                        style={{ border: 0 }}
                        allowFullScreen
                      ></iframe>
                </div>
                 <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white font-orbitron mb-2">Map for {selectedUnit.name}</h3>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Displaying map for address: <span className="text-white">{selectedUnit.address}</span>
                    </p>
                </div>
             </div>
        )}
    </div>
  )
}
