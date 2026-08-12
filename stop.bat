@echo off
title Stop Nanfang Club Server

echo Stopping Nanfang Club Server...

taskkill /f /im node.exe >nul 2>&1

if %errorLevel% equ 0 (
    echo Server stopped successfully.
) else (
    echo No running server found.
)

timeout /t 2 /nobreak >nul