# 🏆 Hackathon Judge's Review Guide

Welcome to NagarNetra AI! If you have 3 minutes to evaluate our project, follow this exact click-path to see the most impressive features of our platform.

## 1. Launching the App
Our dedication to a premium developer experience starts immediately. Run `start.bat` in the root folder. You won't see a messy terminal dump—you'll see a custom-built Node.js TUI (Terminal User Interface) orchestrator that caches dependencies and manages the microservices flawlessly.

## 2. The 3D Digital Twin (Performance & Scale)
When the browser opens `http://localhost:3000`:
- **Watch the Landing Page**: NagarNetra AI automatically opens directly into the **3D Digital Twin** rather than a flat dashboard.
- **The Construction Intro**: Watch the buildings procedurally grow and rise out of the ground in sync with the cinematic camera flyover for the first 7 seconds (you can click or drag to skip immediately).
- **Look at the traffic**: You are seeing 600+ vehicles navigating a mathematical spline graph in real-time. Notice they don't clip through buildings and they queue at intersections.
- **Why it matters**: We achieved 60 FPS in a browser by bypassing React's render lifecycle for the vehicles, writing directly to `InstancedMesh` matrix buffers.
- **Action**: Use your mouse to zoom, pan, and rotate. Notice the smooth, cinematic damping on the camera (not linear lerping!).

## 3. Triggering a Crisis (The AI Pipeline)
- **Action**: In the bottom left `Control Panel`, click on **"Major Accident"** or **"Heavy Rain"**.
- Watch the **AI Studio** tab on the left.
- You'll see the AI Pipeline light up: **Observe → Analyze → Predict → Recommend**. This isn't just a static dashboard; it visualizes the agentic workflow.

## 4. Interacting with the AI
- **Action**: Click the **Recommendation Card** that appears (e.g., "Reroute Traffic & Adjust Signals").
- **Action**: Click the **"Simulate"** button. This demonstrates how an operator can safely test an AI's suggestion against the Digital Twin before applying it to the real world.
- **Action**: Click **"Approve"**. Watch the Smart City Score stabilize and the red "AI Hotspot" heatmaps dissipate as traffic normalizes.

## 5. Easter Eggs & Polish
- Change the **Time of Day** in the Control Panel to "Night" or "Sunset". Notice the beautiful lighting, shadows, and stars.
- Change the **Weather** to "Rain" or "Fog" to see volumetric clouds.
- Click the **AI Drone Patrol** camera preset to follow the autonomous security drone flying through the skyscrapers.
- Click any **Building** to open the `Inspector Panel` (sliding in from the right) showing mock telemetry data.
