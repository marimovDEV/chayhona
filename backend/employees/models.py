from django.db import models

class Employee(models.Model):
    ROLE_CHOICES = (
        ('Ofitsiant', 'Ofitsiant'),
        ('Hostes', 'Hostes'),
        ('Povar', 'Povar'),
        ('Posudamoyka', 'Posudamoyka'),
        ('Uborkachi', 'Uborkachi'),
        ('Menejer', 'Menejer'),
        ('Dostavshik', 'Dostavshik'),
        ('Kassir', 'Kassir'),
        ('Barmen', 'Barmen'),
    )

    fio = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.fio} - {self.role}"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.employee.fio} on {self.date}"
