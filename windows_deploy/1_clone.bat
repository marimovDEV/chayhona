@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Git Pull (Yangilanish)
echo ==========================================

:: Bat faylning joylashgan papkasiga o'tish
cd /d "%~dp0.."

echo [INFO] Loyiha papkasi: %cd%
echo [INFO] Oxirgi o'zgarishlar Githubdan yuklanmoqda...
git pull

echo.
echo ==========================================
echo Yangilanish yakunlandi!
echo Endi "2_install.bat" faylini ishga tushiring.
echo ==========================================
pause
