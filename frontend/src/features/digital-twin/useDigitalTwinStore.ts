import { create } from "zustand";

export type TimeOfDay = "day" | "night" | "sunset";
export type CameraPreset = "overview" | "intersection" | "incident" | "ai-focus" | "traffic";
export type Weather = "clear" | "rain" | "fog";

export interface Entity {
  id: string;
  type: "building" | "vehicle" | "intersection";
  [key: string]: unknown;
}

interface DigitalTwinState {
  timeOfDay: TimeOfDay;
  cameraPreset: CameraPreset;
  weather: Weather;
  selectedEntity: Entity | null;
  activeIncident: string | null;
  heatmapsEnabled: boolean;
  setTimeOfDay: (time: TimeOfDay) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setWeather: (weather: Weather) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  triggerIncident: (type: string) => void;
  toggleHeatmaps: () => void;
}

export const useDigitalTwinStore = create<DigitalTwinState>((set) => ({
  timeOfDay: "day",
  cameraPreset: "overview",
  weather: "clear",
  selectedEntity: null,
  activeIncident: null,
  heatmapsEnabled: false,
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setWeather: (weather) => set({ weather }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  triggerIncident: (type) => {
    set({ activeIncident: type, cameraPreset: "incident" });
    // Auto-resolve incident after 10 seconds for simulation purposes
    setTimeout(() => {
      set((state) => state.activeIncident === type ? { activeIncident: null, cameraPreset: "overview" } : state);
    }, 10000);
  },
  toggleHeatmaps: () => set((state) => ({ heatmapsEnabled: !state.heatmapsEnabled })),
}));
