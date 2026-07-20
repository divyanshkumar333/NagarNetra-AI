export type ScenarioType = 
  | "Major Traffic Accident"
  | "Ambulance Emergency"
  | "VIP Convoy"
  | "Road Construction"
  | "Heavy Rain"
  | "Flash Flood"
  | "Public Event / Festival"
  | "City-wide Rush Hour";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type PlaybackSpeed = 1 | 2 | 5;

export interface ScenarioDefinition {
  id: string;
  title: ScenarioType;
  description: string;
  difficulty: string;
  expectedDuration: string;
  primaryObjective: string;
  estimatedImpact: string;
  defaultSeverity: Severity;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: "observation" | "ai" | "action" | "outcome";
}

export interface SimulationStats {
  initialHealth: number;
  finalHealth: number;
  timeSavedMinutes: number;
  congestionReductionPercentage: number;
  emergencyResponseImprovementPercentage: number;
  fuelSavedLiters: number;
  carbonReductionKg: number;
  operatorDecisions: number;
  aiAccuracyPercentage: number;
  recommendationAcceptanceRate: number;
}
