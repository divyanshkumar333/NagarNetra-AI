<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=NagarNetra+AI" alt="NagarNetra AI Logo">
  
  # NagarNetra AI
  **The Intelligent Eye of the City**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Zustand](https://img.shields.io/badge/Zustand-4.0-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![React Three Fiber](https://img.shields.io/badge/R3F-8.0-black?style=for-the-badge&logo=react)](https://docs.pmnd.rs/react-three-fiber/)
  
  *An Enterprise Smart City Operations Platform & AI Copilot for Traffic Management*
</div>

<br />

## 🚀 Overview

**NagarNetra AI** (नगरनेत्र AI) is a next-generation Smart City Command Center designed to observe, analyze, and optimize urban infrastructure in real-time. Built entirely with Next.js 15 and React Three Fiber, it replaces fragmented legacy city dashboards with a unified, Palantir Gotham-inspired AI intelligence layer. 

NagarNetra AI doesn't just display data—it *understands* it. By continuously observing a procedural 3D Digital Twin, the AI engine predicts traffic congestion, simulates rerouting strategies, and autonomously resolves crises before gridlock occurs.

## ✨ Features

- **Live Enterprise Dashboard**: A glassmorphism, Framer Motion-powered Command Center offering real-time KPI tracking (Congestion, Signal Efficiency, Active Incidents).
- **Procedural 3D Digital Twin**: A fully living, code-generated 3D city (No GLB models used). Watch intelligent agents (cars, emergency vehicles) navigate responsive traffic grids in real-time.
- **AI Neural Pipeline**: A continuous loop of `Observe → Analyze → Predict → Simulate → Recommend → Execute`. The AI evaluates telemetry and issues operator-approved actions.
- **Crisis Simulation Engine**: Trigger real-world disasters (e.g., Major Accidents, Heavy Rain, VIP Convoys) and watch the AI autonomously reroute traffic and adjust signals.
- **Real-Time IoT Telemetry**: Mock-ready provider interfaces simulating thousands of city sensors (AQI, Bridge Strain, Grid Power, Camera Feeds) that automatically inject data into the AI state.
- **Enterprise Product Polish**: Global `Ctrl+K` Command Palette, system-wide shortcuts, professional Error Boundaries, and unified Sonner Toasts.

## 🏗 Architecture

NagarNetra AI uses a purely client-side decoupled architecture perfect for rapid hackathon deployment and future backend integration:
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **State Management**: Zustand (Multi-store architecture: `useSimulationStore`, `useDigitalTwinStore`, `useAIEngineStore`, `useTelemetryStore`)
- **3D Rendering**: Three.js + React Three Fiber + Drei

*(See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for deeper insights.)*

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/nagarnetra-ai.git
   cd nagarnetra-ai/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the Command Center.

## 📸 Screenshots

*(Add screenshots here for Devpost/GitHub)*
- `Dashboard_Overview.png`
- `Digital_Twin_3D.png`
- `AI_Studio_Pipeline.png`
- `Crisis_Simulation.png`
- `IoT_Telemetry.png`

## 🔮 Future Scope

- **Real Kafka/MQTT Integration**: Replacing the `MockTelemetryProvider` with a real-time event streaming pipeline to ingest actual city hardware feeds.
- **LLM-Driven "Grill Me" Mode**: Allow city operators to interrogate the AI's reasoning via voice or natural language.
- **V2X (Vehicle-to-Everything)**: Direct API integration to broadcast speed limits and rerouting logic directly to connected autonomous vehicles.
