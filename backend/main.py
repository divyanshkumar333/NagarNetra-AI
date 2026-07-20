from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="NagarNetra AI Backend",
    description="The Intelligent Eye of the City - Backend Services",
    version="0.1.0"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
        version="0.1.0"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
