# Script para iniciar el servidor PWA en PowerShell

Clear-Host
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  PWA - Servidor Local" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python no está instalado o no está en PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Descarga Python desde: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Asegúrate de marcar 'Add Python to PATH' durante la instalación"
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Elige una opción:" -ForegroundColor Cyan
Write-Host "1. HTTP (más rápido, sin Service Worker)" 
Write-Host "2. HTTPS (completo, con Service Worker)"
Write-Host "3. Salir"
Write-Host ""

$choice = Read-Host "Ingresa tu opción (1-3)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "🌐 Iniciando servidor HTTP..." -ForegroundColor Green
        Write-Host "📍 Accede a: http://localhost:8000" -ForegroundColor Yellow
        Write-Host ""
        & python -m http.server 8000
    }
    "2" {
        Write-Host "Verificando dependencias..." -ForegroundColor Cyan
        
        try {
            python -c "import cryptography" | Out-Null
        } catch {
            Write-Host "⚠️  Instalando cryptography..." -ForegroundColor Yellow
            & pip install cryptography
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Error al instalar cryptography" -ForegroundColor Red
                Read-Host "Presiona Enter para salir"
                exit 1
            }
        }
        
        Write-Host ""
        Write-Host "🔒 Iniciando servidor HTTPS..." -ForegroundColor Green
        Write-Host "📍 Accede a: https://localhost:8443" -ForegroundColor Yellow
        Write-Host ""
        & python https_server.py
    }
    "3" {
        Write-Host "Hasta luego!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
        exit 1
    }
}
