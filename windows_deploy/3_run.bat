@echo off
echo ==========================================
echo Verdant RMS - Start App
echo ==========================================

if not exist "choyhona" (
    echo [ERROR] "choyhona" papkasi topilmadi! Oldin dasturni o'rnating.
    pause
    exit /b
)

echo [INFO] Backend server ishga tushirilmoqda...
start "Verdant Backend" cmd /k "cd choyhona\backend && call venv\Scripts\activate && python manage.py runserver"

echo [INFO] Frontend server ishga tushirilmoqda...
start "Verdant Frontend" cmd /k "cd choyhona\frontend && npm run dev"

echo [INFO] Serverlar ishga tushishi kutilmoqda (5 soniya)...
timeout /t 5 >nul

echo [INFO] Brauzer ochilmoqda...
start http://localhost:3000

echo.
echo ==========================================
echo Dastur muvaffaqiyatli ishga tushdi!
echo Qora darchalarni (CMD) yopib yubormang, aks holda dastur to'xtaydi.
echo ==========================================
pause
