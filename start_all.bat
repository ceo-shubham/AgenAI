@echo off
echo ========================================================
echo   Launching HireFlow - AI Candidate Screening Agent
echo ========================================================

start "HireFlow Backend" cmd /k "cd backend && python main.py"
start "HireFlow Frontend" cmd /k "cd frontend && npm run dev"

echo Services launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
