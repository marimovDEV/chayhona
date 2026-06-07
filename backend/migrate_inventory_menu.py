import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import Product, ProductCategory
from menu.models import MenuCategory, MenuItem, Recipe

def migrate():
    print("🧹 Eski ma'lumotlarni tozalash boshlandi...")
    Recipe.objects.all().delete()
    MenuItem.objects.all().delete()
    MenuCategory.objects.all().delete()
    Product.objects.all().delete()
    ProductCategory.objects.all().delete()

    print("📦 Ombor kategoriyalari va mahsulotlarini yaratish...")
    cat_food_base = ProductCategory.objects.create(name="Taom asosi")
    cat_drinks = ProductCategory.objects.create(name="Ichimliklar")
    cat_others = ProductCategory.objects.create(name="Boshqa")

    # Xomashyolar
    meat = Product.objects.create(name="Go'sht", category=cat_food_base, unit="kg", purchase_price=100000, selling_price=0, min_stock=10, current_stock=50)
    rice = Product.objects.create(name="Guruch", category=cat_food_base, unit="kg", purchase_price=18000, selling_price=0, min_stock=20, current_stock=100)
    carrot = Product.objects.create(name="Sabzi", category=cat_food_base, unit="kg", purchase_price=4000, selling_price=0, min_stock=30, current_stock=80)
    onion = Product.objects.create(name="Piyoz", category=cat_food_base, unit="kg", purchase_price=3500, selling_price=0, min_stock=20, current_stock=60)
    oil = Product.objects.create(name="Yog'", category=cat_food_base, unit="litr", purchase_price=20000, selling_price=0, min_stock=10, current_stock=40)
    
    # Choy
    tea_leaf = Product.objects.create(name="Choy bargi", category=cat_food_base, unit="gr", purchase_price=150, selling_price=0, min_stock=500, current_stock=2000)
    sugar = Product.objects.create(name="Shakar", category=cat_food_base, unit="gr", purchase_price=15, selling_price=0, min_stock=1000, current_stock=5000)
    
    # Tayyor mahsulotlar (Omborda)
    cola_prod = Product.objects.create(name="Cola 1L", category=cat_drinks, unit="dona", purchase_price=10000, selling_price=0, min_stock=20, current_stock=100)
    fanta_prod = Product.objects.create(name="Fanta 1L", category=cat_drinks, unit="dona", purchase_price=10000, selling_price=0, min_stock=20, current_stock=80)
    bread_prod = Product.objects.create(name="Non", category=cat_others, unit="dona", purchase_price=3000, selling_price=0, min_stock=20, current_stock=50)


    print("🍽️ Menyu kategoriyalari va taomlarini yaratish...")
    mcat_milliy = MenuCategory.objects.create(name="Milliy Taomlar", order=1)
    mcat_kabob = MenuCategory.objects.create(name="Kaboblar", order=2)
    mcat_drinks = MenuCategory.objects.create(name="Ichimliklar", order=3)
    mcat_others = MenuCategory.objects.create(name="Qo'shimcha", order=4)

    # 1. Osh
    osh = MenuItem.objects.create(name="Osh (1 porsiya)", category=mcat_milliy, selling_price=45000, description="To'y oshi")
    Recipe.objects.create(menu_item=osh, ingredient=rice, quantity=0.3)
    Recipe.objects.create(menu_item=osh, ingredient=meat, quantity=0.15)
    Recipe.objects.create(menu_item=osh, ingredient=carrot, quantity=0.1)
    Recipe.objects.create(menu_item=osh, ingredient=oil, quantity=0.02)
    Recipe.objects.create(menu_item=osh, ingredient=onion, quantity=0.05)

    # 2. Shashlik
    shashlik = MenuItem.objects.create(name="Jaz shashlik", category=mcat_kabob, selling_price=18000, description="Mol go'shtidan")
    Recipe.objects.create(menu_item=shashlik, ingredient=meat, quantity=0.2)
    Recipe.objects.create(menu_item=shashlik, ingredient=onion, quantity=0.05)

    # 3. Choy
    choy = MenuItem.objects.create(name="Qora choy", category=mcat_drinks, selling_price=5000)
    Recipe.objects.create(menu_item=choy, ingredient=tea_leaf, quantity=10) # 10 gr choy
    Recipe.objects.create(menu_item=choy, ingredient=sugar, quantity=20)   # 20 gr shakar

    # 4. Ichimliklar (1:1 retsept)
    cola = MenuItem.objects.create(name="Cola 1L", category=mcat_drinks, selling_price=15000)
    Recipe.objects.create(menu_item=cola, ingredient=cola_prod, quantity=1)

    fanta = MenuItem.objects.create(name="Fanta 1L", category=mcat_drinks, selling_price=15000)
    Recipe.objects.create(menu_item=fanta, ingredient=fanta_prod, quantity=1)

    # 5. Non
    non = MenuItem.objects.create(name="Yopgan Non", category=mcat_others, selling_price=5000)
    Recipe.objects.create(menu_item=non, ingredient=bread_prod, quantity=1)

    print("✅ Migratsiya muvaffaqiyatli yakunlandi! Barcha bazalar haqiqiy restoran/choyxona tizimiga moslashtirildi.")

if __name__ == '__main__':
    migrate()
