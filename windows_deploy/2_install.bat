@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Installer Script
echo ==========================================

:: Loyiha ildiz papkasiga o'tish (windows_deploy dan bir daraja yuqori)
cd /d "%~dp0.."
set "PROJECT_ROOT=%cd%"
echo [INFO] Loyiha papkasi: %PROJECT_ROOT%

:: -----------------------------------------------
echo.
echo [1/4] Tizim dasturlari tekshirilmoqda...
:: -----------------------------------------------
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js o'rnatilmagan! Oldin 0_setup.bat ni ishlating.
    pause
    exit /b
)
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python o'rnatilmagan! Oldin 0_setup.bat ni ishlating.
    pause
    exit /b
)

echo [OK] Node.js va Python topildi.

:: -----------------------------------------------
echo.
echo [2/4] Frontend kutubxonalari o'rnatilmoqda...
:: -----------------------------------------------
cd /d "%PROJECT_ROOT%\frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install xatosi! Internetga ulanganingizni tekshiring.
    pause
    exit /b
)

:: -----------------------------------------------
echo.
echo [3/4] Frontend build qilinmoqda...
:: -----------------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build xatosi!
    pause
    exit /b
)
echo [OK] Frontend tayyor.

:: -----------------------------------------------
echo.
echo [4/4] Backend muhiti sozlanmoqda...
:: -----------------------------------------------
cd /d "%PROJECT_ROOT%\backend"

if not exist "venv" (
    echo Virtual muhit yaratilmoqda...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo Python kutubxonalari o'rnatilmoqda...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] pip install xatosi!
    pause
    exit /b
)

echo Ma'lumotlar bazasi tayyorlanmoqda...
python manage.py makemigrations
python manage.py migrate

echo Stollar bazaga qo'shilmoqda...
python seed_tables.py 2>nul

echo Admin foydalanuvchi yaratilmoqda...
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings'); import django; django.setup(); from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin','','admin123')" 2>nul

cd /d "%PROJECT_ROOT%"

echo.
echo ==========================================
echo O'rnatish yakunlandi!
echo.
echo Login: admin
echo Parol: admin123
echo.
echo Endi "3_run.bat" ni ishga tushiring.
echo ==========================================
pause
