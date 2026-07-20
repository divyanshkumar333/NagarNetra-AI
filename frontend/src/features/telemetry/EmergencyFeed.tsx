"use client";

import { useTelemetryStore } from "./useTelemetryStore";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, AlertTriangle, Flame, Stethoscope, Waves, ShieldAlert, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EmergencyFeed() {
  const emergencies = useTelemetryStore((state) => state.emergencies);
  const updateData = useTelemetryStore((state) => state.updateData);

  const getIcon = (type: string) => {
    switch (type) {
      case "Accident": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "Fire": return <Flame className="w-4 h-4 text-red-500" />;
      case "Medical": return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case "Flood Warning": return <Waves className="w-4 h-4 text-cyan-500" />;
      case "Police Dispatch": return <ShieldAlert className="w-4 h-4 text-purple-500" />;
      default: return <Radio className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Critical": return "bg-red-500/20 text-red-500 border-red-500/50";
      case "High": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case "Medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      default: return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    }
  };

  const handleAck = (id: string) => {
    const updated = emergencies.map(e => e.id === id ? { ...e, status: "acknowledged" as const } : e);
    updateData({ emergencies: updated });
  };

  return (
    <div className="glass-card p-4 border border-border/50 rounded-xl flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Radio className="w-4 h-4" /> Emergency Dispatch
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        <AnimatePresence>
          {emergencies.map((emg) => (
            <motion.div
              key={emg.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg border ${emg.status === 'new' ? 'border-red-500/50 bg-red-500/5' : 'border-border/50 bg-background/50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(emg.type)}
                  <span className="font-semibold text-sm">{emg.type}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase ${getPriorityColor(emg.priority)}`}>
                  {emg.priority}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {emg.description}
              </p>
              
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-muted-foreground">{emg.location} • {new Date(emg.timestamp).toLocaleTimeString()}</span>
                {emg.status === "new" ? (
                  <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => handleAck(emg.id)}>
                    <Check className="w-3 h-3" /> Ack
                  </Button>
                ) : (
                  <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> ACKNOWLEDGED</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {emergencies.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <Radio className="w-8 h-8 mb-2" />
            <p className="text-sm">No active emergencies</p>
          </div>
        )}
      </div>
    </div>
  );
}
