"use client";

import { useTelemetryStore } from "./useTelemetryStore";
import { Server, Activity, Zap, Construction, ShieldAlert } from "lucide-react";

export function InfrastructurePanel() {
  const infra = useTelemetryStore((state) => state.infrastructure);

  const getIcon = (subType: string) => {
    switch (subType) {
      case "power": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "bridge": return <Construction className="w-4 h-4 text-orange-500" />;
      case "traffic_light": return <Server className="w-4 h-4 text-green-500" />;
      case "comms": return <ShieldAlert className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-card p-4 border border-border/50 rounded-xl flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Server className="w-4 h-4" /> Infrastructure Nodes
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {infra.map((node) => (
          <div key={node.id} className="bg-background/40 p-3 rounded-lg border border-border/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background/80 rounded-lg border border-border/50">
                {getIcon(node.subType)}
              </div>
              <div>
                <h4 className="text-sm font-semibold">{node.location}</h4>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">{node.subType} • {node.id}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-mono font-bold uppercase ${
                node.status === 'online' ? 'text-green-500' :
                node.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {node.status}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <span>Load: {node.load}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
