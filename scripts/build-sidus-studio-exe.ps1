# Compila SidusStudio.exe (Windows) — nao precisa de Electron
# Uso: npm run studio:build-exe

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $raiz

Write-Host ""
Write-Host "=== Compilar SidusStudio.exe ===" -ForegroundColor Cyan

if (-not (Test-Path "dist-studio")) {
    New-Item -ItemType Directory -Path "dist-studio" | Out-Null
}

Write-Host "A instalar pkg..." -ForegroundColor White
npm install pkg@5.8.1 --no-save

Write-Host "A compilar (pode demorar 1-2 min)..." -ForegroundColor White
npx pkg studio/launcher.cjs `
  --targets node18-win-x64 `
  --output dist-studio/SidusStudio.exe `
  --assets studio/index.html `
  --assets studio/styles.css `
  --assets studio/renderer.js `
  --assets studio/api-client.js

if (-not (Test-Path "dist-studio/SidusStudio.exe")) {
    Write-Host "Falha na compilacao pkg." -ForegroundColor Red
    exit 1
}

Copy-Item -Force dist-studio/SidusStudio.exe (Join-Path $raiz "SidusStudio.exe")
Write-Host ""
Write-Host "Pronto: SidusStudio.exe na pasta do projeto" -ForegroundColor Green
Write-Host "Duplo-clique para abrir (mantem na pasta sidusastro-video-bot)" -ForegroundColor Green
