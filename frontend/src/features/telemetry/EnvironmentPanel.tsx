"use client";

import { useTelemetryStore } from "./useTelemetryStore";
import { Cloud, Wind, Thermometer, Droplets, Volume2, CloudRain } from "lucide-react";

export function EnvironmentPanel() {
  const environment = useTelemetryStore((state) => state.environment);

  // We take the average or the first sensor for city-wide display
  const cityEnv = environment[0];

  if (!cityEnv) return null;

  return (
    <div className="glass-card p-4 border border-border/50 rounded-xl flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Cloud className="w-4 h-4" /> Environmental Intelligence
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <EnvMetric 
          icon={<Cloud className="w-4 h-4 text-slate-400" />} 
          label="AQI" 
          value={cityEnv.aqi} 
          unit="" 
          status={cityEnv.aqi > 100 ? "warning" : "good"} 
        />
        <EnvMetric 
          icon={<Thermometer className="w-4 h-4 text-orange-400" />} 
          label="Temperature" 
          value={cityEnv.temperature} 
          unit="°C" 
        />
        <EnvMetric 
          icon={<Droplets className="w-4 h-4 text-blue-400" />} 
          label="Humidity" 
          value={cityEnv.humidity} 
          unit="%" 
        />
        <EnvMetric 
          icon={<Volume2 className="w-4 h-4 text-purple-400" />} 
          label="Noise" 
          value={cityEnv.noise} 
          unit="dB" 
          status={cityEnv.noise > 80 ? "warning" : "good"}
        />
        <EnvMetric 
          icon={<CloudRain className="w-4 h-4 text-cyan-400" />} 
          label="Rainfall" 
          value={cityEnv.rainfall} 
          unit="mm/h" 
        />
        <EnvMetric 
          icon={<Wind className="w-4 h-4 text-teal-400" />} 
          label="Wind Speed" 
          value={cityEnv.windSpeed} 
          unit="km/h" 
        />
      </div>
    </div>
  );
}

function EnvMetric({ icon, label, value, unit, status = "neutral" }: { icon: React.ReactNode, label: string, value: number, unit: string, status?: "good"|"warning"|"neutral" }) {
  const color = status === "good" ? "text-green-500" : status === "warning" ? "text-yellow-500" : "text-foreground";
  
  return (
    <div className="bg-background/40 p-3 rounded-lg border border-border/50 flex flex-col justify-between">
      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        {icon} {label}
      </span>
      <div className="flex items-end gap-1">
        <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground mb-1">{unit}</span>
      </div>
    </div>
  );
}
