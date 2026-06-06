@echo off
echo ==========================================
echo Verdant RMS - Git Clone Script
echo ==========================================
:: Github havolasini o'zingizning repo manzilingizga o'zgartiring
set REPO_URL=https://github.com/ogabek/choyhona.git
set PROJECT_DIR=choyhona

if exist "%PROJECT_DIR%" (
    echo [INFO] Loyiha papkasi allaqachon mavjud! Oxirgi o'zgarishlar yuklanmoqda...
    cd %PROJECT_DIR%
    git pull
    cd ..
) else (
    echo [INFO] Loyiha Githubdan yuklab olinmoqda...
    git clone %REPO_URL% %PROJECT_DIR%
)
echo.
echo ==========================================
echo Yuklab olish yakunlandi! 
echo Endi "2_install.bat" faylini ishga tushiring.
echo ==========================================
pause
