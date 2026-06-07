@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Start App
echo ==========================================

:: Loyiha ildiz papkasiga o'tish
cd /d "%~dp0.."
echo [INFO] Loyiha papkasi: %cd%

set PROJECT_ROOT=%cd%

echo [INFO] Backend server ishga tushirilmoqda...
start "Verdant Backend" cmd /k "cd /d %PROJECT_ROOT%\backend && call venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo [INFO] Serverlar ishga tushishi kutilmoqda (5 soniya)...
timeout /t 5 >nul

echo [INFO] Brauzer ochilmoqda...
start http://localhost:8000

echo.
echo ==========================================
echo Dastur muvaffaqiyatli ishga tushdi!
echo Qora darchani (CMD) yopib yubormang,
echo aks holda dastur to'xtaydi.
echo ==========================================
pause
