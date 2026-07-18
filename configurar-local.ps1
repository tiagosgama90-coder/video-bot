# Configuração local do SidusAstro Video Bot (corre uma vez)
# Uso: .\configurar-local.ps1

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot
Set-Location $raiz

Write-Host ""
Write-Host "=== Configuracao local SidusAstro Video Bot ===" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $raiz ".env"
$firebasePath = Join-Path $raiz "firebase-admin.json"

if (-not (Test-Path $envPath)) {
    Copy-Item (Join-Path $raiz ".env.example") $envPath
    Write-Host "Criado .env a partir de .env.example" -ForegroundColor Green
}

function Atualizar-Env($chave, $valor) {
    $linhas = Get-Content $envPath -Encoding UTF8
    $novas = @()
    $feito = $false
    foreach ($l in $linhas) {
        if ($l -match "^$chave=") {
            $novas += "$chave=$valor"
            $feito = $true
        } else {
            $novas += $l
        }
    }
    if (-not $feito) { $novas += "$chave=$valor" }
    $novas | Set-Content $envPath -Encoding UTF8
}

Write-Host "Precisas de 3 valores dos GitHub Secrets do repo sidusastro-video-bot." -ForegroundColor Yellow
Write-Host "GitHub > Settings > Secrets and variables > Actions" -ForegroundColor Yellow
Write-Host "https://github.com/tiagosgama90-coder/sidusastro-video-bot/settings/secrets/actions" -ForegroundColor DarkGray
Write-Host ""

$buffer = Read-Host "1/3 Cola o BUFFER_ACCESS_TOKEN (ou Enter para manter o atual)"
if ($buffer.Trim()) { Atualizar-Env "BUFFER_ACCESS_TOKEN" $buffer.Trim() }

$azure = Read-Host "2/3 Cola o AZURE_SPEECH_KEY (ou Enter para manter o atual)"
if ($azure.Trim()) { Atualizar-Env "AZURE_SPEECH_KEY" $azure.Trim() }

Write-Host ""
Write-Host "3/3 Firebase Admin JSON" -ForegroundColor White
Write-Host "   Opcao A: Cola o JSON completo numa linha (comeca com { )" -ForegroundColor DarkGray
Write-Host "   Opcao B: Enter = indicar caminho para ficheiro .json" -ForegroundColor DarkGray
$firebaseInput = Read-Host "JSON ou Enter para caminho"

if ($firebaseInput.Trim().StartsWith("{")) {
    $firebaseInput.Trim() | Set-Content $firebasePath -Encoding UTF8 -NoNewline
    Write-Host "firebase-admin.json criado." -ForegroundColor Green
} elseif ($firebaseInput.Trim()) {
    Copy-Item $firebaseInput.Trim() $firebasePath -Force
    Write-Host "firebase-admin.json copiado." -ForegroundColor Green
} elseif (-not (Test-Path $firebasePath)) {
    $caminho = Read-Host "Caminho para o ficheiro firebase-admin.json"
    if ($caminho.Trim() -and (Test-Path $caminho.Trim())) {
        Copy-Item $caminho.Trim() $firebasePath -Force
        Write-Host "firebase-admin.json copiado." -ForegroundColor Green
    } else {
        Write-Host "AVISO: firebase-admin.json em falta — horoscopo diario nao funciona sem ele." -ForegroundColor Red
    }
} else {
    Write-Host "firebase-admin.json ja existe — mantido." -ForegroundColor Green
}

Write-Host ""
Write-Host "A verificar configuracao..." -ForegroundColor Cyan
npm run verificar

Write-Host ""
Write-Host "=== Pronto! Comandos de teste ===" -ForegroundColor Green
Write-Host "  npm run studio:fix     # se Electron falhar no Windows"
Write-Host "  npm run studio         # app Sidus Studio (voz, musica, imagem)"
Write-Host "  npm run gerar          # horoscopo diario (1 signo com TESTE_LOCAL=1)"
Write-Host "  npm run gerar-segunda  # video motivacional"
Write-Host "  npm run gerar-quarta   # video afiliados"
Write-Host ""
