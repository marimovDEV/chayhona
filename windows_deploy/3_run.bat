@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Start App
echo ==========================================

:: Loyiha ildiz papkasiga o'tish
cd /d "%~dp0.."
set "PROJECT_ROOT=%cd%"
echo [INFO] Loyiha papkasi: %PROJECT_ROOT%

:: Backend venv mavjudligini tekshirish
if not exist "%PROJECT_ROOT%\backend\venv" (
    echo [ERROR] Backend o'rnatilmagan! Oldin 2_install.bat ni ishlating.
    pause
    exit /b
)

echo.
echo [INFO] Backend server ishga tushirilmoqda...

:: Yangi CMD oynasida backend'ni ishga tushirish
start "Verdant RMS - Server" cmd /c "cd /d "%PROJECT_ROOT%\backend" && call venv\Scripts\activate.bat && echo Server ishga tushmoqda... && python manage.py runserver 0.0.0.0:8000"

echo [INFO] Server yuklanishi kutilmoqda (8 soniya)...
timeout /t 8 >nul

:: Server ishlayotganini tekshirish
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000' -UseBasicParsing -TimeoutSec 5; Write-Host '[OK] Server ishlayapti!' } catch { Write-Host '[WARN] Server hali yuklanayotgan bo''lishi mumkin...' }"

echo.
echo [INFO] Brauzer ochilmoqda...
start "" "http://localhost:8000"

echo.
echo ==========================================
echo Dastur muvaffaqiyatli ishga tushdi!
echo.
echo Manzil: http://localhost:8000
echo Login:  admin
echo Parol:  admin123
echo.
echo DIQQAT: "Verdant RMS - Server" oynasini
echo yopib yubormang, aks holda dastur to'xtaydi.
echo ==========================================
pause
