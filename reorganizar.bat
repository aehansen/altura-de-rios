@echo off
echo ========================================================
echo Reorganizando carpetas del proyecto Rio-Paranacito
echo ========================================================

cd /d "%~dp0"

echo Creando carpeta legacy...
if not exist "legacy" mkdir legacy

echo Moviendo archivos huerfanos al legacy...
if exist "index.html" move /Y index.html legacy\index.html
if exist "server.js" move /Y server.js legacy\server.js

echo Extrayendo frontend y backend...
move /Y "rio-paranacito\rio-paranacito\frontend" ".\frontend"
move /Y "rio-paranacito\rio-paranacito\backend" ".\backend"

echo Eliminando carpetas residuales...
rd /s /q "rio-paranacito"

echo Moviendo el index.html de frontend/public a frontend/...
move /Y "frontend\public\index.html" "frontend\index.html"

echo ========================================================
echo Limpieza Completa. 
echo Pasos a seguir:
echo 1) Entrar a la carpeta frontend: cd frontend
echo 2) Instalar dependencias limpias: npm install
echo 3) Probar localmente: npm run dev
echo ========================================================
pause
