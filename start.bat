@echo off
echo Starting MTG Custom Set Editor...

echo.
echo Starting Flask Backend...
start "Flask Backend" cmd /k "cd backend && python app.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
