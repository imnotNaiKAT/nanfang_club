@echo off
title Nanfang Club - Quick Start

echo ========================================
echo   Nanfang Club - Quick Start
echo ========================================
echo.

:: Save current directory
set PROJECT_DIR=%~dp0
echo Project directory: %PROJECT_DIR%
echo.

:: Check if index.html exists
if not exist "%PROJECT_DIR%index.html" (
    echo [ERROR] index.html not found!
    echo.
    echo Please make sure:
    echo 1. This script is in the project root folder
    echo 2. All HTML files are uploaded
    echo 3. Folder structure is correct
    echo.
    pause
    exit /b 1
)

echo [OK] Found index.html
echo.

:: Go to server directory
cd /d "%PROJECT_DIR%server"

:: Check server.js
if not exist "server.js" (
    echo [ERROR] server.js not found!
    pause
    exit /b 1
)

echo [OK] Found server.js
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Start server
echo Starting server...
echo.
echo ========================================
echo   Server is starting...
echo   Please wait...
echo ========================================
echo.

start "" http://localhost:3000

node server.js

pause