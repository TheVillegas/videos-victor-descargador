@echo off
title Videos Victor - Descargador
cd /d "%~dp0"

echo ========================================
echo    VIDEOS VICTOR - DESCARGADOR
echo ========================================
echo.

echo [1/3] Verificando dependencias...
pip install -r requirements.txt

echo.
echo [2/3] Preparando carpeta de videos...
if not exist "Videos Victor" mkdir "Videos Victor"

echo.
echo [3/3] Abriendo aplicacion...
start "" "http://localhost:5000"

echo.
echo Servidor iniciado. Cerrar esta ventana detiene la descarga.
python app.py