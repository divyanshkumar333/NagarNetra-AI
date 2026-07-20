"use client";

import { useState, useEffect } from "react";
import { CloudRain, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardHero() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    setTimeout(() => setTime(new Date()), 0);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null; // Avoid hydration mismatch

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
              strokeDasharray={251.2} strokeDashoffset={251.2 * 0.08} /* 92% health */
              className="text-primary transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-2xl font-bold text-primary">92</span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">City Status: Nominal</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Systems optimal. Last AI analysis: Just now
          </p>
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
