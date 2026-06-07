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


class TelegramConfig(models.Model):
    """Singleton model — faqat bitta yozuv bo'ladi"""
    bot_token = models.CharField(max_length=200, blank=True, default='')
    
    def __str__(self):
        return f"Telegram Config (token: ...{self.bot_token[-10:]})" if self.bot_token else "Telegram Config (empty)"
    
    def save(self, *args, **kwargs):
        # Singleton pattern: har doim id=1 bo'ladi
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class TelegramAdmin(models.Model):
    """Telegram hisobotlarni oladigan adminlar ro'yxati"""
    name = models.CharField(max_length=100, help_text="Admin ismi (masalan: Ogabek)")
    chat_id = models.CharField(max_length=50, help_text="Telegram Chat ID")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.chat_id})"
    
    class Meta:
        ordering = ['-created_at']
