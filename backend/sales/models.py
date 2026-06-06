from django.db import models
from inventory.models import Product
from django.contrib.auth.models import User

class Cabin(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Tapchan(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Table(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Bo\'sh'),
        ('OCCUPIED', 'Band'),
        ('RESERVED', 'Bron qilingan'),
    )
    name = models.CharField(max_length=50)
    capacity = models.IntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')

    def __str__(self):
        return f"{self.name} ({self.capacity} kishi) - {self.get_status_display()}"

class Shift(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed')
    ]
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    opened_by = models.CharField(max_length=100, default="Kassir")
    closed_by = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    # Aggregated totals at closing time
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expense_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Shift {self.id} - {self.status}"

class Sale(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('CANCELLED', 'Cancelled')
    ]
    date = models.DateTimeField(auto_now_add=True)
    cabin = models.ForeignKey(Cabin, on_delete=models.SET_NULL, null=True, blank=True)
    tapchan = models.ForeignKey(Tapchan, on_delete=models.SET_NULL, null=True, blank=True)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')

    def __str__(self):
        return f"Sale {self.id} on {self.date}"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Unknown'} for Sale {self.sale.id}"

class SalePayment(models.Model):
    PAYMENT_CHOICES = [
        ('naqd', 'Naqd'),
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('transfer', 'Bank O\'tkazmasi')
    ]
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.payment_type} - {self.amount} for Sale {self.sale.id}"

class DailyReport(models.Model):
    date = models.DateField(unique=True)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    click_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payme_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transfer_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expense_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Report for {self.date}"
