"use client";

import { useSimulationStore } from "./useSimulationStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Activity, Target, Leaf, CheckCircle2, RotateCcw } from "lucide-react";

export function SimulationStatsModal() {
  const stats = useSimulationStore((state) => state.stats);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  if (!stats) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card w-full max-w-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-border/50 text-center bg-muted/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">Simulation Complete</h2>
            <p className="text-muted-foreground mt-1">NagarNetra AI successfully stabilized the city.</p>
          </div>

          <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10 bg-background/50">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Activity className="w-3 h-3"/> City Health</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-muted-foreground line-through opacity-70">{stats.initialHealth}</span>
                <span className="text-3xl font-mono font-bold text-green-500">{stats.finalHealth}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Time Saved</span>
              <span className="text-3xl font-mono font-bold text-primary">{stats.timeSavedMinutes}m</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Target className="w-3 h-3"/> Congestion Reduced</span>
              <span className="text-3xl font-mono font-bold text-green-500">{stats.congestionReductionPercentage}%</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3"/> AI Accuracy</span>
              <span className="text-3xl font-mono font-bold text-primary">{stats.aiAccuracyPercentage}%</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Leaf className="w-3 h-3 text-green-500"/> Emissions Saved</span>
              <span className="text-3xl font-mono font-bold text-green-500">{stats.carbonReductionKg}kg</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Activity className="w-3 h-3"/> Operator Decisions</span>
              <span className="text-3xl font-mono font-bold text-muted-foreground">{stats.operatorDecisions}</span>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t border-border/50 flex justify-end">
            <Button size="lg" onClick={resetSimulation} className="gap-2">
              <RotateCcw className="w-4 h-4" /> End Simulation
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
