from django.contrib import admin
from .models import ProductCategory, Product, StockEntry, StockExit, InventoryCheck

admin.site.register(ProductCategory)
admin.site.register(Product)
admin.site.register(StockEntry)
admin.site.register(StockExit)
admin.site.register(InventoryCheck)
