from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AttendanceViewSet, EmployeeFineViewSet, EmployeeAdvanceViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'fines', EmployeeFineViewSet)
router.register(r'advances', EmployeeAdvanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
