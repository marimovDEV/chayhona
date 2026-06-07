import os
import sys
import time
import shutil
import datetime
import threading
import webbrowser
from pathlib import Path

def setup_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    import django
    django.setup()
    from django.core.management import call_command
    # Ensure migrations are applied just in case
    print("Mijoz bazasini tekshirish va yangilash...")
    call_command("migrate", interactive=False)
    
    # Auto-initialize superuser if none exists
    from django.contrib.auth.models import User
    if not User.objects.filter(username='admin').exists():
        print("Tizimda administrator ('admin') aniqlanmadi. Avtomatik ravishda boshlang'ich hisob yaratildi:")
        print("  Login: admin")
        print("  Parol: admin123")
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')


    
def create_backup():
    if getattr(sys, 'frozen', False):
        base_dir = Path(sys.executable).parent
    else:
        base_dir = Path(__file__).resolve().parent
        
    db_path = base_dir / 'db.sqlite3'
    if not db_path.exists():
        return
        
    backup_dir = base_dir / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    today_str = datetime.date.today().strftime('%Y-%m-%d')
    backup_file = backup_dir / f"{today_str}.sqlite3"
    
    try:
        shutil.copy2(db_path, backup_file)
        print(f"Baza nusxasi yaratildi: {backup_file}")
    except Exception as e:
        print(f"Nusxa olishda xatolik: {e}")

def open_browser():
    time.sleep(3)
    webbrowser.open("http://127.0.0.1:8000")

def main():
    print("BentoTizim Server ishga tushmoqda...")
    create_backup()
    setup_django()
    
    # Start browser thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Start waitress server
    from backend.wsgi import application
    from waitress import serve
    
    print("Tizim http://127.0.0.1:8000/ manzilida xizmat ko'rsatmoqda.")
    print("Dasturni yopish uchun ushbu oynani yoping.")
    serve(application, host='127.0.0.1', port=8000)

if __name__ == "__main__":
    main()
