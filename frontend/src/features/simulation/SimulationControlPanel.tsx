"use client";

import { useSimulationStore } from "./useSimulationStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlaybackSpeed } from "./types";

export function SimulationControlPanel() {
  const { isActive, isPaused, isDemoMode, activeScenario, speed, pauseSimulation, resumeSimulation, resetSimulation, setSpeed } = useSimulationStore();

  if (!isActive) return null;

  return (
    <div className="glass-panel border-y sm:border sm:rounded-xl border-border/50 p-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2">
            Simulation Active
            {isDemoMode && <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">AUTO DEMO</Badge>}
          </h2>
          <p className="text-xs text-muted-foreground">{activeScenario?.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-muted/30 rounded-md p-1 border border-border/50 mr-4">
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s as PlaybackSpeed)}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${speed === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {s}x
            </button>
          ))}
        </div>

        {isPaused ? (
          <Button variant="default" size="sm" onClick={resumeSimulation} className="w-24">
            <Play className="w-4 h-4 mr-2" /> Resume
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={pauseSimulation} className="w-24 border-border/50">
            <Pause className="w-4 h-4 mr-2" /> Pause
          </Button>
        )}
        
        <Button variant="destructive" size="sm" onClick={resetSimulation} className="bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <Square className="w-4 h-4 mr-2" /> Stop
        </Button>
      </div>
    </div>
  );
}
