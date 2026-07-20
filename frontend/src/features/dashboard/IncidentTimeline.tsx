"use client";

import { motion } from "framer-motion";
import { Incident } from "./useDashboardData";
import { AlertTriangle, Car, CloudLightning, ShieldAlert, Wrench, Siren } from "lucide-react";

export function IncidentTimeline({ data }: { data: Incident[] }) {
  const getIcon = (type: string, severity: string) => {
    const className = `w-4 h-4 ${severity === 'critical' ? 'text-destructive' : severity === 'warning' ? 'text-amber-500' : 'text-blue-400'}`;
    switch (type) {
      case 'accident': return <AlertTriangle className={className} />;
      case 'congestion': return <Car className={className} />;
      case 'weather': return <CloudLightning className={className} />;
      case 'emergency': return <Siren className={className} />;
      case 'maintenance': return <Wrench className={className} />;
      default: return <ShieldAlert className={className} />;
    }
  };

  return (
    <div className="glass-card rounded-lg flex flex-col h-[400px] border border-border/50">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold tracking-tight">Active Incident Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Timeline vertical line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-px bg-border/50 z-0" />
        
        <div className="space-y-6 relative z-10">
          {data.map((incident, i) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 group"
            >
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background ${
                  incident.severity === 'critical' ? 'border-destructive/50' : 
                  incident.severity === 'warning' ? 'border-amber-500/50' : 'border-blue-400/50'
                }`}>
                  {getIcon(incident.type, incident.severity)}
                </div>
              </div>
              
              <div className="flex-1 bg-background/40 border border-border/30 p-3 rounded-md group-hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-foreground">{incident.description}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{incident.time}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="uppercase tracking-wider font-mono text-[10px] bg-muted/50 px-1 py-0.5 rounded">{incident.type}</span>
                  • {incident.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
