"use client";

import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { Button } from "@/components/ui/button";
import { Moon, Sun, CloudRain, Video, AlertTriangle, Layers } from "lucide-react";

export function ControlPanel() {
  const { theme, setTheme, timeOfDay, weather, heatmapsEnabled, setTimeOfDay, setWeather, cameraPreset, setCameraPreset, toggleHeatmaps, triggerIncident, followTarget, setFollowTarget, cameraMode, setCameraMode, simulationSpeed, setSimulationSpeed } = useDigitalTwinStore();

  return (
    <div className="absolute top-4 left-4 z-10 w-64 flex flex-col gap-1 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar pr-2 pb-2">
      <details className="glass-premium p-2 rounded-lg border border-border/50 group" open>
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none">
          Environment
        </summary>
        <div className="flex gap-2 mt-2">
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
        <Button
          variant={theme === "cyberpunk" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme(theme === "cyberpunk" ? "standard" : "cyberpunk")}
          className="w-full text-xs"
        >
          {theme === "cyberpunk" ? "Disable Cyberpunk" : "Cyberpunk Mode"}
        </Button>
      </details>

      <details className="glass-premium p-2 rounded-lg border border-border/50 group">
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none">
          Camera Mode
        </summary>
        <div className="flex flex-col gap-2 mt-2">
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant={cameraMode === "orbit" ? "default" : "outline"}
              size="xs"
              onClick={() => setCameraMode("orbit")}
              className="text-[11px] px-1 h-7"
            >
              🎥 Orbit
            </Button>
            <Button
              variant={cameraMode === "free" ? "default" : "outline"}
              size="xs"
              onClick={() => setCameraMode("free")}
              className="text-[11px] px-1 h-7"
            >
              🚀 Drone
            </Button>
            <Button
              variant={cameraMode === "copter" ? "default" : "outline"}
              size="xs"
              onClick={() => setCameraMode("copter")}
              className="text-[11px] px-1 h-7"
            >
              🚁 Heli
            </Button>
          </div>
          {cameraMode === "free" && (
            <div className="text-[9px] text-muted-foreground px-1 leading-normal">
              ⚙️ <span className="font-semibold text-primary">WASD</span> to fly, <span className="font-semibold text-primary">QE</span> alt, <span className="font-semibold text-primary">Drag</span> look.
            </div>
          )}
          {cameraMode === "copter" && (
            <div className="text-[9px] text-muted-foreground px-1 leading-normal">
              ⚙️ <span className="font-semibold text-primary">WASD</span> to pilot, <span className="font-semibold text-primary">QE</span> alt, <span className="font-semibold text-primary">Drag</span> look.
            </div>
          )}
        </div>
      </details>

      <details className="glass-premium p-2 rounded-lg border border-border/50 group">
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none">
          Cinematic Cameras
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button variant={cameraPreset === "overview" && followTarget === "none" ? "default" : "outline"} size="sm" onClick={() => setCameraPreset("overview")}>
            <Video className="w-3 h-3 mr-2" /> Overview
          </Button>
          <Button variant={cameraPreset === "intersection" && followTarget === "none" ? "default" : "outline"} size="sm" onClick={() => setCameraPreset("intersection")}>
            <Video className="w-3 h-3 mr-2" /> Junction
          </Button>
          <Button variant={cameraPreset === "ai-focus" && followTarget === "none" ? "default" : "outline"} size="sm" onClick={() => setCameraPreset("ai-focus")}>
            <Video className="w-3 h-3 mr-2" /> AI Core
          </Button>
          <Button variant={cameraPreset === "traffic" && followTarget === "none" ? "default" : "outline"} size="sm" onClick={() => setCameraPreset("traffic")}>
            <Video className="w-3 h-3 mr-2" /> Highway
          </Button>
        </div>
      </details>

      <details className="glass-premium p-2 rounded-lg border border-border/50 group">
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none">
          Auto Follow Target
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button variant={followTarget === "drone" ? "default" : "outline"} size="sm" onClick={() => setFollowTarget("drone")}>
            🤖 AI Drone
          </Button>
          <Button variant={followTarget === "helicopter" ? "default" : "outline"} size="sm" onClick={() => setFollowTarget("helicopter")}>
            🚁 Helicopter
          </Button>
          <Button variant={followTarget === "emergency" ? "default" : "outline"} size="sm" onClick={() => setFollowTarget("emergency")}>
            🚑 Emergency
          </Button>
          <Button variant={followTarget === "traffic" ? "default" : "outline"} size="sm" onClick={() => setFollowTarget("traffic")}>
            🚦 Traffic
          </Button>
          <Button className="col-span-2 text-xs" variant={followTarget === "none" ? "default" : "outline"} size="sm" onClick={() => setFollowTarget("none")}>
            🔄 Orbit Free (Disable follow)
          </Button>
        </div>
      </details>

      <details className="glass-premium p-2 rounded-lg border border-border/50 group" open>
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none flex justify-between">
          <span>Simulation Speed</span>
          <span className="font-mono text-primary font-semibold">{simulationSpeed.toFixed(1)}x</span>
        </summary>
        <div className="flex gap-2 mt-2">
          <Button
            variant={simulationSpeed === 0.5 ? "default" : "outline"}
            size="sm"
            onClick={() => setSimulationSpeed(0.5)}
            className="flex-1 text-[11px] h-7 px-1"
          >
            0.5x
          </Button>
          <Button
            variant={simulationSpeed === 1.0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSimulationSpeed(1.0)}
            className="flex-1 text-[11px] h-7 px-1"
          >
            1.0x
          </Button>
          <Button
            variant={simulationSpeed === 2.0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSimulationSpeed(2.0)}
            className="flex-1 text-[11px] h-7 px-1"
          >
            2.0x
          </Button>
          <Button
            variant={simulationSpeed === 4.0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSimulationSpeed(4.0)}
            className="flex-1 text-[11px] h-7 px-1 font-semibold"
          >
            4.0x
          </Button>
        </div>
      </details>

      <details className="glass-premium p-2 rounded-lg border border-border/50 group" open>
        <summary className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1 py-1 cursor-pointer select-none">
          AI Tools
        </summary>
        <div className="flex flex-col gap-2 mt-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerIncident("Blackout")}
            className="justify-start border-purple-500/50 hover:bg-purple-500/10 text-purple-500"
          >
            <AlertTriangle className="w-3 h-3 mr-2" /> Grid Blackout
          </Button>
        </div>
      </details>
    </div>
  );
}
