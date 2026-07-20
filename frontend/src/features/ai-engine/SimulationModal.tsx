"use client";

import { useAIEngineStore } from "./useAIEngineStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Activity, Clock } from "lucide-react";

export function SimulationModal() {
  const activeSimulation = useAIEngineStore((state) => state.activeSimulation);
  const clearSimulation = useAIEngineStore((state) => state.clearSimulation);
  const approveRecommendation = useAIEngineStore((state) => state.approveRecommendation);
  const isProcessing = useAIEngineStore((state) => state.isProcessing);

  if (!activeSimulation) return null;

  const { currentStateMetrics, predictedStateMetrics, expectedImprovementPercentage, recommendationId } = activeSimulation;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card w-full max-w-2xl border border-border/50 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              AI Simulation Results
            </h2>
            <Button variant="ghost" size="icon" onClick={clearSimulation} disabled={isProcessing}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-8">
            {/* Comparison */}
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Current */}
              <div className="glass-panel p-4 rounded-lg border border-border/50 text-center">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Current State</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground"><Activity className="w-3 h-3"/> Congestion</div>
                    <div className="text-2xl font-mono font-bold text-destructive">{currentStateMetrics.congestion}</div>
                  </div>
                  <div>
                    <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3 h-3"/> Avg Delay</div>
                    <div className="text-xl font-mono font-bold">{currentStateMetrics.travelTime}m</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ArrowRight className="w-8 h-8 mb-2" />
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">Simulating...</span>
              </div>

              {/* Predicted */}
              <div className="glass-panel p-4 rounded-lg border border-primary/30 text-center bg-primary/5">
                <h4 className="text-xs uppercase tracking-wider text-primary font-semibold mb-4">Predicted State</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-center items-center gap-1 text-sm text-primary"><Activity className="w-3 h-3"/> Congestion</div>
                    <div className="text-2xl font-mono font-bold text-green-500">{predictedStateMetrics.congestion}</div>
                  </div>
                  <div>
                    <div className="flex justify-center items-center gap-1 text-sm text-primary"><Clock className="w-3 h-3"/> Avg Delay</div>
                    <div className="text-xl font-mono font-bold text-green-500">{predictedStateMetrics.travelTime}m</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Impact */}
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <div>
                <h4 className="text-green-500 font-semibold mb-1">Expected Improvement</h4>
                <p className="text-sm text-green-500/80">Executing this recommendation will stabilize the grid.</p>
              </div>
              <div className="text-3xl font-bold font-mono text-green-500">+{expectedImprovementPercentage}%</div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={clearSimulation} disabled={isProcessing}>Cancel</Button>
              <Button onClick={() => approveRecommendation(recommendationId)} disabled={isProcessing}>
                {isProcessing ? "Executing..." : "Approve & Execute"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
