@echo off
echo ==========================================
echo Verdant RMS - Installer Script
echo ==========================================

if not exist "choyhona" (
    echo [ERROR] "choyhona" papkasi topilmadi! Oldin "1_clone.bat" ni ishlating.
    pause
    exit /b
)

echo [1/3] Tizim dasturlari tekshirilmoqda...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js o'rnatilmagan! Iltimos, (https://nodejs.org/) orqali o'rnating.
    pause
    exit /b
)
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python o'rnatilmagan yoki PATH ga qo'shilmagan! (https://www.python.org/downloads/) dan o'rnating.
    pause
    exit /b
)

echo.
echo [2/3] Frontend kutubxonalari o'rnatilmoqda...
cd choyhona\frontend
call npm install
cd ..\..

echo.
echo [3/3] Backend muhiti sozlanmoqda...
cd choyhona\backend
if not exist "venv" (
    echo Virtual muhit (venv) yaratilmoqda...
    python -m venv venv
)
call venv\Scripts\activate

echo Python kutubxonalari o'rnatilmoqda...
pip install -r requirements.txt

echo Ma'lumotlar bazasi tayyorlanmoqda...
python manage.py makemigrations
python manage.py migrate

echo Kabina va Tapchanlar bazaga qo'shilmoqda...
python seed_tables.py
cd ..\..

echo.
echo ==========================================
echo Barcha o'rnatish ishlari yakunlandi! 
echo Endi dasturni ishga tushirish uchun "3_run.bat" faylini bosing.
echo ==========================================
pause
