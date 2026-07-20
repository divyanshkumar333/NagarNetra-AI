# Folder Structure

Following a feature-based structure to scale up to 50,000+ lines.

```
NagarNetra AI/
├── backend/                  # FastAPI Application
│   ├── main.py               # Entrypoint
│   └── requirements.txt      # Dependencies
├── docs/                     # Project Documentation
├── frontend/                 # Next.js 15 Application
│   ├── public/
│   ├── src/
│   │   ├── app/              # App Router Pages
│   │   │   ├── dashboard/
│   │   │   ├── digital-twin/
│   │   │   ├── incidents/
│   │   │   ├── simulation/
│   │   │   └── ...
│   │   ├── components/       # Reusable UI Components
│   │   │   ├── ui/           # Base shadcn/ui components
│   │   │   ├── shared/       # Shared composite components
│   │   │   └── layout/       # App shell layouts
│   │   ├── features/         # Feature-specific logic & components
│   │   │   ├── digital-twin/
│   │   │   ├── traffic/
│   │   │   └── incidents/
│   │   ├── hooks/            # Reusable React hooks
│   │   ├── lib/              # Utility functions
│   │   └── styles/           # Global styles & Tailwind config
│   └── package.json
├── start.bat                 # Local dev start script
└── stop.bat                  # Local dev stop script
```
