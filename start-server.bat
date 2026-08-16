@echo off
title Nanfang Club Server

echo.
echo ========================================
echo   Nanfang Club - Starting Server
echo ========================================
echo.

cd /d "%~dp0server"

if not exist "server.js" (
    echo [ERROR] server.js not found in: %cd%
    echo Please make sure this script is in the project root.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.

start "Nanfang Club Server" cmd /c "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Server should be starting...
echo   Visit: http://localhost:3000
echo ========================================
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:3000