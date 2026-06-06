import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from reports.telegram import send_telegram_message

success = send_telegram_message("🔔 <b>Verdant RMS Test</b>\n\nTabriklayman! Tizim va Telegram bot muvaffaqiyatli bog'landi!")
if success:
    print("TEST: SUCCESS")
else:
    print("TEST: FAILED")
