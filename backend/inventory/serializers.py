from rest_framework import serializers
from .models import ProductCategory, Product, StockEntry, StockExit

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def validate(self, data):
        if 'purchase_price' in data and data['purchase_price'] < 0:
            raise serializers.ValidationError({"purchase_price": "Narx manfiy bo'lishi mumkin emas."})
        if 'selling_price' in data and data['selling_price'] < 0:
            raise serializers.ValidationError({"selling_price": "Sotish narxi manfiy bo'lishi mumkin emas."})
        if 'min_stock' in data and data['min_stock'] < 0:
            raise serializers.ValidationError({"min_stock": "Minimal limit manfiy bo'lishi mumkin emas."})
        return data

class StockEntrySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockEntry
        fields = '__all__'

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Miqdor 0 dan katta bo'lishi kerak.")
        return value

class StockExitSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockExit
        fields = '__all__'
        
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Miqdor 0 dan katta bo'lishi kerak.")
        return value
