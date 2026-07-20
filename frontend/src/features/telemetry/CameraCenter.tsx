"use client";

import { useTelemetryStore } from "./useTelemetryStore";
import { motion } from "framer-motion";
import { Camera, AlertCircle, Video } from "lucide-react";

export function CameraCenter() {
  const cameras = useTelemetryStore((state) => state.cameras);

  return (
    <div className="glass-card p-4 border border-border/50 rounded-xl flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Video className="w-4 h-4" /> Camera Network
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <div key={cam.id} className="bg-background/40 border border-border/50 rounded-lg overflow-hidden flex flex-col group relative">
            {/* Mock Live Stream Video */}
            <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {cam.status === "offline" ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs uppercase tracking-wider">NO SIGNAL</span>
                </div>
              ) : (
                <>
                  {/* Road backdrop */}
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,#1e293b_48%,#334155_50%,#1e293b_52%)] opacity-30" />
                  {/* Flowing mock traffic dots */}
                  {Array.from({ length: Math.max(1, Math.min(5, Math.floor(cam.vehicleCount / 10))) }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-1.5 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      style={{ top: `${45 + i * 5}%` }}
                      animate={{ x: ["-100vw", "100vw"] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 + Math.random() * 2, 
                        delay: i * 0.5,
                        ease: "linear" 
                      }}
                    />
                  ))}
                  {Array.from({ length: Math.max(1, Math.min(5, Math.floor(cam.vehicleCount / 10))) }).map((_, i) => (
                    <motion.div
                      key={`blue-${i}`}
                      className="absolute w-2 h-1.5 bg-white rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      style={{ top: `${55 + i * 5}%` }}
                      animate={{ x: ["100vw", "-100vw"] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 + Math.random() * 2, 
                        delay: i * 0.7,
                        ease: "linear" 
                      }}
                    />
                  ))}
                  
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white drop-shadow-md">LIVE</span>
                  </div>
                </>
              )}
            </div>

            {/* Metadata */}
            <div className="p-3 text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold truncate">{cam.location}</span>
                <span className={`font-mono ${cam.status === 'online' ? 'text-green-500' : cam.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {cam.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between text-muted-foreground">
                <span className="font-mono">{cam.id}</span>
                <span className="flex items-center gap-1"><CarIcon className="w-3 h-3"/> {cam.vehicleCount}/min</span>
              </div>
              
              {cam.aiDetectedIncidents.length > 0 && (
                <div className="mt-1 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3"/> {cam.aiDetectedIncidents.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}
