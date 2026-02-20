@echo off
title Math App Server
color 0A

cd /d "%~dp0"

echo.
echo  ========================================
echo       MATH APP - Servidor de Dev
echo  ========================================
echo.
echo  Iniciando o servidor Expo...
echo.
echo  Pressione 1 ou 2 para ENCERRAR o servidor
echo  ========================================
echo.

start /b cmd /c "npm start 2>&1"

:loop
choice /c 12 /n /m "" >nul 2>&1
if errorlevel 1 goto stop

:stop
echo.
echo  Encerrando servidor...
taskkill /f /im node.exe >nul 2>&1
echo  Servidor encerrado!
timeout /t 2 >nul
exit
