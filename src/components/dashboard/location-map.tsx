"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { businessUnits } from "@/lib/data"
import { MapPin, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LocationMap() {
  const { toast } = useToast()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: text,
      })
    })
  }

  return (
    <Card className="card-glow w-full">
      <CardHeader>
        <CardTitle className="text-glow">Business Unit Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg overflow-hidden relative aspect-video">
             <Image
                src="https://picsum.photos/seed/lagosmap/1200/800"
                alt="Map of Lagos"
                data-ai-hint="map lagos"
                fill
                className="object-cover"
              />
          </div>
          <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2">
            {businessUnits.map((bu) => (
              <Card key={bu.id}>
                <CardHeader className="p-4">
                   <CardTitle className="text-base flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {bu.name}
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <p>{bu.address}</p>
                  <p className="font-mono text-xs mt-2">{bu.coordinates.lat}, {bu.coordinates.lng}</p>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleCopy(`${bu.coordinates.lat}, ${bu.coordinates.lng}`)}
                    >
                     <Copy className="h-3 w-3 mr-2" />
                     Copy Coordinates
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
