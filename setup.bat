@echo off
echo Setting up MTG Custom Set Editor...

echo.
echo Setting up Backend...
cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Setting up Frontend...
cd ..\frontend

echo Installing Node dependencies...
npm install

echo.
echo Setup complete!
echo.
echo To start the application, run: start.bat
echo Or manually start:
echo   1. Backend: cd backend ^&^& venv\Scripts\activate.bat ^&^& python app.py
echo   2. Frontend: cd frontend ^&^& npm start
echo.
pause
