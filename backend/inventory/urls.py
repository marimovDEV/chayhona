from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductCategoryViewSet, ProductViewSet, StockEntryViewSet, StockExitViewSet, InventoryCheckViewSet, inventory_history

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'entries', StockEntryViewSet)
router.register(r'exits', StockExitViewSet)
router.register(r'checks', InventoryCheckViewSet)

urlpatterns = [
    path('history/', inventory_history, name='inventory-history'),
    path('', include(router.urls)),
]
