# Repara instalação do Electron no Windows (binário em falta após npm install)
# Uso: npm run studio:fix
#   ou: powershell -ExecutionPolicy Bypass -File scripts/reparar-electron.ps1

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $raiz

Write-Host ""
Write-Host "=== Reparar Electron (Sidus Studio) ===" -ForegroundColor Cyan
Write-Host ""

$ignoreScripts = npm config get ignore-scripts 2>$null
if ($ignoreScripts -eq "true") {
    Write-Host "AVISO: npm ignore-scripts=true — o Electron nunca descarrega sozinho." -ForegroundColor Yellow
    Write-Host "A corrigir: npm config set ignore-scripts false" -ForegroundColor Yellow
    npm config set ignore-scripts false
}

$electronDir = Join-Path $raiz "node_modules\electron"
$pathTxt = Join-Path $electronDir "path.txt"

if (Test-Path $pathTxt) {
    Write-Host "A tentar re-download com install.js..." -ForegroundColor White
    $env:force_no_cache = "true"
    node (Join-Path $electronDir "install.js")
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Electron OK. Corre: npm run studio" -ForegroundColor Green
        exit 0
    }
}

Write-Host "Instalação incompleta — a reinstalar electron..." -ForegroundColor Yellow
if (Test-Path $electronDir) {
    Remove-Item -Recurse -Force $electronDir
}

npm install electron@35.7.5 --save-dev --foreground-scripts
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Falhou. Tenta:" -ForegroundColor Red
    Write-Host "  1. Desativa antivirus temporariamente" -ForegroundColor Red
    Write-Host "  2. Corre CMD como administrador" -ForegroundColor Red
    Write-Host "  3. npm cache clean --force && npm install" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Electron instalado. Corre: npm run studio" -ForegroundColor Green
