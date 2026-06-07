import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import Product, ProductCategory
from menu.models import MenuItem, MenuCategory, Recipe
from sales.models import Table, Sale, SaleItem
from reports.telegram import generate_daily_report_text

def run_business_flow_test():
    print("=== BUSINESS INTEGRATION FLOW TEST ===")
    
    # 1. Setup clean inventory category and product
    prod_cat, _ = ProductCategory.objects.get_or_create(name="Go'sht mahsulotlari")
    
    # Create ingredient "Go'sht" with 10 kg stock, min_stock = 10 kg
    product, created = Product.objects.get_or_create(
        name="Go'sht (Test)",
        defaults={
            "category": prod_cat,
            "unit": "kg",
            "purchase_price": Decimal("100000.00"),
            "selling_price": Decimal("0.00"),
            "min_stock": Decimal("10.00"),
            "current_stock": Decimal("10.00"),
            "is_active": True
        }
    )
    if not created:
        product.current_stock = Decimal("10.00")
        product.min_stock = Decimal("10.00")
        product.save()

    print(f"1. Ingredient yaratildi: {product.name}, Miqdor: {product.current_stock} {product.unit}")

    # 2. Setup menu category and item
    menu_cat, _ = MenuCategory.objects.get_or_create(name="Kaboblar")
    menu_item, created = MenuItem.objects.get_or_create(
        name="Mol go'shti shashlik (Test)",
        defaults={
            "category": menu_cat,
            "selling_price": Decimal("45000.00"),
            "is_available": True
        }
    )
    print(f"2. Menyu elementi yaratildi: {menu_item.name}, Sotuv narxi: {menu_item.selling_price} UZS")

    # 3. Create recipe: Mol go'shti shashlik uses 150 grams of Go'sht (0.15 kg)
    Recipe.objects.filter(menu_item=menu_item).delete()
    recipe = Recipe.objects.create(
        menu_item=menu_item,
        ingredient=product,
        quantity=Decimal("0.15")
    )
    print(f"3. Retsept biriktirildi: {menu_item.name} -> {product.name}: {recipe.quantity} {product.unit}")

    # 4. Create Table and checkout sale (Sotuv qilish)
    table, _ = Table.objects.get_or_create(name="Test Table-1", defaults={"capacity": 4, "status": "AVAILABLE"})
    
    # Simulate POS checkout request via the backend views checkout logic (using SaleViewSet.checkout simulation)
    # We will trigger the view logic directly to ensure transaction safety and inventory auto-deduction is executed
    from rest_framework.test import APIRequestFactory, force_authenticate
    from django.contrib.auth.models import User
    from sales.views import SaleViewSet
    
    factory = APIRequestFactory()
    view = SaleViewSet.as_view({'post': 'checkout'})
    
    # get or create a test admin user
    user, _ = User.objects.get_or_create(username='admin_test', defaults={'is_superuser': True})
    
    # 2 portions of Mol go'shti shashlik -> should deduct 2 * 0.15 = 0.30 kg
    request = factory.post('/api/sales/sales/checkout/', {
        "table_id": table.id,
        "table_type": "table",
        "items": [
            {
                "menu_item": menu_item.id,
                "price": 45000,
                "quantity": 2
            }
        ],
        "payments": [
            {
                "payment_type": "naqd",
                "amount": 90000
            }
        ],
        "total_amount": 90000
    }, format='json')
    
    force_authenticate(request, user=user)
    response = view(request)
    assert response.status_code in [200, 201], f"POS checkout failed: {response.data}"
    print(f"4. Sotuv amalga oshirildi (Checkout). Response status: {response.status_code}")


    # 5. Verify ingredient stock deduction
    product.refresh_from_db()
    # Expected stock: 10.00 - 0.30 = 9.70 kg
    print(f"5. Ingredient qoldig'i tekshirilmoqda: {product.name} qoldig'i amalda: {product.current_stock} {product.unit}")
    assert product.current_stock == Decimal("9.70"), f"Ingredient stock not deducted correctly! Expected 9.70, got {product.current_stock}"
    print("SUCCESS: Ingredient ombordan avtomatik to'g'ri kamaydi (9.70 kg)!")

    # 6. Verify Telegram Daily Report Text
    report_text = generate_daily_report_text()
    print("\n--- GENERATED TELEGRAM REPORT TEXT ---")
    print(report_text)
    print("--------------------------------------\n")

    # Assertions on report text content
    assert "Mol go'shti shashlik (Test)" in report_text, "Sold menu item missing in Telegram report!"
    assert "Go'sht (Test)" in report_text, "Warehouse stock balance missing or incorrect in Telegram report!"
    # Since min_stock is 10 kg, and current stock is 9.7 kg, it must trigger a warning
    assert "🔴 Go'sht (Test) (9.7 kg / min: 10 kg)" in report_text or "🔴 Go'sht (Test)" in report_text, "Low stock warning missing or incorrect in Telegram report!"
    
    print("SUCCESS: Telegram hisoboti ma'lumotlari va ogohlantirishlar 100% to'g'ri shakllandi!")
    
    # Cleanup test data to prevent database pollution
    menu_item.delete()
    product.delete()
    print("Cleanup test data completed successfully.")
    print("=== INTEGRATION FLOW TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_business_flow_test()
