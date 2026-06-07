from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MenuCategory, MenuItem, Recipe
from .serializers import MenuCategorySerializer, MenuItemSerializer, RecipeSerializer


class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related('category').prefetch_related(
        'recipes__ingredient'
    ).all()
    serializer_class = MenuItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        available = self.request.query_params.get('available')
        if available == 'true':
            qs = qs.filter(is_available=True)
        return qs


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.select_related('menu_item', 'ingredient').all()
    serializer_class = RecipeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        menu_item = self.request.query_params.get('menu_item')
        if menu_item:
            qs = qs.filter(menu_item_id=menu_item)
        return qs


@api_view(['GET'])
def food_cost_report(request):
    """Barcha menyu elementlari uchun texnologik karta (food cost)"""
    items = MenuItem.objects.filter(is_available=True).select_related(
        'category'
    ).prefetch_related('recipes__ingredient')

    report = []
    for item in items:
        recipes_data = []
        for recipe in item.recipes.all():
            ingredient = recipe.ingredient
            cost = float(ingredient.purchase_price or 0) * float(recipe.quantity)
            recipes_data.append({
                'ingredient': ingredient.name,
                'quantity': float(recipe.quantity),
                'unit': ingredient.unit,
                'unit_price': float(ingredient.purchase_price or 0),
                'cost': round(cost, 2)
            })

        report.append({
            'id': item.id,
            'name': item.name,
            'category': item.category.name if item.category else 'Boshqa',
            'selling_price': float(item.selling_price),
            'food_cost': item.food_cost,
            'profit': item.profit_per_item,
            'food_cost_percent': item.food_cost_percent,
            'recipes': recipes_data
        })

    return Response(report)
