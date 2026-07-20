"use client";

import { motion } from "framer-motion";

function Vehicle({ delay, top, left, horizontal = true, color = "bg-primary", duration = 4 }: { delay: number, top: string, left: string, horizontal?: boolean, color?: string, duration?: number }) {
  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.8)] shadow-${color.replace('bg-', '')}`}
      style={{ top, left }}
      initial={horizontal ? { x: -20, opacity: 0 } : { y: -20, opacity: 0 }}
      animate={horizontal ? { x: 500, opacity: [0, 1, 1, 0] } : { y: 300, opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    />
  );
}

function Hotspot({ top, left, label }: { top: string, left: string, label: string }) {
  return (
    <div className="absolute" style={{ top, left }}>
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -inset-4 bg-destructive rounded-full"
      />
      <div className="relative w-3 h-3 bg-destructive rounded-full border border-background z-10" />
      <span className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-destructive-foreground bg-destructive/80 px-1 rounded">
        {label}
      </span>
    </div>
  );
}

export function TrafficOverview() {
  return (
    <div className="glass-card rounded-lg flex flex-col h-[500px] overflow-hidden relative border border-border/50">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm relative z-20 flex justify-between items-center">
        <h3 className="font-semibold tracking-tight">Live Grid Telemetry</h3>
        <div className="flex gap-3 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Normal Flow</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Heavy</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive" /> Gridlock</span>
        </div>
      </div>
      
      <div className="flex-1 relative bg-[oklch(0.12_0.01_250)] overflow-hidden">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, oklch(0.65 0.15 250) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.65 0.15 250) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Arterial Roads */}
        <div className="absolute top-[20%] left-0 right-0 h-4 bg-white/5 border-y border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]" />
        <div className="absolute top-[60%] left-0 right-0 h-4 bg-white/5 border-y border-amber-500/20" />
        <div className="absolute left-[30%] top-0 bottom-0 w-4 bg-white/5 border-x border-primary/20" />
        <div className="absolute left-[70%] top-0 bottom-0 w-4 bg-white/5 border-x border-destructive/20" />

        {/* Vehicles Horizontal 1 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Vehicle key={`h1-${i}`} delay={i * 0.8} duration={3 + (i % 3)} top="21%" left="0%" />
        ))}
        {/* Vehicles Horizontal 2 (Congested) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Vehicle key={`h2-${i}`} delay={i * 0.4} duration={5 + (i % 2)} top="61%" left="0%" color="bg-amber-500" />
        ))}
        {/* Vehicles Vertical 1 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Vehicle key={`v1-${i}`} delay={i * 1.2} duration={4 + (i % 3)} top="0%" left="30.5%" horizontal={false} />
        ))}
        
        {/* Emergency Vehicle (Fast) */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
          style={{ top: "0%", left: "70.5%" }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 500, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 2, ease: "linear" }}
        />

        {/* Hotspots */}
        <Hotspot top="59%" left="69%" label="Junction C (Gridlock)" />
        <Hotspot top="19%" left="29%" label="Sector 4 (Alert)" />
      </div>
    </div>
  );
}
