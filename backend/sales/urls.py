from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CabinViewSet, TapchanViewSet, SaleViewSet, SaleItemViewSet, SalePaymentViewSet, DailyReportViewSet, ShiftViewSet, TableViewSet, close_day

router = DefaultRouter()
router.register(r'cabins', CabinViewSet)
router.register(r'tapchans', TapchanViewSet)
router.register(r'tables', TableViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'sale-items', SaleItemViewSet)

router.register(r'sale-payments', SalePaymentViewSet)
router.register(r'daily-reports', DailyReportViewSet)
router.register(r'shifts', ShiftViewSet)

urlpatterns = [
    path('close-day/', close_day, name='close_day'),
    path('', include(router.urls)),
]
