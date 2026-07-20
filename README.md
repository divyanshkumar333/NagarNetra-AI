<div align="center">
  <img src="https://via.placeholder.com/150/0f172a/ffffff?text=NagarNetra+AI" alt="NagarNetra AI Logo" width="150" height="150">
  
  # NagarNetra AI
  **The Intelligent Eye of the City**
  
  An autonomous Smart City operations center combining a 60 FPS Procedural Digital Twin with a predictive AI reasoning engine.

  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-r185-white?logo=three.js&logoColor=black)](https://threejs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

---

## 🏙️ Overview
NagarNetra AI (नगरनेत्र AI) transforms raw urban telemetry into actionable intelligence. Moving beyond static dashboards, it provides city operators with a **living, breathing 3D Digital Twin** tightly integrated with a 6-step AI reasoning pipeline capable of detecting anomalies, simulating outcomes, and executing intelligent infrastructure changes in real-time.

Designed for the modern smart city, it scales seamlessly to handle thousands of concurrent entities (vehicles, pedestrians, sensors) using highly optimized `InstancedMesh` rendering in WebGL.

---

## ✨ Key Features
- **Procedural 3D Digital Twin**: A fully dynamic 60 FPS city rendered in the browser. Features thousands of individually tracked vehicles, a bustling pedestrian system, and autonomous AI patrol drones.
- **Cinematic AI Reasoning Engine**: A transparent 6-step pipeline (Observe → Analyze → Predict → Recommend → Simulate → Execute) that explains exactly *why* the AI is making decisions.
- **Crisis Simulation Engine**: Trigger localized emergencies (accidents, floods, VIP convoys) and watch the AI dynamically reroute traffic and dispatch emergency vehicles.
- **Real-Time Telemetry Layer**: Ingests and visualizes mock data from thousands of IoT sensors across the grid.
- **Enterprise-Grade UI**: A highly polished, Palantir-inspired dark mode interface built with React, TailwindCSS, and Framer Motion.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 16, React 19, TailwindCSS 4, Framer Motion
- **3D Engine**: Three.js, React Three Fiber, React Three Drei
- **Backend**: FastAPI, Python 3.10+, Uvicorn
- **State Management**: Zustand
- **Launcher**: Custom Node.js TUI Orchestrator

---

## 🚀 Quick Start
NagarNetra AI features a custom-built, zero-configuration dependency launcher.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/downloads/) (3.9+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/divyanshkumar333/NagarNetra-AI.git
   cd NagarNetra-AI
   ```
2. Start the unified launcher:
   ```bash
   start.bat
   ```
   *The launcher will automatically verify your environment, install any missing `npm` or `pip` dependencies using a smart cache, spawn the backend/frontend processes, and open your browser.*

### Developer Console
Inside the `start.bat` terminal:
- Press `D` to toggle streaming logs.
- Press `R` to restart the UI or `Shift+R` to restart the API.
- Press `Q` to gracefully shut down all services.

---

## 🧠 The AI Workflow
Our platform doesn't just display data; it thinks.
See [AI_WORKFLOW.md](docs/AI_WORKFLOW.md) for a deep dive into the engine.

---

## 📐 Architecture
See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details on our WebGL optimization strategies, state management, and API design.

---

## 🏆 Hackathon Submission
Built with ❤️ for the Hackathon.
For judges, please refer to the [JUDGE_GUIDE.md](docs/JUDGE_GUIDE.md) for a streamlined walkthrough of the most impressive features and easter eggs.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
