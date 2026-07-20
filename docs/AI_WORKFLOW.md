# AI Workflow Pipeline

The core intelligence of NagarNetra AI is a continuous OODA-style loop (Observe, Orient, Decide, Act), implemented specifically for Smart City orchestration.

## The Pipeline

1. **Observe**
   The AI connects to the `TelemetryProvider`. It listens for spikes in IoT sensors, abnormal weather patterns, or active 911 dispatch calls. It normalizes this data into a continuous `CityHealthScore`.

2. **Analyze**
   When thresholds are breached (e.g., Congestion > 85%), the pipeline triggers. The AI cross-references the event location with surrounding nodes (Traffic Cameras, Bridges) to assess severity.

3. **Predict**
   The prediction engine extrapolates the current state 30 minutes into the future. If a blocked lane is observed, it calculates the gridlock ripple effect on adjacent sectors.

4. **Simulate**
   Before making a recommendation, the AI tests multiple mitigation strategies in an isolated sandbox (e.g., `Strategy A: Reroute 15% traffic`, `Strategy B: Optimize Signals to 90s Green`).

5. **Recommend**
   The best performing strategy is surfaced to the human operator in the AI Studio or Command Dashboard, complete with Confidence Score, Expected Impact (Time Saved, Carbon Reduced), and a detailed reasoning breakdown.

6. **Execute**
   Once the operator approves (or automatically in Demo Mode), the system dispatches commands back to the IoT layer to physically alter signal light timings and dispatch emergency services.

7. **Learn**
   The system logs the outcome in the Decision Log, simulating a reinforcement learning loop where successful mitigation strategies increase the confidence score of similar future recommendations.
