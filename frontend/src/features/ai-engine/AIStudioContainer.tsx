"use client";

import { useAIEngineStore } from "./useAIEngineStore";
import { PipelineVisualizer } from "./PipelineVisualizer";
import { RecommendationCard } from "./RecommendationCard";
import { DecisionTimeline } from "./DecisionTimeline";
import { SimulationModal } from "./SimulationModal";
import { Button } from "@/components/ui/button";
import { Brain, Activity, PowerSquare, Wifi, HeartPulse } from "lucide-react";
import { useEffect } from "react";

export function AIStudioContainer() {
  const triggerPipeline = useAIEngineStore((state) => state.triggerPipeline);
  const isProcessing = useAIEngineStore((state) => state.isProcessing);
  const recommendations = useAIEngineStore((state) => state.recommendations);
  const cityHealth = useAIEngineStore((state) => state.cityHealth);

  // Auto-trigger pipeline on mount for demo purposes
  useEffect(() => {
    triggerPipeline();
  }, [triggerPipeline]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" /> AI Studio
          </h2>
          <p className="text-muted-foreground mt-1">Live reasoning pipeline and intelligence ops.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          {cityHealth && (
            <div className="glass-panel px-4 py-2 rounded-lg border border-border/50 flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">City Health</div>
                <div className="font-mono font-bold text-green-500 leading-none">{cityHealth.score}/100</div>
              </div>
            </div>
          )}
          
          <Button onClick={triggerPipeline} disabled={isProcessing} className="gap-2">
            <PowerSquare className="w-4 h-4" /> 
            {isProcessing ? "Processing Telemetry..." : "Run AI Cycle"}
          </Button>
        </div>
      </div>

      {/* Pipeline */}
      <PipelineVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Active Recommendations
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border/50 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-green-500" /> Model: Core-Mock-v1
            </span>
          </div>
          
          {recommendations.length === 0 ? (
            <div className="glass-card p-12 border border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground">
              <Brain className="w-12 h-12 mb-4 opacity-20" />
              <p>No active recommendations.</p>
              <p className="text-sm opacity-70">The city is operating optimally.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <DecisionTimeline />
        </div>
      </div>

      <SimulationModal />
    </div>
  );
}
