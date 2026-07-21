"use client";

import { useState, useEffect } from "react";
import { useTelemetryStore } from "./useTelemetryStore";
import { Activity, Wifi, WifiOff, AlertTriangle, Server } from "lucide-react";

export function TelemetryHealthPanel() {
  const health = useTelemetryStore((state) => state.health);
  const isConnected = useTelemetryStore((state) => state.isConnected);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [apiVersion, setApiVersion] = useState<string>("");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/health`);
        if (response.ok) {
          const data = await response.json();
          setApiStatus("online");
          setApiVersion(data.version || "0.1.0");
        } else {
          setApiStatus("offline");
        }
      } catch (err) {
        setApiStatus("offline");
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel border-y sm:border sm:rounded-xl border-border/50 p-4 bg-background/80 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">IoT Network Status</h2>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected to Stream' : 'Disconnected'} • Last Sync: {new Date(health.lastSyncTime).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex gap-6 text-sm">
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><Server className="w-3 h-3"/> Online</span>
          <span className="font-mono font-bold text-green-500">{health.connectedSensors}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Warning</span>
          <span className="font-mono font-bold text-yellow-500">{health.warningSensors}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><WifiOff className="w-3 h-3"/> Offline</span>
          <span className="font-mono font-bold text-red-500">{health.offlineSensors}</span>
        </div>
        <div className="flex flex-col items-center pl-6 border-l border-border/50">
          <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><Activity className="w-3 h-3"/> Streams</span>
          <span className="font-mono font-bold text-primary">{health.activeStreams} Hz</span>
        </div>
        <div className="flex flex-col items-center pl-6 border-l border-border/50">
          <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><Server className="w-3 h-3"/> API Server</span>
          <span className={`font-mono font-bold ${apiStatus === "online" ? "text-green-500" : (apiStatus === "checking" ? "text-muted-foreground" : "text-red-500")}`}>
            {apiStatus === "online" ? `v${apiVersion}` : (apiStatus === "checking" ? "Checking" : "Offline")}
          </span>
        </div>
      </div>
    </div>
  );
}
