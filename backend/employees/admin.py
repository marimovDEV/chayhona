from django.contrib import admin
from .models import Employee, Attendance, EmployeeFine, EmployeeAdvance

admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(EmployeeFine)
admin.site.register(EmployeeAdvance)
