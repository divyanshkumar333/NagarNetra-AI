@echo off
setlocal

echo Stopping NagarNetra AI Services...

:: Stop Backend (uvicorn / python)
echo Killing Python backend processes...
taskkill /F /IM python.exe /T 2>NUL

:: Stop Frontend (node)
echo Killing Node frontend processes...
taskkill /F /IM node.exe /T 2>NUL

echo Services stopped successfully.
pause
