from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(
    title="NagarNetra AI Backend",
    description="The Intelligent Eye of the City - Backend Services",
    version="0.1.0",
)

# CORS configuration – allow the frontend origin via env var or fallback to all origins (development)
origins: list[str] = []
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    origins.append(frontend_origin)
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to ensure the backend is running."""
    return HealthResponse(
        status="ok",
        message="NagarNetra AI backend is running.",
        version="0.1.0",
    )

# Vercel serverless handler (Mangum) – exported as `handler`
from mangum import Mangum
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    # When running locally, use the module path `backend.main:app`
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
