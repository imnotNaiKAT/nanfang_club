@echo off
title Check Project Files

echo ========================================
echo   Checking Project Files
echo ========================================
echo.

echo Current directory:
cd
echo.

echo Checking if index.html exists:
if exist "index.html" (
    echo [OK] index.html found
) else (
    echo [ERROR] index.html NOT FOUND!
    echo Please make sure all HTML files are uploaded.
)

echo.
echo Checking server directory:
if exist "server\server.js" (
    echo [OK] server\server.js found
) else (
    echo [ERROR] server\server.js NOT FOUND!
)

echo.
echo Listing all files:
dir /b
echo.

echo ========================================
pause