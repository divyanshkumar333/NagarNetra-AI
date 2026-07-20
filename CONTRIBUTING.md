# Contributing to NagarNetra AI

Thank you for your interest in contributing to NagarNetra AI! 

As this project was primarily built for a hackathon, we welcome community PRs to expand its capabilities into a fully production-ready Smart City OS.

## Development Workflow

1. **Fork & Clone**: Fork the repo and clone it locally.
2. **Install**: Run `npm install` inside the `/frontend` directory.
3. **Branch**: Create a feature branch (`git checkout -b feature/your-feature-name`).
4. **Develop**: We strictly use Next.js 15 App Router, TailwindCSS, and Zustand. 
5. **Linting**: Run `npm run lint` before committing. Ensure there are zero TypeScript errors.
6. **Commit**: Use Conventional Commits (e.g., `feat: add new IoT sensor`).
7. **Push & PR**: Push to your fork and submit a Pull Request.

## Architecture Rules

- **No GLB Models**: The `Digital Twin` must remain purely procedural (React Three Fiber code). Do not introduce heavy 3D assets.
- **Decoupled State**: Never put complex logic inside UI components. Push logic to the `features/` specific Zustand stores.
- **Enterprise Design**: Stick to the dark glassmorphism theme defined in Tailwind. Maintain a premium "Palantir/Command Center" aesthetic without flashy, distracting colors.

## Code of Conduct

Please maintain a professional and welcoming environment in issues and PR discussions.
