from datetime import date
from django.db.models import Sum, F
from finance.models import Expense, Debtor
from sales.models import Sale
from inventory.models import Product
from reservations.models import Reservation
from .models import DailyReport
from .telegram import generate_daily_report_text, send_telegram_message

def send_daily_report():
    today = date.today()
    
    # Calculate stats for DB
    total_income = Sale.objects.filter(date__date=today, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_expense = Expense.objects.filter(date__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
    profit = total_income - total_expense
    
    sales_count = Sale.objects.filter(date__date=today, status='ACTIVE').count()
    low_stock_count = Product.objects.filter(is_active=True, current_stock__lte=F('min_stock')).count()
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

    # Send telegram message using shared logic
    message = generate_daily_report_text()
    success = send_telegram_message(message)
    if success:
        print("Telegram daily report sent successfully.")
    else:
        print("Telegram daily report configuration is missing or failed to send. Printing report to console:")
        print(message)

