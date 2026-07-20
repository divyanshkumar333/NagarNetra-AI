"use client";

import { Recommendation } from "./types";
import { useAIEngineStore } from "./useAIEngineStore";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Activity, Target, BrainCircuit, Play, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: Props) {
  const { simulateRecommendation, approveRecommendation, rejectRecommendation, isProcessing } = useAIEngineStore();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="glass-card border border-border/50 rounded-xl overflow-hidden flex flex-col group">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority} Priority
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {recommendation.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Confidence</div>
          <div className="font-mono text-xl font-bold text-primary">{recommendation.confidence}%</div>
        </div>
      </div>

      {/* Structured Reasoning */}
      <div className="p-4 flex-1 space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-px h-full bg-border/50 my-1"></div>
          </div>
          <div className="pb-2">
            <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <SearchIcon /> Observed
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning.observation}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <div className="w-px h-full bg-border/50 my-1"></div>
          </div>
          <div className="pb-2">
            <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <BrainCircuit className="w-3 h-3" /> Analyzed
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning.analysis}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <div className="w-px h-full bg-border/50 my-1"></div>
          </div>
          <div className="pb-2">
            <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Target className="w-3 h-3" /> Predicted
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning.prediction}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div>
            <div className="text-xs font-semibold text-green-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3" /> Expected Outcome
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reasoning.expectedOutcome}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-px bg-border/50 border-t border-border/50">
        <div className="bg-background/50 p-3 flex flex-col justify-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Time Saved</span>
          <span className="font-mono font-semibold text-green-500">{recommendation.estimatedTimeSavedMinutes} mins</span>
        </div>
        <div className="bg-background/50 p-3 flex flex-col justify-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Activity className="w-3 h-3"/> Risk Level</span>
          <span className="font-mono font-semibold text-amber-500">{recommendation.riskLevel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-muted/5 flex gap-2 border-t border-border/50">
        <Button variant="outline" className="flex-1" onClick={() => simulateRecommendation(recommendation.id)} disabled={isProcessing}>
          <Play className="w-4 h-4 mr-2 text-primary" /> Simulate
        </Button>
        <Button className="flex-1" onClick={() => approveRecommendation(recommendation.id)} disabled={isProcessing}>
          <Zap className="w-4 h-4 mr-2" /> Approve
        </Button>
        <Button variant="ghost" size="icon" onClick={() => rejectRecommendation(recommendation.id)} disabled={isProcessing}>
          <XCircle className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  )
}
