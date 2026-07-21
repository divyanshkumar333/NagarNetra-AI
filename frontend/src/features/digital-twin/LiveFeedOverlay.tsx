"use client";

import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { useEffect, useState } from "react";
import { Eye, ShieldAlert, Wifi } from "lucide-react";

export function LiveFeedOverlay() {
  const { activeIncident, incidentLocation, cameraMode } = useDigitalTwinStore();
  const [telemetry, setTelemetry] = useState({
    lat: 28.6139,
    lng: 77.2090,
    speed: 72,
    heading: 145
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0002,
        lng: prev.lng + (Math.random() - 0.5) * 0.0002,
        speed: activeIncident ? 0 : Math.floor(65 + Math.random() * 10),
        heading: (prev.heading + Math.floor((Math.random() - 0.5) * 4)) % 360
      }));
    }, 400);
    return () => clearInterval(timer);
  }, [activeIncident]);

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-96 glass-premium border border-border/50 rounded-lg overflow-hidden flex flex-col shadow-2xl transition-all duration-300 hover:border-primary/50">
      {/* Header */}
      <div className="bg-background/90 px-3 py-2 border-b border-border/50 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-primary tracking-wide">
          <Eye className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>POLICE AIR PATROL FEED</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
          <Wifi className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Screen area with CRT Scanlines */}
      <div className="relative h-40 bg-zinc-950 flex flex-col justify-between p-3 font-mono text-[10px] text-green-400 overflow-hidden">
        {/* CRT Scanline scan animation */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10" />
        <div className="absolute inset-0 pointer-events-none animate-scanline bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-20 z-10" />

        {/* Telemetry rows */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col gap-0.5">
            <div>SYS: NN_AIR_COP_1</div>
            <div>ALT: {activeIncident ? "110m (HOVER)" : "120m (CRUISE)"}</div>
            <div>SPD: {telemetry.speed} km/h</div>
            <div>HDG: {telemetry.heading}° SE</div>
          </div>
          <div className="text-right flex flex-col gap-0.5">
            <div>GPS: DEL_SEC_09</div>
            <div>LAT: {telemetry.lat.toFixed(6)} N</div>
            <div>LNG: {telemetry.lng.toFixed(6)} E</div>
            <div>FPS: 60.0</div>
          </div>
        </div>

        {/* Camera Reticle / Incident Target Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-16 h-16 border border-green-400 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute w-20 h-[1px] bg-green-400" />
            <div className="absolute h-20 w-[1px] bg-green-400" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center z-10 mt-auto pt-2 border-t border-green-400/20">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            <span className="uppercase text-[9px] font-bold">
              {activeIncident ? "RESOLVING INCIDENT" : "SEARCH PATROL"}
            </span>
          </div>
          <div>
            {activeIncident && incidentLocation ? (
              <span className="text-red-400 font-bold flex items-center gap-1 text-[9px]">
                <ShieldAlert className="w-3 h-3 text-red-400 animate-bounce" />
                LOCKED: [{incidentLocation[0].toFixed(0)}, {incidentLocation[2].toFixed(0)}]
              </span>
            ) : (
              <span>GRID STABLE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
