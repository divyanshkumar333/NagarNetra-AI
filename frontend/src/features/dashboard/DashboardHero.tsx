"use client";

import { useState, useEffect } from "react";
import { CloudRain, ShieldCheck, Clock, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useAIEngineStore } from "../ai-engine/useAIEngineStore";

export function DashboardHero() {
  const [time, setTime] = useState<Date | null>(null);
  const cityHealth = useAIEngineStore(state => state.cityHealth);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    setTimeout(() => setTime(new Date()), 0);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const score = cityHealth?.score || 92;
  const isOptimal = score >= 90;
  const statusColor = isOptimal ? "text-primary" : (score > 70 ? "text-amber-500" : "text-red-500");

  const timeString = time.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-panel p-6 rounded-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
            <circle 
              cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" 
              strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - score/100)}
              className={`${statusColor} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className={`text-2xl font-bold ${statusColor}`}>{score}</span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart City Score: {isOptimal ? "Optimal" : (score > 70 ? "Warning" : "Critical")}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            {isOptimal ? <ShieldCheck className="w-4 h-4 text-primary" /> : <ShieldAlert className={`w-4 h-4 ${statusColor}`} />}
            Systems {isOptimal ? "optimal" : "require attention"}. AI confidence: High
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground"><Activity className="w-3 h-3" /> Traffic: {cityHealth?.factors.congestion || 94}%</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Activity className="w-3 h-3" /> Safety: {cityHealth?.factors.safety || 98}%</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Activity className="w-3 h-3" /> Env: {cityHealth?.factors.environment || 88}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 text-right border-l border-border/50 pl-8">
        <div>
          <div className="flex items-center justify-end gap-2 text-foreground font-medium">
            <CloudRain className="w-4 h-4 text-primary" />
            <span>Light Rain, 18°C</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Visibility: 8km</p>
        </div>
        <div>
          <div className="flex items-center justify-end gap-2 text-foreground font-bold tracking-wider font-mono text-lg">
            <Clock className="w-4 h-4 text-primary" />
            {timeString}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{dateString}</p>
        </div>
      </div>
    </motion.div>
  );
}
