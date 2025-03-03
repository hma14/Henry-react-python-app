@echo off

echo Activating virtual environment...
call F:\ai.lottotry.com\backend\app>venv\scripts\activate

echo Starting Waitress server...
waitress-serve --listen=ep.lottotry.com:5001 app:app
pause
