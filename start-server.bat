@echo off
chcp 65001 >nul 2>&1
title Nanfang Club Server

echo.
echo ========================================
echo   Nanfang Club - Starting Server
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js:
node -v
echo.

cd /d "%~dp0server"

if not exist "server.js" (
    echo [ERROR] server.js not found in: %cd%
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Creating directories...
if not exist "..\data" mkdir "..\data"
if not exist "..\uploads" mkdir "..\uploads"
if not exist "..\uploads\images" mkdir "..\uploads\images"
if not exist "..\uploads\avatars" mkdir "..\uploads\avatars"

echo.
echo Starting server...
echo.

start "Nanfang Club Server" cmd /c "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Server should be running!
echo   Local:  http://localhost:3000
echo   Network: http://YOUR_IP:3000
echo ========================================
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:3000