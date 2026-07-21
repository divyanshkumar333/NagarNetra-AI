"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Navigation2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

const mockCameras = [
  { id: "CAM-01", location: "Downtown Hwy 1", status: "LIVE", interference: false },
  { id: "CAM-02", location: "Sector 4 Intersection", status: "LIVE", interference: true },
  { id: "CAM-03", location: "Residential Grid B", status: "LIVE", interference: false },
  { id: "CAM-04", location: "Industrial Park", status: "OFFLINE", interference: false },
  { id: "CAM-05", location: "City Center Plaza", status: "LIVE", interference: false },
  { id: "CAM-06", location: "Bridge Overpass", status: "LIVE", interference: false },
];

export default function TrafficPage() {
  const [noiseOffset, setNoiseOffset] = useState(0);

  // Animate the static noise pattern on cameras
  useEffect(() => {
    const interval = setInterval(() => {
      setNoiseOffset((prev) => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Navigation2 className="h-6 w-6" /> Traffic & Surveillance
          </h2>
          <p className="text-muted-foreground">Live feed monitoring and autonomous routing.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">AI Routing Active</Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/10">345 Nodes Online</Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockCameras.map((cam) => (
          <Card key={cam.id} className="glass-card overflow-hidden border-primary/20 relative group">
            <CardHeader className="p-3 bg-black/40 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-xs font-mono text-primary flex items-center gap-2">
                <Camera className="h-3 w-3" /> {cam.id} - {cam.location}
              </CardTitle>
              {cam.status === 'LIVE' ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-500">REC</span>
                </div>
              ) : (
                <Badge variant="destructive" className="text-[10px] h-4">OFFLINE</Badge>
              )}
            </CardHeader>
            <CardContent className="p-0 relative aspect-video bg-[#0f172a]">
              {cam.status === 'LIVE' ? (
                <>
                  {/* Fake CCTV view using CSS gradients and noise */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      backgroundPosition: `0 ${noiseOffset}px`
                    }}
                  />
                  
                  {/* Scanline effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

                  {/* Wireframe / bounding box mockups */}
                  {cam.interference && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-destructive w-16 h-16 bg-destructive/10 animate-pulse flex items-center justify-center">
                       <ShieldAlert className="h-6 w-6 text-destructive opacity-50" />
                    </div>
                  )}
                  {!cam.interference && (
                    <div className="absolute bottom-1/4 right-1/4 border border-green-500 w-8 h-8 bg-green-500/10" />
                  )}
                  
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/50">
                    2026-07-21 19:42:{Math.floor(noiseOffset / 1.6).toString().padStart(2, '0')}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-sm">
                  NO SIGNAL
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
