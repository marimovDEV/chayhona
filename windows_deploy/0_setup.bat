@echo off
chcp 65001 >nul
echo ==========================================
echo Verdant RMS - Tizim Sozlash (0-bosqich)
echo ==========================================
echo.
echo Bu skript Git, Python va Node.js ni
echo avtomatik o'rnatib beradi.
echo.

:: Admin huquqi tekshiruvi
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Administrator sifatida ishga tushiring!
    echo     Sichqoncha o'ng tugma ^> "Run as administrator"
    pause
    exit /b
)

:: -----------------------------------------------
:: 1. GIT
:: -----------------------------------------------
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git allaqachon o'rnatilgan.
) else (
    echo [INFO] Git o'rnatilmoqda...
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo [INFO] winget orqali o'rnatib bo'lmadi. Qo'lda yuklab olinmoqda...
        echo [INFO] Git yuklanmoqda... (bu biroz vaqt olishi mumkin)
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe' -OutFile '%TEMP%\git_installer.exe'"
        echo [INFO] Git o'rnatilmoqda (jimlik rejimida)...
        "%TEMP%\git_installer.exe" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"
        del "%TEMP%\git_installer.exe" >nul 2>&1
    )
    :: PATH ni yangilash
    set "PATH=%PATH%;C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
    echo [OK] Git o'rnatildi.
)

echo.

:: -----------------------------------------------
:: 2. PYTHON
:: -----------------------------------------------
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python allaqachon o'rnatilgan.
) else (
    echo [INFO] Python o'rnatilmoqda...
    winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo [INFO] winget orqali o'rnatib bo'lmadi. Qo'lda yuklab olinmoqda...
        powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe' -OutFile '%TEMP%\python_installer.exe'"
        echo [INFO] Python o'rnatilmoqda...
        "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        del "%TEMP%\python_installer.exe" >nul 2>&1
    )
    echo [OK] Python o'rnatildi.
)

echo.

:: -----------------------------------------------
:: 3. NODE.JS
:: -----------------------------------------------
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js allaqachon o'rnatilgan.
) else (
    echo [INFO] Node.js o'rnatilmoqda...
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo [INFO] winget orqali o'rnatib bo'lmadi. Qo'lda yuklab olinmoqda...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi' -OutFile '%TEMP%\node_installer.msi'"
        echo [INFO] Node.js o'rnatilmoqda...
        msiexec /i "%TEMP%\node_installer.msi" /quiet /norestart
        del "%TEMP%\node_installer.msi" >nul 2>&1
    )
    echo [OK] Node.js o'rnatildi.
)

echo.
echo ==========================================
echo Barcha dasturlar muvaffaqiyatli o'rnatildi!
echo.
echo MUHIM: CMD oynasini yopib, yangisini oching
echo (PATH yangilanishi uchun), keyin:
echo   1_clone.bat ^> 2_install.bat ^> 3_run.bat
echo ==========================================
pause
