@echo off
setlocal

:: Define colors
set "GREEN=[92m"
set "RED=[91m"
set "BLUE=[96m"
set "RESET=[0m"

echo %BLUE%====================================================%RESET%
echo %BLUE%     NagarNetra AI - Local Development Startup      %RESET%
echo %BLUE%====================================================%RESET%
echo.

:: 1. Check and Setup Backend
echo %GREEN%[1/4] Setting up Backend Environment...%RESET%
cd backend

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%Failed to create virtual environment. Ensure Python is installed.%RESET%
        exit /b 1
    )
)

echo Activating virtual environment and installing backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Failed to install backend dependencies.%RESET%
    exit /b 1
)

:: Start Backend in background
echo Starting FastAPI Backend...
start "NagarNetra Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..
echo.

:: 2. Check and Setup Frontend
echo %GREEN%[2/4] Setting up Frontend Environment...%RESET%
cd frontend

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%Failed to install npm dependencies. Ensure Node.js is installed.%RESET%
        exit /b 1
    )
)

:: Start Frontend in background
echo Starting Next.js Frontend...
start "NagarNetra Frontend" cmd /c "npm run dev"
cd ..
echo.

:: 3. Wait for services to start
echo %GREEN%[3/4] Waiting for services to initialize...%RESET%
timeout /t 5 /nobreak > nul

:: 4. Open Browser
echo %GREEN%[4/4] Opening Application in Browser...%RESET%
start http://localhost:3000

echo.
echo %BLUE%====================================================%RESET%
echo %GREEN%NagarNetra AI is running!%RESET%
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo %BLUE%====================================================%RESET%
echo To stop services, run stop.bat
echo.
pause
