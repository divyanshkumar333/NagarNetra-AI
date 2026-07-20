"use client";

import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, X, Activity, Cpu, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <AnimatePresence>
      {selectedEntity && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="absolute right-4 top-4 bottom-4 w-80 glass-panel border border-border/50 rounded-lg flex flex-col z-10 overflow-hidden shadow-2xl"
        >
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Entity Inspector</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedEntity(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID</div>
              <div className="font-mono text-sm bg-muted/30 p-2 rounded border border-border/50">{selectedEntity.id}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-md border border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3 text-primary" /> Utilization
                </div>
                <div className="text-xl font-bold font-mono">{(pseudoRandom(selectedEntity.id) * 40 + 40).toFixed(1)}%</div>
              </div>
              <div className="glass-card p-3 rounded-md border border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Cpu className="w-3 h-3 text-blue-400" /> Power Draw
                </div>
                <div className="text-xl font-bold font-mono">{(pseudoRandom(selectedEntity.id + "power") * 200 + 50).toFixed(0)}kW</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Active Alerts
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-sm p-3 rounded-md">
                None active. Systems operating within nominal parameters.
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> AI Recommendations
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                  <span className="text-primary font-medium">Energy:</span> Recommend dimming exterior lights by 15% between 02:00 and 05:00.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
