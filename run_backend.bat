@echo off
echo ===================================================
echo   Starting AakashaVani (WeatherGPT) Backend API
echo   FastAPI Server on http://localhost:8000
echo ===================================================
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
