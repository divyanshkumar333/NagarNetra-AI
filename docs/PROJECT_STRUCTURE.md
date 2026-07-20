# Project Structure

```
nagarnetra-ai/
├── frontend/
│   ├── public/              # Static assets, icons, logos
│   ├── src/
│   │   ├── app/             # Next.js 15 App Router (Pages & Layouts)
│   │   │   ├── (routes)/    # ai-studio, digital-twin, telemetry, etc.
│   │   │   ├── layout.tsx   # Global Providers (Toaster, Command Palette)
│   │   │   └── loading.tsx  # Global Skeleton
│   │   ├── components/      # Shared UI Components
│   │   │   ├── layout/      # AppShell, Sidebar, Header
│   │   │   └── ui/          # shadcn components, Framer Motion wrappers
│   │   ├── features/        # Feature-Sliced Modules
│   │   │   ├── ai-engine/       # Neural Pipeline, AI Workflow UI
│   │   │   ├── dashboard/       # KPI grids, Analytics charts
│   │   │   ├── digital-twin/    # React Three Fiber Procedural City
│   │   │   ├── simulation/      # Crisis Scenario Orchestrator
│   │   │   └── telemetry/       # IoT Mock Provider, Camera Networks
│   │   ├── hooks/           # Global React Hooks
│   │   └── lib/             # Utilities (Tailwind cn)
│   ├── tailwind.config.ts   # Design System Tokens
│   └── package.json         # Dependencies
└── docs/                    # Architecture & Presentation Assets
```
