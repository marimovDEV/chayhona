import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sales.models import Sale, SaleItem, SalePayment
from finance.models import Expense, Debt, DebtPayment, Debtor
from inventory.models import StockEntry, StockExit
from reservations.models import Reservation

def reset_dashboard():
    # Delete transactions
    SalePayment.objects.all().delete()
    SaleItem.objects.all().delete()
    Sale.objects.all().delete()
    
    Expense.objects.all().delete()
    DebtPayment.objects.all().delete()
    Debt.objects.all().delete()
    Debtor.objects.all().delete()
    
    StockEntry.objects.all().delete()
    StockExit.objects.all().delete()
    Reservation.objects.all().delete()
    
    print("Dashboard ma'lumotlari (Sotuvlar, Xarajatlar, Qarzdorlar) muvaffaqiyatli 0 ga tushirildi!")

if __name__ == '__main__':
    reset_dashboard()
