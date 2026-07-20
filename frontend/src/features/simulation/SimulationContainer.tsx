"use client";

import { useSimulationStore, SCENARIOS } from "./useSimulationStore";
import { SimulationControlPanel } from "./SimulationControlPanel";
import { SimulationTimeline } from "./SimulationTimeline";
import { SimulationStatsModal } from "./SimulationStatsModal";
import { ScenarioCard } from "./ScenarioCard";
import { DashboardContainer } from "../dashboard/DashboardContainer";
import { DigitalTwinContainer } from "../digital-twin/DigitalTwinContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

export function SimulationContainer() {
  const isActive = useSimulationStore((state) => state.isActive);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 overflow-hidden relative">
      <SimulationControlPanel />
      
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div 
            key="scenario-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="flex-1 overflow-y-auto custom-scrollbar pt-6"
          >
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
                  <Zap className="w-8 h-8 text-primary" /> Crisis Simulation Engine
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Select a scenario to orchestrate a synchronized simulation across the Digital Twin, AI Decision Engine, and Command Dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCENARIOS.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active-simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden"
          >
            {/* Left Col: Timeline */}
            <div className="lg:col-span-3 h-full overflow-hidden">
              <SimulationTimeline />
            </div>

            {/* Middle Col: Digital Twin Mini */}
            <div className="lg:col-span-6 h-full glass-card border border-border/50 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0">
                <DigitalTwinContainer />
              </div>
            </div>

            {/* Right Col: Dashboard Mini */}
            <div className="lg:col-span-3 h-full overflow-y-auto custom-scrollbar glass-card border border-border/50 rounded-xl p-2 relative">
               <div className="transform scale-[0.85] origin-top">
                 <DashboardContainer />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SimulationStatsModal />
    </div>
  );
}
