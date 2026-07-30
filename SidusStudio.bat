@echo off
chcp 65001 >nul
title Sidus Studio
cd /d "%~dp0"

:: Encontrar Node.js (duplo-clique nao herda sempre o PATH)
set "NODE_CMD="
where node >nul 2>&1 && set "NODE_CMD=node"
if not defined NODE_CMD if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_CMD if exist "%LocalAppData%\Programs\node\node.exe" set "NODE_CMD=%LocalAppData%\Programs\node\node.exe"

if not defined NODE_CMD (
    echo.
    echo  Node.js nao encontrado.
    echo  Instala em: https://nodejs.org  ^(versao LTS^)
    echo  Depois fecha e volta a abrir este ficheiro.
    echo.
    pause
    exit /b 1
)

if not exist "studio\launcher.cjs" (
    echo.
    echo  Pasta errada — este ficheiro tem de estar dentro de video-bot
    echo.
    pause
    exit /b 1
)

echo.
echo  Sidus Studio — a abrir no browser...
echo  Mantem esta janela aberta. Fecha para sair.
echo.

"%NODE_CMD%" studio\launcher.cjs
if errorlevel 1 (
    echo.
    echo  Erro ao iniciar. Tenta descarregar SidusStudio.exe do GitHub:
    echo  https://github.com/tiagosgama90-coder/video-bot/actions
    echo.
    pause
)
