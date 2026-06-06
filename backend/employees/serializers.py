from rest_framework import serializers
from .models import Employee, Attendance

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        
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
