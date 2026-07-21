import { create } from "zustand";

export type TimeOfDay = "day" | "night" | "sunset";
export type CameraPreset = "overview" | "intersection" | "incident" | "ai-focus" | "traffic" | "downtown" | "stadium" | "skyline" | "birds-eye";
export type Weather = "clear" | "rain" | "fog";
export type FollowTarget = "none" | "emergency" | "drone" | "traffic" | "helicopter";
export type CameraMode = "orbit" | "free" | "copter" | "present";
export type Theme = "standard" | "cyberpunk";

export interface Entity {
  id: string;
  type: "building" | "vehicle" | "intersection";
  [key: string]: unknown;
}

interface DigitalTwinState {
  theme: Theme;
  timeOfDay: TimeOfDay;
  cameraPreset: CameraPreset;
  weather: Weather;
  selectedEntity: Entity | null;
  activeIncident: string | null;
  incidentLocation: [number, number, number] | null;
  heatmapsEnabled: boolean;
  introActive: boolean;
  followTarget: FollowTarget;
  followedPosition: [number, number, number] | null;
  cameraMode: CameraMode;
  simulationSpeed: number;
  setTheme: (theme: Theme) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setWeather: (weather: Weather) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  triggerIncident: (type: string) => void;
  toggleHeatmaps: () => void;
  setIntroActive: (active: boolean) => void;
  setFollowTarget: (target: FollowTarget) => void;
  setFollowedPosition: (pos: [number, number, number] | null) => void;
  setCameraMode: (mode: CameraMode) => void;
  setSimulationSpeed: (speed: number) => void;
  resetState: () => void;
}

export const useDigitalTwinStore = create<DigitalTwinState>((set) => ({
  theme: "standard",
  timeOfDay: "day",
  cameraPreset: "overview",
  weather: "clear",
  selectedEntity: null,
  activeIncident: null,
  incidentLocation: null,
  heatmapsEnabled: false,
  introActive: true,
  followTarget: "none",
  followedPosition: null,
  cameraMode: "orbit",
  simulationSpeed: 1.0,
  setTheme: (theme) => set({ theme }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setCameraPreset: (preset) => set({ cameraPreset: preset, followTarget: "none", cameraMode: "orbit" }),
  setWeather: (weather) => set({ weather }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  triggerIncident: (type) => {
    const randX = (Math.random() - 0.5) * 500;
    const randZ = (Math.random() - 0.5) * 500;
    set({ 
      activeIncident: type, 
      cameraPreset: "incident", 
      followTarget: "none",
      cameraMode: "orbit",
      incidentLocation: [randX, 0, randZ] 
    });
    setTimeout(() => {
      set((state) => state.activeIncident === type ? { activeIncident: null, cameraPreset: "overview", incidentLocation: null } : state);
    }, 10000);
  },
  toggleHeatmaps: () => set((state) => ({ heatmapsEnabled: !state.heatmapsEnabled })),
  setIntroActive: (active) => set({ introActive: active }),
  setFollowTarget: (target) => set({ followTarget: target, cameraPreset: "overview", cameraMode: "orbit" }),
  setFollowedPosition: (pos) => set({ followedPosition: pos }),
  setCameraMode: (mode) => set({ cameraMode: mode, followTarget: mode === "free" ? "none" : undefined }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  resetState: () => set({
    theme: "standard",
    timeOfDay: "day",
    cameraPreset: "overview",
    weather: "clear",
    selectedEntity: null,
    activeIncident: null,
    incidentLocation: null,
    heatmapsEnabled: false,
    introActive: false,
    followTarget: "none",
    followedPosition: null,
    cameraMode: "orbit",
    simulationSpeed: 1.0
  })
}));
