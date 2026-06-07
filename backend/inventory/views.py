from rest_framework import viewsets
from .models import ProductCategory, Product, StockEntry, StockExit, InventoryCheck
from .serializers import ProductCategorySerializer, ProductSerializer, StockEntrySerializer, StockExitSerializer, InventoryCheckSerializer

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class StockEntryViewSet(viewsets.ModelViewSet):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer

    def perform_create(self, serializer):
        from django.db.models import F
        from django.db import transaction
        with transaction.atomic():
            entry = serializer.save()
            Product.objects.filter(pk=entry.product.pk).update(current_stock=F('current_stock') + entry.quantity)

class StockExitViewSet(viewsets.ModelViewSet):
    queryset = StockExit.objects.all()
    serializer_class = StockExitSerializer

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        from django.db.models import F
        from django.db import transaction
        with transaction.atomic():
            # Save the exit record first to get the product
            exit_item = serializer.save()
            
            # Lock the product row and refresh its state
            product = Product.objects.select_for_update().get(pk=exit_item.product.pk)
            
            if product.current_stock < exit_item.quantity:
                # Rollback creation by raising ValidationError (transaction will rollback)
                raise ValidationError({"quantity": f"Omborda yetarli mahsulot yo'q. Qoldiq: {product.current_stock}"})
            
            product.current_stock = F('current_stock') - exit_item.quantity
            product.save(update_fields=['current_stock'])

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone

@api_view(['GET'])
def inventory_history(request):
    entries = StockEntry.objects.all().select_related('product')
    exits = StockExit.objects.all().select_related('product')
    
    history = []
    
    for entry in entries:
        history.append({
            "id": f"entry_{entry.id}",
            "type": "kirim",
            "itemName": entry.product.name,
            "quantity": entry.quantity,
            "date": entry.date.strftime("%Y-%m-%d"),
            "time": entry.date.strftime("%H:%M"),
            "person": "Admin",  # Placeholder or get from user if available
            "notes": entry.note or ""
        })
        
    for exit_obj in exits:
        history.append({
            "id": f"exit_{exit_obj.id}",
            "type": "chiqim",
            "itemName": exit_obj.product.name,
            "quantity": exit_obj.quantity,
            "date": exit_obj.date.strftime("%Y-%m-%d"),
            "time": exit_obj.date.strftime("%H:%M"),
            "person": "Admin", 
            "notes": exit_obj.reason or ""
        })
        
    # Sort by date and time descending
    history.sort(key=lambda x: (x['date'], x['time']), reverse=True)
    
    return Response(history)


class InventoryCheckViewSet(viewsets.ModelViewSet):
    queryset = InventoryCheck.objects.all()
    serializer_class = InventoryCheckSerializer

    def perform_create(self, serializer):
        from django.db import transaction
        with transaction.atomic():
            check = serializer.save()
            check.product.current_stock = check.actual_qty
            check.product.save(update_fields=['current_stock'])
