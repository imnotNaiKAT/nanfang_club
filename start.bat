@echo off
title Start Nanfang Club Server

echo Starting Nanfang Club Server...

cd /d "%~dp0server"
start "Nanfang Club Server" cmd /c "node server.js"

timeout /t 3 /nobreak >nul
echo Server started!
echo Visit: http://localhost:3000

timeout /t 3 /nobreak >nul
start http://localhost:3000