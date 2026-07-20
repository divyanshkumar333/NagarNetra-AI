"use client";

import { useSimulationStore } from "./useSimulationStore";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Brain, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export function SimulationTimeline() {
  const timeline = useSimulationStore((state) => state.timeline);

  const getIcon = (category: string) => {
    switch (category) {
      case "observation": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "ai": return <Brain className="w-4 h-4 text-primary" />;
      case "action": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "outcome": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-card border border-border/50 rounded-xl p-4 flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Activity className="w-4 h-4" /> Live Timeline
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {timeline.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <Activity className="w-8 h-8 mb-2" />
            <p className="text-sm">Awaiting scenario...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {timeline.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-6 pb-4 border-l border-border/50 last:pb-0"
                >
                  <div className="absolute left-[-11px] top-0 bg-background rounded-full p-0.5 border border-border/50">
                    {getIcon(event.category)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{event.title}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Pulsing indicator for active simulation */}
            <motion.div 
              className="relative pl-6 pt-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="absolute left-[-5px] top-3 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
              <span className="text-xs text-primary font-mono ml-2">Monitoring...</span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
