from rest_framework import serializers
from .models import Cabin, Tapchan, Sale, SaleItem, SalePayment, DailyReport, Shift, Table

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class CabinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cabin
        fields = '__all__'

class TapchanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tapchan
        fields = '__all__'

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SaleItem
        fields = '__all__'

class SalePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePayment
        fields = '__all__'

class DailyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReport
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    payments = SalePaymentSerializer(many=True, read_only=True)
    cabin_name = serializers.CharField(source='cabin.name', read_only=True)
    tapchan_name = serializers.CharField(source='tapchan.name', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
