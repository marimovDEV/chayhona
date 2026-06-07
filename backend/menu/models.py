from django.db import models
from inventory.models import Product


class MenuCategory(models.Model):
    """Menyu kategoriyalari — admin o'zi yaratadi (Kaboblar, Salatlar, Ichimliklar...)"""
    name = models.CharField(max_length=100)
    order = models.IntegerField(default=0)  # Ko'rsatish tartibi

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Menu Categories'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Menyu elementi — sotish uchun (Shashlik, Mastava, Choy...)"""
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        MenuCategory, on_delete=models.SET_NULL, null=True, related_name='items'
    )
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['category__order', 'name']

    def __str__(self):
        return f"{self.name} — {self.selling_price} UZS"

    @property
    def food_cost(self):
        """Tannarxni hisoblash: barcha ingredientlar narxining yig'indisi"""
        total = 0
        for recipe in self.recipes.select_related('ingredient').all():
            ingredient = recipe.ingredient
            if ingredient.purchase_price and ingredient.purchase_price > 0:
                # purchase_price — 1 birlik (kg, litr, dona) uchun narx
                # recipe.quantity — retseptdagi miqdor (shu birlikda)
                # Masalan: Go'sht 100gr = 0.1 kg, narxi 120000/kg → 12000 so'm
                cost = float(ingredient.purchase_price) * float(recipe.quantity)
                total += cost
        return round(total, 2)

    @property
    def profit_per_item(self):
        """Har bir dona uchun foyda"""
        return round(float(self.selling_price) - self.food_cost, 2)

    @property
    def food_cost_percent(self):
        """Food cost foizi (tannarx / sotuv narxi * 100)"""
        if self.selling_price and float(self.selling_price) > 0:
            return round(self.food_cost / float(self.selling_price) * 100, 1)
        return 0


class Recipe(models.Model):
    """Retsept: menyu elementi uchun qancha ingredient ketadi.
    
    MUHIM: quantity birlik hisobida kiritiladi.
    Masalan agar ingredient.unit = 'kg', quantity = 0.1 → 100 gramm.
    Agar ingredient.unit = 'dona', quantity = 2 → 2 dona.
    """
    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name='recipes'
    )
    ingredient = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='used_in_recipes'
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=4)

    class Meta:
        unique_together = ('menu_item', 'ingredient')
        ordering = ['menu_item', 'ingredient']

    def __str__(self):
        return f"{self.menu_item.name} → {self.ingredient.name}: {self.quantity} {self.ingredient.unit}"
