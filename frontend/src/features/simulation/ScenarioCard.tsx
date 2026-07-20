"use client";

import { ScenarioDefinition } from "./types";
import { useSimulationStore } from "./useSimulationStore";
import { Button } from "@/components/ui/button";
import { Play, PlaySquare, AlertTriangle, CloudRain, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  scenario: ScenarioDefinition;
}

export function ScenarioCard({ scenario }: Props) {
  const { startSimulation, isActive } = useSimulationStore();

  const getIcon = () => {
    switch(scenario.id) {
      case "sc-heavy-rain": return <CloudRain className="w-5 h-5 text-blue-500" />;
      case "sc-vip-convoy": return <Car className="w-5 h-5 text-purple-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="glass-card p-4 border border-border/50 rounded-xl hover:border-primary/50 transition-colors flex flex-col group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-background/50 rounded-lg border border-border/50">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-semibold">{scenario.title}</h4>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] bg-background/50">{scenario.difficulty} Difficulty</Badge>
              <Badge variant="outline" className="text-[10px] bg-background/50">{scenario.expectedDuration}</Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 flex-1 relative z-10">
        {scenario.description}
      </p>

      <div className="bg-background/40 p-3 rounded-lg border border-border/50 mb-4 text-xs space-y-2 relative z-10">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Objective:</span>
          <span className="font-medium text-right ml-4 text-primary">{scenario.primaryObjective}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Impact:</span>
          <span className="font-medium text-right ml-4 text-orange-500">{scenario.estimatedImpact}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto relative z-10">
        <Button 
          className="flex-1 gap-2 bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/50" 
          disabled={isActive}
          onClick={() => startSimulation(scenario.id, false)}
        >
          <PlaySquare className="w-4 h-4" /> Start
        </Button>
        <Button 
          variant="default"
          className="flex-1 gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.6)] transition-shadow" 
          disabled={isActive}
          onClick={() => startSimulation(scenario.id, true)}
        >
          <Play className="w-4 h-4" /> Auto Demo
        </Button>
      </div>
    </div>
  );
}
