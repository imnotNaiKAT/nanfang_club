@echo off
title Nanfang Club Server

echo Starting Nanfang Club Server...
echo.

:: Go to server directory
cd /d "%~dp0server"

:: Check if package.json exists
if not exist "package.json" (
    echo [ERROR] Cannot find server directory!
    echo Please make sure this script is in the project root folder.
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Start server
echo Starting server...
echo.
node server.js

pause