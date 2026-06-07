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


class EmployeeFine(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255)
    date = models.DateField()

    def __str__(self):
        return f"Jarima {self.amount} - {self.employee.fio} on {self.date}"


class EmployeeAdvance(models.Model):
    TYPE_CHOICES = (
        ('avans', 'Avans'),
        ('maosh', 'Maosh'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='advances')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.TextField(blank=True, null=True)
    advance_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='avans')

    def __str__(self):
        return f"To'lov ({self.get_advance_type_display()}) {self.amount} - {self.employee.fio} on {self.date}"
