import os
import requests
from django.conf import settings
from datetime import date
from django.db.models import Sum
from sales.models import Sale
from finance.models import Expense

def send_telegram_message(message: str):
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', os.environ.get('TELEGRAM_BOT_TOKEN', ''))
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', os.environ.get('TELEGRAM_CHAT_ID', ''))
    
    if not bot_token or not chat_id:
        print("Telegram bot token or chat ID is not configured.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending telegram message: {e}")
        return False

def generate_daily_report_text():
    today = date.today()
    
    today_revenue = Sale.objects.filter(date__date=today, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    today_expense = Expense.objects.filter(date__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
    today_profit = today_revenue - today_expense

    message = f"📊 <b>Kunlik Hisobot ({today.strftime('%d.%m.%Y')})</b>\n\n"
    message += f"💰 <b>Tushum:</b> {today_revenue:,.0f} UZS\n"
    message += f"📉 <b>Xarajat:</b> {today_expense:,.0f} UZS\n"
    message += f"💵 <b>Sof foyda:</b> {today_profit:,.0f} UZS\n"
    
    return message
