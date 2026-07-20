"use client";

import { useEffect } from "react";
import { useTelemetryStore } from "./useTelemetryStore";
import { TelemetryHealthPanel } from "./TelemetryHealthPanel";
import { CameraCenter } from "./CameraCenter";
import { EmergencyFeed } from "./EmergencyFeed";
import { EnvironmentPanel } from "./EnvironmentPanel";
import { InfrastructurePanel } from "./InfrastructurePanel";
import { SensorDiagnosticsModal } from "./SensorDiagnosticsModal";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function TelemetryDashboardContainer() {
  const { connect, disconnect } = useTelemetryStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 overflow-hidden relative">
      <TelemetryHealthPanel />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="max-w-7xl mx-auto space-y-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Real-Time Intelligence Layer</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <CameraCenter />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnvironmentPanel />
                <InfrastructurePanel />
              </div>
            </div>

            <div className="lg:col-span-4 h-[600px] lg:h-auto">
              <EmergencyFeed />
            </div>
          </div>
        </div>
      </motion.div>

      <SensorDiagnosticsModal />
    </div>
  );
}
