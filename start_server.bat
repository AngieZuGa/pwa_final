@echo off
REM Script para iniciar el servidor PWA en Windows

echo.
echo =====================================
echo   PWA - Servidor Local
echo =====================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en PATH
    echo.
    echo Descarga Python desde: https://www.python.org/downloads/
    echo Asegúrate de marcar "Add Python to PATH" durante la instalación
    pause
    exit /b 1
)

echo ✓ Python encontrado
echo.

REM Opción de servidor
echo Elige una opción:
echo 1. HTTP (más rápido, sin Service Worker)
echo 2. HTTPS (completo, con Service Worker)
echo 3. Salir
echo.

set /p choice="Ingresa tu opción (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🌐 Iniciando servidor HTTP...
    echo 📍 Accede a: http://localhost:8000
    echo.
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo.
    echo Verificando dependencias...
    python -c "import cryptography" >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Instalando cryptography...
        pip install cryptography
        if errorlevel 1 (
            echo ❌ Error al instalar cryptography
            pause
            exit /b 1
        )
    )
    echo.
    echo 🔒 Iniciando servidor HTTPS...
    echo 📍 Accede a: https://localhost:8443
    echo.
    python https_server.py
) else if "%choice%"=="3" (
    echo.
    exit /b 0
) else (
    echo ❌ Opción no válida
    pause
    exit /b 1
)

pause
