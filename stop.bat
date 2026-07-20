@echo off
setlocal
echo Shutting down NagarNetra AI...

:: Find and kill process on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if "%%a" NEQ "0" (
        echo Killing Frontend (PID %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: Find and kill process on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    if "%%a" NEQ "0" (
        echo Killing Backend (PID %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Shutdown complete.
pause
