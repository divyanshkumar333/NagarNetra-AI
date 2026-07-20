import { TelemetryProvider } from "./provider";
import { TelemetryData, TrafficCamera, EnvironmentSensor, InfrastructureNode, EmergencyEvent } from "./types";
import { useAIEngineStore } from "../ai-engine/useAIEngineStore";
import { useDigitalTwinStore } from "../digital-twin/useDigitalTwinStore";

const generateCameras = (): TrafficCamera[] => {
  return [
    { id: "CAM-01", location: "Main Junction", coordinates: [0, 0], status: "online", battery: 98, lastMaintenance: "2d ago", signalQuality: 99, type: "camera", vehicleCount: 45, averageSpeed: 25, aiDetectedIncidents: [] },
    { id: "CAM-02", location: "North Ave", coordinates: [3, -4], status: "online", battery: 85, lastMaintenance: "15d ago", signalQuality: 88, type: "camera", vehicleCount: 30, averageSpeed: 40, aiDetectedIncidents: [] },
    { id: "CAM-03", location: "West Bridge", coordinates: [-5, 2], status: "warning", battery: 45, lastMaintenance: "30d ago", signalQuality: 60, type: "camera", vehicleCount: 85, averageSpeed: 10, aiDetectedIncidents: ["Congestion"] },
    { id: "CAM-04", location: "East Highway", coordinates: [5, 1], status: "offline", battery: 0, lastMaintenance: "6mo ago", signalQuality: 0, type: "camera", vehicleCount: 0, averageSpeed: 0, aiDetectedIncidents: [] },
  ];
};

const generateEnvironment = (): EnvironmentSensor[] => {
  return [
    { id: "ENV-01", location: "City Center", coordinates: [1, 1], status: "online", battery: 100, lastMaintenance: "1d ago", signalQuality: 100, type: "environment", aqi: 45, temperature: 24, humidity: 55, noise: 65, rainfall: 0, windSpeed: 12 },
    { id: "ENV-02", location: "Industrial Zone", coordinates: [-4, -4], status: "warning", battery: 20, lastMaintenance: "45d ago", signalQuality: 70, type: "environment", aqi: 110, temperature: 26, humidity: 50, noise: 85, rainfall: 0, windSpeed: 8 },
  ];
};

const generateInfrastructure = (): InfrastructureNode[] => {
  return [
    { id: "INF-01", location: "Grid Alpha", coordinates: [0, 2], status: "online", battery: 100, lastMaintenance: "10d ago", signalQuality: 95, type: "infrastructure", subType: "power", load: 65, temperature: 40 },
    { id: "INF-02", location: "West Bridge", coordinates: [-5, 2], status: "critical", battery: 15, lastMaintenance: "90d ago", signalQuality: 40, type: "infrastructure", subType: "bridge", load: 95, temperature: 22 },
  ];
};

const generateEmergencies = (): EmergencyEvent[] => {
  return [
    { id: "EMG-001", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: "Accident", location: "West Bridge", priority: "High", status: "new", description: "Multi-vehicle collision reported." },
    { id: "EMG-002", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: "911 Call", location: "North Ave", priority: "Medium", status: "acknowledged", description: "Traffic light malfunction." }
  ];
};

export const MockTelemetryProvider: TelemetryProvider = {
  name: "Mock IoT Network",
  connect: (onData) => {
    // Initial data
    const initialData: TelemetryData = {
      cameras: generateCameras(),
      environment: generateEnvironment(),
      infrastructure: generateInfrastructure(),
      emergencies: generateEmergencies(),
      health: {
        connectedSensors: 7,
        offlineSensors: 1,
        warningSensors: 2,
        activeStreams: 10,
        lastSyncTime: new Date().toISOString()
      }
    };
    onData(initialData);

    // Setup tick interval
    const interval = setInterval(() => {
      const now = new Date().toISOString();
      const updatedData = {
        health: {
          ...initialData.health,
          lastSyncTime: now
        }
      };
      
      onData(updatedData);

      // --- AI INTEGRATION ---
      // Randomly trigger AI if an emergency is new
      const emergencies = initialData.emergencies;
      const newEmergency = emergencies.find(e => e.status === "new");
      if (newEmergency && !useAIEngineStore.getState().isProcessing) {
        useAIEngineStore.getState().injectTelemetry({
          activeAccidents: [newEmergency.location],
          congestion: { [newEmergency.location]: 85 }
        });
        useAIEngineStore.getState().triggerPipeline();
      }

      // Sync weather to digital twin if needed
      const cityEnv = initialData.environment[0];
      if (cityEnv) {
        if (cityEnv.rainfall > 10) useDigitalTwinStore.getState().setWeather("rain");
      }
    }, 2000);

    // Save interval so we can clear it
    (MockTelemetryProvider as unknown as Record<string, unknown>)._interval = interval;
  },
  disconnect: () => {
    if ((MockTelemetryProvider as unknown as Record<string, unknown>)._interval) {
      clearInterval((MockTelemetryProvider as unknown as Record<string, unknown>)._interval as NodeJS.Timeout);
    }
  }
};
