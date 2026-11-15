@echo off
echo ======================================================================
echo    AURA - ENVIRONMENTAL INTELLIGENCE MOBILE APPLICATION (MILESTONE 1)
echo ======================================================================
echo.
echo Starting Backend (FastAPI on http://localhost:8000)...
start "AURA Backend API" cmd /k "cd backend && python run.py"

echo.
echo Starting Mobile Application (Expo Web/Native on http://localhost:8081)...
start "AURA Mobile App" cmd /k "cd mobile && npx expo start --web"

echo.
echo Both services launched in separate windows!
echo - Backend API Docs: http://localhost:8000/docs
echo - Mobile Application Preview: http://localhost:8081
echo ======================================================================
pause

