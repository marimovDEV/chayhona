from rest_framework import serializers
from django.db.models import Sum
from .models import Employee, Attendance, EmployeeFine, EmployeeAdvance

class EmployeeSerializer(serializers.ModelSerializer):
    total_fines = serializers.SerializerMethodField()
    total_advances = serializers.SerializerMethodField()
    remaining_salary = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'
        
    def get_total_fines(self, obj):
        return float(obj.fines.aggregate(Sum('amount'))['amount__sum'] or 0)
        
    def get_total_advances(self, obj):
        return float(obj.advances.aggregate(Sum('amount'))['amount__sum'] or 0)
        
    def get_remaining_salary(self, obj):
        fines = obj.fines.aggregate(Sum('amount'))['amount__sum'] or 0
        advances = obj.advances.aggregate(Sum('amount'))['amount__sum'] or 0
        return float(obj.salary - fines - advances)
        
    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("Oylik maosh manfiy bo'lishi mumkin emas.")
        return value
        
    def validate_fio(self, value):
        if not value.strip():
            raise serializers.ValidationError("Xodimning ismi bo'sh bo'lishi mumkin emas.")
        return value

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.fio', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class EmployeeFineSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.fio', read_only=True)

    class Meta:
        model = EmployeeFine
        fields = '__all__'


class EmployeeAdvanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.fio', read_only=True)

    class Meta:
        model = EmployeeAdvance
        fields = '__all__'
