from django.db import models

class Debtor(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Debt(models.Model):
    debtor = models.ForeignKey(Debtor, on_delete=models.CASCADE, related_name='debts')
    item_description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', 'Open'),
            ('PARTIAL', 'Partial'),
            ('PAID', 'Paid')
        ],
        default='OPEN'
    )

    def __str__(self):
        return f"{self.debtor.name} - {self.amount}"

class DebtPayment(models.Model):
    PAYMENT_CHOICES = [
        ('naqd', 'Naqd'),
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('transfer', 'Bank O\'tkazmasi')
    ]
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='naqd')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    is_full_payment = models.BooleanField(default=False)

    def __str__(self):
        return f"Payment of {self.amount} for Debt {self.debt.id}"

class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Expense(models.Model):
    PAYMENT_CHOICES = [
        ('naqd', 'Naqd'),
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('transfer', 'Bank O\'tkazmasi')
    ]
    name = models.CharField(max_length=255)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, related_name='expenses')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='naqd')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.amount}"


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    category = models.CharField(max_length=100) # e.g., "Go'sht", "Sabzavot", "Ichimlik"

    def __str__(self):
        return self.name

class SupplierDebt(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='debts')
    item_description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', 'Open'),
            ('PARTIAL', 'Partial'),
            ('PAID', 'Paid')
        ],
        default='OPEN'
    )

    def __str__(self):
        return f"{self.supplier.name} qarz: {self.amount}"

class SupplierPayment(models.Model):
    PAYMENT_CHOICES = [
        ('naqd', 'Naqd'),
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
        ('click', 'Click'),
        ('payme', 'Payme'),
        ('transfer', 'Bank O\'tkazmasi')
    ]
    debt = models.ForeignKey(SupplierDebt, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='naqd')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To'lov: {self.amount} ({self.payment_type}) - Qarz {self.debt.id}"
