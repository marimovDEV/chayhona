from django.db import models

class DailyReport(models.Model):
    date = models.DateField(unique=True)
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expense = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sales_count = models.IntegerField(default=0)
    low_stock_count = models.IntegerField(default=0)
    reservations_count = models.IntegerField(default=0)
    debtors_count = models.IntegerField(default=0)
    
    # Store top products as JSON or just plain text summary for history
    top_products_summary = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Report for {self.date}"
