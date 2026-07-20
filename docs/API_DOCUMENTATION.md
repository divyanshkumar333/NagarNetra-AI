# NagarNetra AI: API Documentation

*Note: Since NagarNetra AI currently runs fully client-side using a Mock Provider architecture for the hackathon, this document describes the internal Store APIs and Provider interfaces rather than a REST backend.*

## Telemetry Provider Interface
The application relies on an agnostic `TelemetryProvider` interface. You can replace the `MockTelemetryProvider` with a `WebSocketProvider` in production.

```typescript
export interface TelemetryProvider {
  connect(): void;
  disconnect(): void;
  onUpdate(callback: (data: TelemetryData) => void): void;
}
```

## AI Engine Store Actions
The `useAIEngineStore` exports several commands capable of being triggered by external APIs or UI events.

- `triggerPipeline()`: Forces the AI to move from `idle` to `analyzing`.
- `simulateRecommendation(id: string)`: Runs a fast-forward mathematical simulation of the impact of a given recommendation.
- `approveRecommendation(id: string)`: Commits the recommendation, updates city health, and moves it to the decision log.

## Simulation Store Controls
The `useSimulationStore` exposes controls for the presentation Crisis Simulation.

- `startSimulation(scenarioId: string, demoMode: boolean)`: Initializes a crisis event.
- `resetSimulation()`: Wipes all states and resets the city to nominal conditions.
