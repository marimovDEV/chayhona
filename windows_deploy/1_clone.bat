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
echo [INFO] Frontend qayta build qilinmoqda (yangi o'zgarishlar uchun)...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo ==========================================
echo Yangilanish va build yakunlandi!
echo Endi "3_run.bat" faylini ishga tushiring.
echo (Agar baza o'zgargan bo'lsa, oldin 2_install.bat ishlating)
echo ==========================================
pause
