import { create } from "zustand";
import { Telemetry, Hotspot, CityHealth, Prediction, Recommendation, DecisionLogEntry, LearningStats, PipelineStage, SimulationResult } from "./types";
import { MockAIProvider } from "./mockEngine";

interface AIEngineState {
  isProcessing: boolean;
  currentStage: PipelineStage;
  telemetry: Telemetry | null;
  hotspots: Hotspot[];
  cityHealth: CityHealth | null;
  predictions: Prediction[];
  recommendations: Recommendation[];
  decisionLog: DecisionLogEntry[];
  learningStats: Record<string, LearningStats>; // recommendationId -> stats
  activeSimulation: SimulationResult | null;
  
  // Actions
  triggerPipeline: () => Promise<void>;
  simulateRecommendation: (id: string) => Promise<void>;
  approveRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string) => void;
  clearSimulation: () => void;
  injectTelemetry: (telemetry: Partial<Telemetry>) => void;
  resetState: () => void;
}

const initialTelemetry: Telemetry = {
  timestamp: new Date().toISOString(),
  vehicleCounts: { "Main Junction": 450, "North Ave": 210 },
  congestion: { "Main Junction": 85, "North Ave": 40 },
  signalStates: { "Main Junction": "red" },
  weather: "clear",
  activeAccidents: [],
  emergencyVehiclesActive: 2,
  roadClosures: []
};

export const useAIEngineStore = create<AIEngineState>((set, get) => ({
  isProcessing: false,
  currentStage: "Observe",
  telemetry: initialTelemetry,
  hotspots: [],
  cityHealth: null,
  predictions: [],
  recommendations: [],
  decisionLog: [],
  learningStats: {},
  activeSimulation: null,

  triggerPipeline: async () => {
    if (get().isProcessing) return;
    
    set({ isProcessing: true, currentStage: "Observe" });
    
    // 1. Observe
    await new Promise(r => setTimeout(r, 600));
    set({ currentStage: "Analyze" });

    // 2. Analyze & Predict & Recommend (via provider)
    const result = await MockAIProvider.processTelemetry(get().telemetry!);
    
    set({ currentStage: "Recommend" });
    await new Promise(r => setTimeout(r, 500));

    set({
      hotspots: result.hotspots,
      cityHealth: result.health,
      predictions: result.predictions,
      recommendations: result.recommendations,
      isProcessing: false
    });
  },

  simulateRecommendation: async (id: string) => {
    const rec = get().recommendations.find(r => r.id === id);
    if (!rec) return;

    set({ isProcessing: true, currentStage: "Simulate" });
    const simResult = await MockAIProvider.simulate(rec);
    set({ activeSimulation: simResult, isProcessing: false });
  },

  approveRecommendation: async (id: string) => {
    const rec = get().recommendations.find(r => r.id === id);
    if (!rec) return;

    set({ isProcessing: true, currentStage: "Approve" });
    await new Promise(r => setTimeout(r, 400));
    set({ currentStage: "Execute" });
    await new Promise(r => setTimeout(r, 600));
    
    // Log decision
    const newLog: DecisionLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: rec.title,
      reason: rec.reasoning.expectedOutcome,
      confidence: rec.confidence,
      result: "Success",
      recommendationId: rec.id,
      playbackData: { sim: get().activeSimulation }
    };

    set({ currentStage: "Learn" });
    const stats = await MockAIProvider.evaluateDecision(newLog);

    set((state) => ({
      decisionLog: [newLog, ...state.decisionLog],
      learningStats: { ...state.learningStats, [rec.id]: stats },
      recommendations: state.recommendations.filter(r => r.id !== id),
      activeSimulation: null,
      isProcessing: false,
      currentStage: "Observe"
    }));
  },

  rejectRecommendation: (id: string) => {
    set((state) => ({
      recommendations: state.recommendations.filter(r => r.id !== id),
      activeSimulation: null
    }));
  },

  clearSimulation: () => set({ activeSimulation: null }),

  injectTelemetry: (newTelemetry) => set((state) => ({ 
    telemetry: { ...state.telemetry!, ...newTelemetry } 
  })),

  resetState: () => set({
    isProcessing: false,
    currentStage: "Observe",
    telemetry: initialTelemetry,
    hotspots: [],
    cityHealth: null,
    predictions: [],
    recommendations: [],
    decisionLog: [],
    activeSimulation: null
  })
}));
