"use client";

import { useAIEngineStore } from "../ai-engine/useAIEngineStore";
import { RecommendationCard } from "../ai-engine/RecommendationCard";
import { Brain, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function AIRecommendations() {
  const recommendations = useAIEngineStore((state) => state.recommendations);
  const triggerPipeline = useAIEngineStore((state) => state.triggerPipeline);
  
  useEffect(() => {
    // Start AI engine if not running
    if (recommendations.length === 0) {
      triggerPipeline();
    }
  }, [triggerPipeline, recommendations.length]);

  return (
    <div className="glass-card rounded-lg flex flex-col h-[600px] border border-border/50">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold tracking-tight">AI Copilot</h3>
        </div>
        <Link href="/ai-studio" className="text-xs text-primary hover:underline flex items-center gap-1">
          Open AI Studio <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
            <Brain className="w-8 h-8 mb-2" />
            <p className="text-sm">Monitoring city telemetry...</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))
        )}
      </div>
    </div>
  );
}
