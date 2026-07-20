# NagarNetra AI Architecture

NagarNetra AI relies on a heavily decoupled, front-end intensive architecture designed to demonstrate enterprise scalability without requiring a complex backend setup for the hackathon.

## Core Pillars

1. **Feature-Sliced Design (FSD)**
   The `/src/features` directory isolates modules (Telemetry, AI Engine, Dashboard, Simulation, Digital Twin). Each feature manages its own State (Zustand), UI components, and types. This prevents monolithic UI logic and makes future backend connections extremely modular.

2. **Decoupled State Management**
   Zustand is used to manage massive multi-store global states without React Context re-render penalties.
   - `useTelemetryStore`: Ingests sensor data.
   - `useAIEngineStore`: Acts on telemetry thresholds to run analysis.
   - `useSimulationStore`: Overrides telemetry for crisis scenarios.
   - `useDigitalTwinStore`: Maps the logical state to the 3D WebGL render.

3. **Abstracted Data Providers**
   The Telemetry layer utilizes a `Provider` interface. Currently, `MockTelemetryProvider.ts` is injected, which continuously polls synthetic data. In production, this can be swapped identically with `KafkaTelemetryProvider.ts` without touching any UI code.

4. **Procedural Rendering Engine**
   The Digital Twin (React Three Fiber) does not load large assets. Instead, it reads the `useDigitalTwinStore` state and procedurally builds roads, vehicles, and weather geometry on the fly. This ensures sub-second load times and infinite scalability.

5. **Motion & UX Subsystems**
   Framer Motion governs all routing transitions and component unmounting. `sonner` manages the global Notification Bus, and `cmdk` handles cross-cutting user commands.
