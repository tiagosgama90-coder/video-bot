@echo off
title Sidus Studio
cd /d "%~dp0"
echo.
echo   Sidus Studio - a abrir no browser...
echo   Fecha esta janela para sair.
echo.
node studio\launcher.cjs
if errorlevel 1 pause
