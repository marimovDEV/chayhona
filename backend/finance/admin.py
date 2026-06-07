from django.contrib import admin
from .models import Debtor, Debt, DebtPayment, ExpenseCategory, Expense, Supplier, SupplierDebt, SupplierPayment

admin.site.register(Debtor)
admin.site.register(Debt)
admin.site.register(DebtPayment)
admin.site.register(ExpenseCategory)
admin.site.register(Expense)
admin.site.register(Supplier)
admin.site.register(SupplierDebt)
admin.site.register(SupplierPayment)
