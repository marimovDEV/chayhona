import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from employees.models import Employee
from inventory.models import Product, ProductCategory, StockEntry
from sales.models import Cabin, Tapchan, Shift, Sale, SaleItem, SalePayment
from finance.models import ExpenseCategory, Expense, Debtor, Debt, DebtPayment
from reservations.models import Reservation
from django.utils import timezone
from datetime import timedelta

print("Starting QA Population...")

# 1. Employee
emp, _ = Employee.objects.get_or_create(fio="Ali Qosimov", phone="+998901234567", role="Kassir", salary=5000000, start_date=timezone.now().date())

# 2. Warehouse
cat1, _ = ProductCategory.objects.get_or_create(name="Taom")
cat2, _ = ProductCategory.objects.get_or_create(name="Ichimlik")

prod1, _ = Product.objects.get_or_create(name="Osh", category=cat1, unit="Porsiya", purchase_price=15000, selling_price=25000, current_stock=100)
prod2, _ = Product.objects.get_or_create(name="Choy", category=cat2, unit="Choynak", purchase_price=1000, selling_price=3000, current_stock=50)

# Add stock
StockEntry.objects.create(product=prod1, quantity=100, purchase_price=15000)
StockEntry.objects.create(product=prod2, quantity=50, purchase_price=1000)

# 3. Cabin and Tapchan
cab1, _ = Cabin.objects.get_or_create(name="Kabina 1")
tap1, _ = Tapchan.objects.get_or_create(name="Tapchan 1")

# 4. Sales
shift, _ = Shift.objects.get_or_create(status='open')
sale = Sale.objects.create(cabin=cab1, total_amount=53000, status='ACTIVE', shift=shift)
SaleItem.objects.create(sale=sale, product=prod1, quantity=2, price=25000)
SaleItem.objects.create(sale=sale, product=prod2, quantity=1, price=3000)
SalePayment.objects.create(sale=sale, payment_type='naqd', amount=53000)

# 5. Finance
cat, _ = ExpenseCategory.objects.get_or_create(name="Bozor")
Expense.objects.create(category=cat, amount=150000, payment_type='naqd', name="Bozorlik", note="Go'sht va sabzavotlar")

debtor, _ = Debtor.objects.get_or_create(name="Toshmat", phone="+998909876543")
debt = Debt.objects.create(debtor=debtor, amount=100000, item_description="Qarzga osh yedi")
DebtPayment.objects.create(debt=debt, amount=50000, payment_type='naqd')
debt.status = 'PARTIAL'
debt.save()

# 6. Reservations
Reservation.objects.create(customer_name="Gulnoza", phone="+998901112233", date=timezone.now().date(), time=timezone.now().time(), guests_count=4, cabin=cab1, status='CONFIRMED')

print("QA Population completed successfully!")
