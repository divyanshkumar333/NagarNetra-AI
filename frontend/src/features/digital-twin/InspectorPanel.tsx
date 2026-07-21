"use client";

import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, X, Activity, Cpu, AlertCircle, Car, Gauge, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activeVehicles } from "./TrafficSystem";

function pseudoRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

export function InspectorPanel() {
  const { selectedEntity, setSelectedEntity } = useDigitalTwinStore();

  // If a vehicle is selected, try to get its real-time speed and status from the running simulation
  let liveSpeed = 0;
  let liveStatus = "Nominal";
  let vType = "Sedan";

  if (selectedEntity && selectedEntity.type === "vehicle") {
    const vId = selectedEntity.vehicleId;
    const v = activeVehicles.find((vehicle) => vehicle.id === vId);
    if (v) {
      liveSpeed = v.currentSpeed * 12000; // convert to km/h
      vType = v.type.toUpperCase();
      
      if (v.currentSpeed < 0.0002) {
        liveStatus = v.isEmergency ? "Responding / Obstruction Ahead" : "Stopped / Red Signal";
      } else if (v.transverseOffset !== 0) {
        liveStatus = "Changing Lanes";
      } else if (v.isEmergency) {
        liveStatus = "Emergency Dispatch / Priority lane";
      } else {
        liveStatus = "Cruising";
      }
    }
  }

  return (
    <AnimatePresence>
      {selectedEntity && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="absolute right-4 top-4 w-80 max-h-[calc(100vh-8rem)] glass-premium border border-border/50 rounded-lg flex flex-col z-10 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-2">
              {selectedEntity.type === "vehicle" ? (
                <Car className="w-5 h-5 text-amber-500 animate-pulse" />
              ) : (
                <Building2 className="w-5 h-5 text-sky-400" />
              )}
              <h3 className="font-semibold tracking-tight">
                {selectedEntity.type === "vehicle" ? "Live Telemetry" : "Entity Inspector"}
              </h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedEntity(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {/* ID */}
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Entity ID</div>
              <div className="font-mono text-[11px] bg-slate-950/60 p-2 rounded border border-border/50 text-sky-300">
                {selectedEntity.id}
              </div>
            </div>

            {/* If it's a Vehicle */}
            {selectedEntity.type === "vehicle" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-3 rounded-md border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Gauge className="w-3 h-3 text-amber-500" /> Speed
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-400">{liveSpeed.toFixed(1)} km/h</div>
                  </div>
                  <div className="glass-card p-3 rounded-md border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> Vehicle Type
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-300">{vType}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current State</div>
                  <div className="font-mono text-xs bg-slate-950/60 p-3 rounded border border-border/50 text-slate-200">
                    {liveStatus}
                  </div>
                </div>

                {selectedEntity.isEmergency && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" /> Emergency Status
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-md">
                      ACTIVE SIRENS. Right-of-way priority routing active. Steering assists enabled.
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* If it's a Building / Structure */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-3 rounded-md border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Activity className="w-3 h-3 text-sky-400" /> Occupancy
                    </div>
                    <div className="text-xl font-bold font-mono text-sky-300">
                      {(pseudoRandom(selectedEntity.id) * 35 + 45).toFixed(1)}%
                    </div>
                  </div>
                  <div className="glass-card p-3 rounded-md border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Cpu className="w-3 h-3 text-emerald-400" /> Power Usage
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-300">
                      {(pseudoRandom(selectedEntity.id + "power") * 150 + 60).toFixed(0)} kW
                    </div>
                  </div>
                </div>

                {selectedEntity.poiType && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">POI Classification</div>
                    <div className="font-mono text-xs bg-sky-950/30 p-3 rounded border border-sky-500/20 text-sky-200 font-semibold">
                      {typeof selectedEntity.poiType === "string" ? selectedEntity.poiType.toUpperCase() : ""} CAMPUS
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">District Type</div>
                  <div className="font-mono text-xs bg-slate-950/60 p-2 rounded border border-border/50 text-slate-300 capitalize">
                    {selectedEntity.type || "Commercial"} Area
                  </div>
                </div>

                {selectedEntity.hasHelipad && (
                  <div>
                    <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs p-3 rounded-md">
                      Rooftop Helipad: Operational / Safe
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mt-4 border-t border-border/30 pt-3">
                SYSTEM NOMINAL • NAGARNETRA AI v1.2
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
