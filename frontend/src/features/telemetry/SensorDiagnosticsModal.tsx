"use client";
import React from "react";
import { useTelemetryStore } from "./useTelemetryStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Battery, Wifi, Brain, Wrench, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SensorDiagnosticsModal() {
  const selectedSensor = useTelemetryStore((state) => state.selectedSensor);
  const setSelectedSensor = useTelemetryStore((state) => state.setSelectedSensor);

  if (!selectedSensor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500 bg-green-500/10 border-green-500/50";
      case "warning": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/50";
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/50";
      default: return "text-muted-foreground bg-muted/10 border-border/50";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={() => setSelectedSensor(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-lg border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/20">
            <div>
              <h3 className="font-semibold">{selectedSensor.location} Sensor</h3>
              <p className="text-xs text-muted-foreground font-mono">{selectedSensor.id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedSensor(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Overall Status</span>
              <Badge variant="outline" className={`uppercase ${getStatusColor(selectedSensor.status)}`}>
                {selectedSensor.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DiagnosticMetric icon={<Battery />} label="Battery Level" value={`${selectedSensor.battery}%`} />
              <DiagnosticMetric icon={<Wifi />} label="Signal Quality" value={`${selectedSensor.signalQuality}%`} />
              <DiagnosticMetric icon={<Clock />} label="Last Maintenance" value={selectedSensor.lastMaintenance} />
              <DiagnosticMetric icon={<Brain />} label="AI Confidence" value={`${Math.max(0, selectedSensor.signalQuality - 5)}%`} />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-3 items-start text-sm">
              <Wrench className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Diagnostics Recommendation</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {selectedSensor.status === 'online' ? 'Sensor operating within normal parameters. No action required.' : 'Sensor requires maintenance dispatch. AI predictions relying on this node may have reduced confidence.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DiagnosticMetric({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-background/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
      <div className="p-2 bg-muted rounded-md text-muted-foreground">
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <div>
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="font-mono font-semibold">{value}</p>
      </div>
    </div>
  );
}
