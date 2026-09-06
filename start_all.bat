@echo off
echo ================================================================
echo        🌦️ Launching AakashaVani (WeatherGPT) Full-Stack MVP
echo   MoES / India Meteorological Department Conversational AI
echo ================================================================
echo.

start "AakashaVani Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak > nul

start "AakashaVani Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo Backend API : http://localhost:8000
echo Frontend UI : http://localhost:5173
echo.
pause
