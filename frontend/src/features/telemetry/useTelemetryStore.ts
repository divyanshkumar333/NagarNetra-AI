import { create } from "zustand";
import { TelemetryData, SensorBase } from "./types";
import { MockTelemetryProvider } from "./mockProvider";

interface TelemetryState extends TelemetryData {
  isConnected: boolean;
  selectedSensor: SensorBase | null;
  connect: () => void;
  disconnect: () => void;
  updateData: (data: Partial<TelemetryData>) => void;
  setSelectedSensor: (sensor: SensorBase | null) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  isConnected: false,
  cameras: [],
  environment: [],
  infrastructure: [],
  emergencies: [],
  selectedSensor: null,
  health: {
    connectedSensors: 0,
    offlineSensors: 0,
    warningSensors: 0,
    activeStreams: 0,
    lastSyncTime: new Date().toISOString()
  },

  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),

  connect: () => {
    set({ isConnected: true });
    MockTelemetryProvider.connect((data) => {
      set((state) => ({ ...state, ...data }));
    });
  },

  disconnect: () => {
    MockTelemetryProvider.disconnect();
    set({ isConnected: false });
  },

  updateData: (data) => set((state) => ({ ...state, ...data }))
}));
