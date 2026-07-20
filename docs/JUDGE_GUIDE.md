# Judge Guide: Where to Click

Welcome judges! NagarNetra AI is a highly interactive application. We recommend exploring it in the following order:

## 1. Global Navigation (`Ctrl+K`)
At any point, press `Ctrl+K` to open the Command Palette. This represents the enterprise feel of our software, allowing instant global search. 

## 2. The Dashboard (`/`)
- Note the **glassmorphism** styling and **Framer Motion** stagger animations upon page load.
- Look at the top KPI cards.
- The Traffic Overview chart and Incident Timeline are driven by the internal Zustand AI stores.

## 3. Real-Time Telemetry Layer (`/telemetry`)
- **Press Ctrl+K -> IoT Telemetry**
- This page consumes a simulated hardware feed ticking every 2 seconds.
- Look at the **Camera Center**: These aren't static images; they are lightweight CSS/Motion components simulating live vehicle tracking.
- **Click** on any Environmental or Infrastructure sensor (e.g., AQI, Power Node) to open the `SensorDiagnosticsModal`.

## 4. The Digital Twin (`/digital-twin`)
- **Press Ctrl+K -> Digital Twin**
- **Pan and Zoom**: Click and drag to orbit the city. Use the scroll wheel to zoom.
- Note that **zero external 3D models (GLB/GLTF)** were used. The roads, cars, and buildings are entirely generated via code.
- Wait a few seconds at intersections to watch the procedural traffic lights change and the procedural cars brake and accelerate.

## 5. The Grand Finale: Crisis Simulation (`/simulation`)
- **Press Ctrl+K -> Simulation Engine**
- Click **"Demo (Auto-Pilot)"** on the *Major Traffic Accident* scenario.
- Take your hands off the keyboard and watch.
- You will see the AI timeline automatically progress, global notifications fire, and the system intelligently resolve the accident by rerouting traffic. 
