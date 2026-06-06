from django.db import models
from sales.models import Cabin, Tapchan, Table

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Kutilmoqda'),
        ('CONFIRMED', 'Tasdiqlangan'),
        ('ARRIVED', 'Keldi (Band)'),
        ('COMPLETED', 'Yakunlangan'),
        ('CANCELLED', 'Bekor qilingan'),
        ('NO_SHOW', 'Kelmadi'),
    )

    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    guests_count = models.IntegerField()
    cabin = models.ForeignKey(Cabin, on_delete=models.SET_NULL, null=True, blank=True)
    tapchan = models.ForeignKey(Tapchan, on_delete=models.SET_NULL, null=True, blank=True)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"{self.customer_name} - {self.date} {self.time}"
