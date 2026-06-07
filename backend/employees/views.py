from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Employee, Attendance, EmployeeFine, EmployeeAdvance
from .serializers import (
    EmployeeSerializer, AttendanceSerializer, 
    EmployeeFineSerializer, EmployeeAdvanceSerializer
)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        employee = self.get_object()
        
        attendances = Attendance.objects.filter(employee=employee).order_by('-date')
        fines = EmployeeFine.objects.filter(employee=employee).order_by('-date')
        advances = EmployeeAdvance.objects.filter(employee=employee).order_by('-date')

        total_fines = fines.aggregate(Sum('amount'))['amount__sum'] or 0
        total_advances = advances.aggregate(Sum('amount'))['amount__sum'] or 0
        remaining_salary = employee.salary - total_fines - total_advances

        return Response({
            "employee": EmployeeSerializer(employee).data,
            "attendances": AttendanceSerializer(attendances, many=True).data,
            "fines": EmployeeFineSerializer(fines, many=True).data,
            "advances": EmployeeAdvanceSerializer(advances, many=True).data,
            "summary": {
                "salary": float(employee.salary),
                "total_fines": float(total_fines),
                "total_advances": float(total_advances),
                "remaining_salary": float(remaining_salary)
            }
        })

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class EmployeeFineViewSet(viewsets.ModelViewSet):
    queryset = EmployeeFine.objects.all()
    serializer_class = EmployeeFineSerializer

class EmployeeAdvanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAdvance.objects.all()
    serializer_class = EmployeeAdvanceSerializer
