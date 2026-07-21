"use client";

import { useEffect, useState, useRef } from "react";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { Terminal } from "lucide-react";

const LOG_TEMPLATES = [
  "[SYS] Analyzing sector 4 traffic flow...",
  "[OPT] Rerouting emergency vehicles to avoid congestion. Confidence: 98.4%",
  "[WARN] Anomaly detected in power grid distribution (Substation B).",
  "[AI] Adjusting traffic signal timing at main intersection.",
  "[SYS] Scanning for unauthorized drone activity...",
  "[OPT] Predictive maintenance required for water mains in downtown.",
  "[AI] Pedestrian density exceeding safety threshold. Dispatching crowd control.",
  "[SYS] Live camera feed analysis running...",
  "[OPT] Energy consumption optimized by 12% across smart buildings.",
];

export function AILogTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeIncident } = useDigitalTwinStore();

  useEffect(() => {
    const addLog = (msg: string) => {
      setLogs((prev) => {
        const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
        return newLogs.slice(-15); // Keep last 15 logs
      });
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) { // Only add logs sometimes to look organic
        const randLog = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
        addLog(randLog);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeIncident) {
      setTimeout(() => {
        setLogs((prev) => {
          const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] [CRITICAL] INCIDENT DETECTED: ${activeIncident.toUpperCase()}. Initiating response protocol.`];
          return newLogs.slice(-15);
        });
      }, 0);
    }
  }, [activeIncident]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute bottom-4 left-4 z-10 w-80 glass-premium rounded-lg border border-border/50 flex flex-col overflow-hidden pointer-events-auto">
      <div className="bg-primary/10 border-b border-primary/20 px-3 py-1.5 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary">AI Action Log</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="p-3 h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed text-muted-foreground flex flex-col gap-1"
      >
        {logs.map((log, i) => {
          const isCritical = log.includes("[CRITICAL]") || log.includes("[WARN]");
          const isAI = log.includes("[AI]") || log.includes("[OPT]");
          return (
            <div key={i} className={`break-words ${isCritical ? "text-destructive font-bold" : isAI ? "text-primary/90" : "text-muted-foreground/70"}`}>
              {log}
            </div>
          );
        })}
        {logs.length === 0 && <div className="text-primary animate-pulse">Awaiting system telemetry...</div>}
      </div>
    </div>
  );
}
