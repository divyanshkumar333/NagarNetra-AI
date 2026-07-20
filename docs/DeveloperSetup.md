# Developer Setup

## Prerequisites
- Node.js 18+ (20+ recommended)
- Python 3.10+
- Git

## Quick Start (Windows)
Run the `start.bat` file in the root directory. It will:
1. Create a Python virtual environment.
2. Install Python dependencies (FastAPI, uvicorn, etc).
3. Install Node dependencies.
4. Start both the frontend and backend servers.
5. Open your browser.

## Manual Start
**Backend**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
