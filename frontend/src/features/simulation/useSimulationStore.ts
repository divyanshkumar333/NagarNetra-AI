import { create } from "zustand";
import { toast } from "sonner";
import { PlaybackSpeed, ScenarioDefinition, SimulationStats, TimelineEvent, Severity } from "./types";
import { useAIEngineStore } from "../ai-engine/useAIEngineStore";
import { useDigitalTwinStore } from "../digital-twin/useDigitalTwinStore";

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "sc-rush-accident",
    title: "Major Traffic Accident",
    description: "A major collision during rush hour blocking two northbound lanes.",
    difficulty: "High",
    expectedDuration: "45 mins",
    primaryObjective: "Reroute traffic & minimize emergency response delay.",
    estimatedImpact: "Severe localized gridlock.",
    defaultSeverity: "Critical"
  },
  {
    id: "sc-heavy-rain",
    title: "Heavy Rain",
    description: "Sudden torrential downpour reducing visibility and speed limits city-wide.",
    difficulty: "Medium",
    expectedDuration: "2 hours",
    primaryObjective: "Optimize signal timings for slower average speeds.",
    estimatedImpact: "20% reduction in overall flow capacity.",
    defaultSeverity: "Medium"
  },
  {
    id: "sc-vip-convoy",
    title: "VIP Convoy",
    description: "High-priority security convoy moving from the airport to the city center.",
    difficulty: "High",
    expectedDuration: "30 mins",
    primaryObjective: "Create an uninterrupted green corridor while maintaining parallel flow.",
    estimatedImpact: "Temporary cross-traffic delays.",
    defaultSeverity: "High"
  }
];

interface SimulationState {
  isActive: boolean;
  isPaused: boolean;
  isDemoMode: boolean;
  speed: PlaybackSpeed;
  activeScenario: ScenarioDefinition | null;
  severity: Severity;
  timeline: TimelineEvent[];
  stats: SimulationStats | null;
  
  // Controls
  startSimulation: (scenarioId: string, demoMode?: boolean) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => void;
  finishSimulation: (stats: SimulationStats) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isActive: false,
  isPaused: false,
  isDemoMode: false,
  speed: 1,
  activeScenario: null,
  severity: "Low",
  timeline: [],
  stats: null,

  startSimulation: (scenarioId, demoMode = false) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    set({ 
      isActive: true, 
      isPaused: false,
      isDemoMode: demoMode,
      activeScenario: scenario, 
      severity: scenario.defaultSeverity,
      timeline: [],
      stats: null,
      speed: 1
    });

    // Reset stores
    useDigitalTwinStore.getState().resetState();
    useAIEngineStore.getState().resetState();

    if (demoMode) {
      runDemoSequence(get, scenario);
    }
  },

  pauseSimulation: () => set({ isPaused: true }),
  resumeSimulation: () => set({ isPaused: false }),
  
  resetSimulation: () => {
    set({
      isActive: false,
      isPaused: false,
      isDemoMode: false,
      activeScenario: null,
      timeline: [],
      stats: null,
      speed: 1
    });
    useDigitalTwinStore.getState().resetState();
    useAIEngineStore.getState().resetState();
  },

  setSpeed: (speed) => set({ speed }),

  addTimelineEvent: (event) => set((state) => ({
    timeline: [...state.timeline, { ...event, id: `evt-${Date.now()}`, timestamp: new Date().toISOString() }]
  })),

  finishSimulation: (stats) => set({ stats, isActive: false })
}));

async function runDemoSequence(get: () => SimulationState, scenario: ScenarioDefinition) {
  const addEvent = get().addTimelineEvent;
  const { injectTelemetry, triggerPipeline, simulateRecommendation, approveRecommendation } = useAIEngineStore.getState();
  const { setWeather, triggerIncident, toggleHeatmaps, setCameraPreset, setFollowTarget } = useDigitalTwinStore.getState();

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms / get().speed));

  // 1. Initial State
  setCameraPreset("skyline");
  addEvent({ title: "City Healthy", description: "City metrics operating within normal parameters.", category: "observation" });
  await delay(2000);

  // 2. Escalate based on scenario
  setCameraPreset("downtown");
  addEvent({ title: "Rush Hour Begins", description: "Traffic density increasing steadily.", category: "observation" });
  injectTelemetry({ congestion: { "Main Junction": 60, "North Ave": 55 }, vehicleCounts: { "Main Junction": 300, "North Ave": 250 } });
  await delay(2000);

  if (scenario.id === "sc-rush-accident") {
    setCameraPreset("incident");
    addEvent({ title: "Major Accident Detected", description: "Collision at Main Junction. Northbound lanes blocked.", category: "outcome" });
    toast.error("Major Accident Detected", { description: "Collision at Main Junction. Northbound lanes blocked." });
    triggerIncident("accident");
    injectTelemetry({ 
      congestion: { "Main Junction": 95, "North Ave": 85 }, 
      activeAccidents: ["Main Junction"],
      emergencyVehiclesActive: 3
    });
  } else if (scenario.id === "sc-heavy-rain") {
    setCameraPreset("intersection");
    addEvent({ title: "Heavy Rain Started", description: "Visibility dropping. Congestion compounding.", category: "outcome" });
    toast.warning("Weather Alert: Heavy Rain", { description: "Visibility dropping. Congestion compounding." });
    setWeather("rain");
    injectTelemetry({ weather: "rain", congestion: { "Main Junction": 85, "North Ave": 80 } });
  } else if (scenario.id === "sc-vip-convoy") {
    setCameraPreset("traffic");
    addEvent({ title: "VIP Convoy En Route", description: "Convoy approaching city limits.", category: "observation" });
    toast.info("Security Alert: VIP Convoy", { description: "Convoy approaching city limits." });
    injectTelemetry({ emergencyVehiclesActive: 5, congestion: { "Main Junction": 90 } });
  }
  await delay(1500);

  // 3. AI Detection
  setCameraPreset("ai-focus");
  addEvent({ title: "AI Pipeline Triggered", description: "Abnormal telemetry detected. Commencing analysis.", category: "ai" });
  toggleHeatmaps(); // show visual hotspots in 3D
  
  await delay(500);
  triggerPipeline(); // This takes ~1.1s in mock
  
  await delay(1500);
  addEvent({ title: "Recommendation Generated", description: "AI formulated mitigation strategy.", category: "ai" });
  await delay(2000);

  // 4. Auto Simulation
  const recs = useAIEngineStore.getState().recommendations;
  if (recs.length > 0) {
    const recId = recs[0].id;
    addEvent({ title: "Simulating Impact", description: "Comparing current state vs proposed changes.", category: "ai" });
    await simulateRecommendation(recId);
    
    await delay(3000);
    addEvent({ title: "Operator Approval", description: "Auto-approved in Demo Mode.", category: "action" });
    
    await approveRecommendation(recId);
    
    // 5. Resolution
    setFollowTarget("emergency"); // Smoothly track the emergency response vehicle
    addEvent({ title: "Executing Changes", description: "Traffic signals synchronized. Emergency vehicles rerouted.", category: "action" });
    injectTelemetry({ 
      congestion: { "Main Junction": 50, "North Ave": 40 }, 
      activeAccidents: [],
      weather: "clear"
    });
    if (scenario.id === "sc-heavy-rain") setWeather("clear");
    toggleHeatmaps();
    
    await delay(2000);
    setFollowTarget("none");
    setCameraPreset("traffic");
    addEvent({ title: "Traffic Stabilized", description: "City health returning to optimal levels.", category: "outcome" });
    
    await delay(2000);
    setCameraPreset("skyline");
    toast.success("Simulation Complete", { description: "City metrics stabilized. Recommendations logged." });
    // End Simulation
    get().finishSimulation({
      initialHealth: 78,
      finalHealth: 92,
      timeSavedMinutes: 12,
      congestionReductionPercentage: 35,
      emergencyResponseImprovementPercentage: 45,
      fuelSavedLiters: 4200,
      carbonReductionKg: 8500,
      operatorDecisions: 1,
      aiAccuracyPercentage: 98,
      recommendationAcceptanceRate: 100
    });
  }
}
