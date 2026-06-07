@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Installer Script
echo ==========================================

:: Loyiha ildiz papkasiga o'tish (windows_deploy dan bir daraja yuqori)
cd /d "%~dp0.."
echo [INFO] Loyiha papkasi: %cd%

:: -----------------------------------------------
echo [1/3] Tizim dasturlari tekshirilmoqda...
:: -----------------------------------------------
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js o'rnatilmagan! Iltimos, https://nodejs.org/ orqali o'rnating.
    pause
    exit /b
)
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python o'rnatilmagan yoki PATH ga qo'shilmagan! https://www.python.org/downloads/ dan o'rnating.
    pause
    exit /b
)

echo [OK] Node.js va Python topildi.
echo.

:: -----------------------------------------------
echo [2/3] Frontend kutubxonalari o'rnatilmoqda...
:: -----------------------------------------------
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install xatosi! Internetga ulanganingizni tekshiring.
    pause
    exit /b
)
cd ..

echo.
:: -----------------------------------------------
echo [3/3] Backend muhiti sozlanmoqda...
:: -----------------------------------------------
cd backend

if not exist "venv" (
    echo Virtual muhit (venv) yaratilmoqda...
    python -m venv venv
)
call venv\Scripts\activate

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

echo Kabina va Tapchanlar bazaga qo'shilmoqda...
python seed_tables.py

echo Admin foydalanuvchi yaratilmoqda (agar mavjud bo'lmasa)...
python -c "import django; django.setup(); from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', '', 'admin123')" 2>nul

cd ..

echo.
echo ==========================================
echo Barcha o'rnatish ishlari yakunlandi!
echo Endi dasturni ishga tushirish uchun "3_run.bat" faylini bosing.
echo ==========================================
pause
