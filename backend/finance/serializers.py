from rest_framework import serializers
from .models import Debtor, Debt, DebtPayment, ExpenseCategory, Expense, Supplier, SupplierDebt, SupplierPayment
from django.db.models import Sum

class DebtorSerializer(serializers.ModelSerializer):
    total_debt = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    remaining_debt = serializers.SerializerMethodField()

    class Meta:
        model = Debtor
        fields = '__all__'

    def get_total_debt(self, obj):
        return obj.debts.aggregate(Sum('amount'))['amount__sum'] or 0
        
    def get_total_paid(self, obj):
        return DebtPayment.objects.filter(debt__debtor=obj).aggregate(Sum('amount'))['amount__sum'] or 0

    def get_remaining_debt(self, obj):
        return self.get_total_debt(obj) - self.get_total_paid(obj)

class DebtSerializer(serializers.ModelSerializer):
    debtor_name = serializers.CharField(source='debtor.name', read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_debt = serializers.SerializerMethodField()

    class Meta:
        model = Debt
        fields = '__all__'

    def get_total_paid(self, obj):
        return obj.payments.aggregate(Sum('amount'))['amount__sum'] or 0

    def get_remaining_debt(self, obj):
        return obj.amount - self.get_total_paid(obj)



class DebtPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebtPayment
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    total_debt = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    remaining_debt = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = '__all__'

    def get_total_debt(self, obj):
        return obj.debts.aggregate(Sum('amount'))['amount__sum'] or 0

    def get_total_paid(self, obj):
        return SupplierPayment.objects.filter(debt__supplier=obj).aggregate(Sum('amount'))['amount__sum'] or 0

    def get_remaining_debt(self, obj):
        return self.get_total_debt(obj) - self.get_total_paid(obj)


class SupplierDebtSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_debt = serializers.SerializerMethodField()

    class Meta:
        model = SupplierDebt
        fields = '__all__'

    def get_total_paid(self, obj):
        return obj.payments.aggregate(Sum('amount'))['amount__sum'] or 0

    def get_remaining_debt(self, obj):
        return obj.amount - self.get_total_paid(obj)


class SupplierPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierPayment
        fields = '__all__'
