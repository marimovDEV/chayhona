from rest_framework import serializers
from .models import MenuCategory, MenuItem, Recipe


class MenuCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order', 'items_count']

    def get_items_count(self, obj):
        return obj.items.filter(is_available=True).count()


class RecipeSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)
    ingredient_purchase_price = serializers.DecimalField(
        source='ingredient.purchase_price', max_digits=12, decimal_places=2, read_only=True
    )
    cost = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'menu_item', 'ingredient', 'quantity',
            'ingredient_name', 'ingredient_unit', 'ingredient_purchase_price', 'cost'
        ]

    def get_cost(self, obj):
        """Bu ingredient uchun narx: quantity * purchase_price"""
        price = float(obj.ingredient.purchase_price or 0)
        qty = float(obj.quantity or 0)
        return round(price * qty, 2)


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    recipes = RecipeSerializer(many=True, read_only=True)
    food_cost = serializers.FloatField(read_only=True)
    profit_per_item = serializers.FloatField(read_only=True)
    food_cost_percent = serializers.FloatField(read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'category', 'category_name', 'selling_price',
            'is_available', 'description', 'recipes',
            'food_cost', 'profit_per_item', 'food_cost_percent'
        ]
