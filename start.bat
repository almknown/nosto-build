@echo off
title Nutrient Radar
cd /d "%~dp0"

echo Starting Nutrient Radar...
echo.

:: Start the dev server and open browser
start "" http://localhost:3000/radar
npm run dev

pause
