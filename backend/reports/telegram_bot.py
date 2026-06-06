import requests
from datetime import date
from django.db.models import Sum, F
from finance.models import Expense, Debtor
from sales.models import Sale
from inventory.models import Product
from reservations.models import Reservation
from .models import DailyReport

def send_daily_report():
    # You can set these in settings or .env later
    BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
    CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"

    today = date.today()
    
    # Calculate stats
    total_income = Sale.objects.filter(date__date=today).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_expense = Expense.objects.filter(date__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
    profit = total_income - total_expense
    
    sales_count = Sale.objects.filter(date__date=today).count()
    low_stock_count = Product.objects.filter(current_stock__lte=F('min_stock')).count()
    reservations_count = Reservation.objects.filter(date=today).count()
    debtors_count = Debtor.objects.count()

    # Save to DB optionally
    report, created = DailyReport.objects.update_or_create(
        date=today,
        defaults={
            'total_income': total_income,
            'total_expense': total_expense,
            'profit': profit,
            'sales_count': sales_count,
            'low_stock_count': low_stock_count,
            'reservations_count': reservations_count,
            'debtors_count': debtors_count
        }
    )

    message = (
        f"📊 Kunlik Hisobot\n"
        f"📅 Sana: {today}\n"
        f"💰 Tushum: {total_income} so'm\n"
        f"💸 Xarajat: {total_expense} so'm\n"
        f"📈 Foyda: {profit} so'm\n"
        f"🍽 Sotilgan mahsulotlar (cheklar): {sales_count} ta\n"
        f"📦 Kam qolgan mahsulotlar: {low_stock_count} ta\n"
        f"📅 Bronlar: {reservations_count} ta\n"
        f"👥 Qarzdorlar: {debtors_count} ta\n"
    )

    if BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        print("Bot token not configured. Report message:\n" + message)
        return

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': CHAT_ID,
        'text': message
    }
    try:
        response = requests.post(url, json=payload)
        print("Telegram response:", response.json())
    except Exception as e:
        print("Error sending telegram message:", str(e))
