from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DebtorViewSet, DebtViewSet, DebtPaymentViewSet, ExpenseCategoryViewSet, ExpenseViewSet,
    SupplierViewSet, SupplierDebtViewSet, SupplierPaymentViewSet,
    finance_stats, dashboard_stats, full_statistics,
    daily_chart, monthly_chart, top_products, top_drinks, statistics_kpi
)

router = DefaultRouter()
router.register(r'debtors', DebtorViewSet)
router.register(r'debts', DebtViewSet)
router.register(r'debt-payments', DebtPaymentViewSet)
router.register(r'expense-categories', ExpenseCategoryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'supplier-debts', SupplierDebtViewSet)
router.register(r'supplier-payments', SupplierPaymentViewSet)

urlpatterns = [
    path('stats/', finance_stats, name='finance_stats'),
    path('dashboard/', dashboard_stats, name='dashboard_stats'),
    path('dashboard/daily-chart/', daily_chart, name='daily_chart'),
    path('dashboard/monthly-chart/', monthly_chart, name='monthly_chart'),
    path('dashboard/top-products/', top_products, name='top_products'),
    path('dashboard/top-drinks/', top_drinks, name='top_drinks'),
    path('statistics/kpi/', statistics_kpi, name='statistics_kpi'),
    path('full-statistics/', full_statistics, name='full_statistics'),
    path('', include(router.urls)),
]
