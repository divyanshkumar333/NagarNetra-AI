export type Category = "Traffic" | "Emergency" | "Infrastructure" | "Weather" | "Public Safety" | "Road Maintenance";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Telemetry {
  timestamp: string;
  vehicleCounts: Record<string, number>; // roadId -> count
  congestion: Record<string, number>; // roadId -> index (0-100)
  signalStates: Record<string, "green" | "yellow" | "red">; // intersectionId -> state
  weather: string;
  activeAccidents: string[];
  emergencyVehiclesActive: number;
  roadClosures: string[];
}

export interface Hotspot {
  id: string;
  location: [number, number]; // x, z coordinates for Digital Twin mapping
  severity: number; // 0-100
  type: string;
  description: string;
}

export interface Prediction {
  timeframeMinutes: number; // e.g., 5, 15, 30
  predictedCongestionSpread: string[]; // affected road IDs
  travelTimeIncreaseSeconds: number;
  accidentImpact: string;
  emergencyResponseDelaysSeconds: number;
  confidence: number; // 0-100
}

export interface AIReasoning {
  observation: string;
  analysis: string;
  prediction: string;
  expectedOutcome: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: Category;
  detailedExplanation: string;
  reasoning: AIReasoning;
  confidence: number; // 0-100
  estimatedImpact: string; // e.g., "Reduce congestion by 15%"
  affectedIntersections: string[];
  estimatedTimeSavedMinutes: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  riskLevel: RiskLevel;
  carbonReductionKg: number;
  emergencyImpact: string;
}

export interface SimulationResult {
  recommendationId: string;
  currentStateMetrics: Record<string, number>;
  predictedStateMetrics: Record<string, number>;
  expectedImprovementPercentage: number;
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  action: string;
  reason: string;
  confidence: number;
  result: "Success" | "Partial" | "Failure" | "Pending";
  recommendationId?: string;
  playbackData?: Record<string, unknown>; // To store snapshot for playback
}

export interface CityHealth {
  score: number; // 0-100
  factors: {
    congestion: number;
    signalEfficiency: number;
    emergencyResponse: number;
    incidents: number;
    weather: number;
  };
}

export interface LearningStats {
  previousSuccessRate: number; // 0-100
  averageImprovement: number; // percentage
  recommendedAgain: boolean;
  operatorAcceptanceRate: number; // 0-100
}

export type PipelineStage = "Observe" | "Analyze" | "Predict" | "Simulate" | "Recommend" | "Approve" | "Execute" | "Learn";

export interface AIProvider {
  name: string;
  processTelemetry: (telemetry: Telemetry) => Promise<{
    hotspots: Hotspot[];
    health: CityHealth;
    predictions: Prediction[];
    recommendations: Recommendation[];
  }>;
  simulate: (recommendation: Recommendation) => Promise<SimulationResult>;
  evaluateDecision: (log: DecisionLogEntry) => Promise<LearningStats>;
}
