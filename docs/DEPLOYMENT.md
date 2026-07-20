# Deployment Guide

Because NagarNetra AI is architected as a fully client-side Next.js 15 application utilizing mocked data providers, deploying the application for the hackathon is incredibly simple.

## Vercel Deployment (Recommended)

1. **Push to GitHub**: Ensure your repository is pushed to a public or private GitHub repository.
2. **Import Project**: Log into Vercel and click "Add New Project".
3. **Select Repository**: Select the `nagarnetra-ai` repository.
4. **Configure Settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. **Deploy**: Click Deploy. Vercel will automatically provision the edge network and serve the static/client assets.

## Docker Deployment

If you wish to run this on a generic cloud VPS (AWS EC2, DigitalOcean):

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t nagarnetra-ai .
docker run -p 3000:3000 nagarnetra-ai
```
