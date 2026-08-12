@echo off
title Nanfang Club - Deployment Tool

echo.
echo ========================================
echo   Nanfang Club - Deployment Tool
echo ========================================
echo.

:: Check admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

set PORT=3000
set INSTALL_DIR=%~dp0
set DATA_DIR=%INSTALL_DIR%data
set UPLOADS_DIR=%INSTALL_DIR%uploads

echo [STEP 1/5] Checking Node.js...

:: Check Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Node.js not found. Please install Node.js from:
    echo https://nodejs.org/
    echo.
    echo Download and install Node.js v18 or higher, then run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node -v

echo.
echo [STEP 2/5] Creating directories...

:: Create directories
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%UPLOADS_DIR%" mkdir "%UPLOADS_DIR%"
if not exist "%UPLOADS_DIR%\images" mkdir "%UPLOADS_DIR%\images"
if not exist "%UPLOADS_DIR%\avatars" mkdir "%UPLOADS_DIR%\avatars"
if not exist "%UPLOADS_DIR%\posts" mkdir "%UPLOADS_DIR%\posts"

echo [OK] Directories created

echo.
echo [STEP 3/5] Installing dependencies...

cd /d "%INSTALL_DIR%server"

if not exist "package.json" (
    echo [INFO] Initializing project...
    call npm init -y
)

call npm install

echo [OK] Dependencies installed

echo.
echo [STEP 4/5] Configuring firewall...

:: Add firewall rule
netsh advfirewall firewall add rule name="NanfangClub-HTTP" dir=in action=allow protocol=tcp localport=%PORT% >nul 2>&1
netsh advfirewall firewall add rule name="NanfangClub-HTTP" dir=out action=allow protocol=tcp localport=%PORT% >nul 2>&1

echo [OK] Firewall configured

echo.
echo [STEP 5/5] Starting server...

:: Stop existing Node.js processes
taskkill /f /im node.exe >nul 2>&1

:: Start server
cd /d "%INSTALL_DIR%server"
start "Nanfang Club Server" cmd /c "node server.js"

:: Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

:: Test server
curl -s http://localhost:%PORT% >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Server started successfully
) else (
    echo [WARNING] Server might not be running. Please check the server window.
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo   Local: http://localhost:%PORT%
echo   Network: http://YOUR_IP:%PORT%
echo.
echo   Data: %DATA_DIR%
echo   Uploads: %UPLOADS_DIR%
echo.
echo ========================================
echo.

:: Open browser
echo Press any key to open browser...
pause >nul
start http://localhost:%PORT%

exit /b 0