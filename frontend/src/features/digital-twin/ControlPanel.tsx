"use client";

import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { Button } from "@/components/ui/button";
import { Moon, Sun, CloudRain, Video, AlertTriangle, Layers } from "lucide-react";

export function ControlPanel() {
  const { timeOfDay, weather, heatmapsEnabled, setTimeOfDay, setWeather, setCameraPreset, toggleHeatmaps, triggerIncident } = useDigitalTwinStore();

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="glass-panel p-2 rounded-lg flex flex-col gap-2 border border-border/50">
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">Environment</div>
        
        <div className="flex gap-2">
          <Button 
            variant={timeOfDay === "day" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setTimeOfDay("day")}
            title="Day"
          >
            <Sun className="w-4 h-4" />
          </Button>
          <Button 
            variant={timeOfDay === "night" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setTimeOfDay("night")}
            title="Night"
          >
            <Moon className="w-4 h-4" />
          </Button>
          <Button 
            variant={weather === "rain" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setWeather(weather === "rain" ? "clear" : "rain")}
            title="Toggle Rain"
          >
            <CloudRain className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-lg flex flex-col gap-2 border border-border/50 mt-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">Cinematic Cameras</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setCameraPreset("overview")}>
            <Video className="w-3 h-3 mr-2" /> Overview
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCameraPreset("intersection")}>
            <Video className="w-3 h-3 mr-2" /> Junction
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCameraPreset("ai-focus")}>
            <Video className="w-3 h-3 mr-2" /> AI Core
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCameraPreset("traffic")}>
            <Video className="w-3 h-3 mr-2" /> Highway
          </Button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-lg flex flex-col gap-2 border border-border/50 mt-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">AI Tools</div>
        <Button 
          variant={heatmapsEnabled ? "default" : "outline"} 
          size="sm" 
          onClick={toggleHeatmaps}
          className="justify-start"
        >
          <Layers className="w-3 h-3 mr-2" /> {heatmapsEnabled ? "Hide Heatmaps" : "Show Heatmaps"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => triggerIncident("Accident")}
          className="justify-start border-destructive/50 hover:bg-destructive/10 text-destructive"
        >
          <AlertTriangle className="w-3 h-3 mr-2" /> Trigger Accident
        </Button>
      </div>
    </div>
  );
}
