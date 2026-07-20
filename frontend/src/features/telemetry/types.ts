export type SensorStatus = "online" | "offline" | "warning" | "critical" | "maintenance";

export interface SensorBase {
  id: string;
  location: string;
  coordinates: [number, number]; // [x, z] for Digital Twin mapping
  status: SensorStatus;
  battery: number;
  lastMaintenance: string;
  signalQuality: number;
}

export interface TrafficCamera extends SensorBase {
  type: "camera";
  vehicleCount: number;
  averageSpeed: number;
  aiDetectedIncidents: string[];
}

export interface EnvironmentSensor extends SensorBase {
  type: "environment";
  aqi: number;
  temperature: number;
  humidity: number;
  noise: number; // dB
  rainfall: number; // mm/h
  windSpeed: number; // km/h
}

export interface InfrastructureNode extends SensorBase {
  type: "infrastructure";
  subType: "traffic_light" | "bridge" | "power" | "comms";
  load: number; // percentage
  temperature?: number;
}

export type EmergencyPriority = "Low" | "Medium" | "High" | "Critical";
export type EmergencyStatus = "new" | "acknowledged" | "resolved";

export interface EmergencyEvent {
  id: string;
  timestamp: string;
  type: "911 Call" | "Accident" | "Fire" | "Medical" | "Flood Warning" | "Police Dispatch";
  location: string;
  priority: EmergencyPriority;
  status: EmergencyStatus;
  description: string;
}

export interface TelemetryHealth {
  connectedSensors: number;
  offlineSensors: number;
  warningSensors: number;
  activeStreams: number;
  lastSyncTime: string;
}

export interface TelemetryData {
  cameras: TrafficCamera[];
  environment: EnvironmentSensor[];
  infrastructure: InfrastructureNode[];
  emergencies: EmergencyEvent[];
  health: TelemetryHealth;
}
