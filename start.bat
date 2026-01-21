@echo off
echo ========================================
echo Starting SkillForge Services
echo ========================================
echo.
echo This will start:
echo - Backend API (Port 5000)
echo - Frontend UI (Port 5173)
echo - ML Engine (Port 8000)
echo.
echo Press Ctrl+C to stop all services
echo.
pause

npm run dev
