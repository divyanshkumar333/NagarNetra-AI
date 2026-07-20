# Architecture

NagarNetra AI uses a decoupled client-server architecture to provide robust performance and scaling capabilities for enterprise use.

## Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with enterprise-grade dark theme tokens.
- **Component Library**: shadcn/ui.
- **3D / Simulation**: React Three Fiber (Three.js)
- **Animations**: Framer Motion

## Backend
- **Framework**: FastAPI (Python)
- **API**: RESTful communication, preparing for WebSocket support for real-time telemetry.

## Directory Structure
Follows a feature-based folder structure to ensure that the project can scale to 50,000+ lines of code without architectural changes. Every major feature is independently extensible.
