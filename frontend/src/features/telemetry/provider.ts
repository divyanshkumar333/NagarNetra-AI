import { TelemetryData } from "./types";

export interface TelemetryProvider {
  name: string;
  connect: (onData: (data: Partial<TelemetryData>) => void) => void;
  disconnect: () => void;
}
