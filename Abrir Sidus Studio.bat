@echo off
chcp 65001 >nul
cd /d "%~dp0"

if exist "SidusStudio.exe" (
    start "" "SidusStudio.exe"
    exit /b 0
)

if exist "SidusStudio.bat" (
    start "" "SidusStudio.bat"
    exit /b 0
)

echo Coloca SidusStudio.exe nesta pasta ou corre git pull.
pause
