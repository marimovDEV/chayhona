from rest_framework import viewsets
from .models import Cabin, Tapchan, Sale, SaleItem, SalePayment, DailyReport, Shift, Table
from .serializers import CabinSerializer, TapchanSerializer, SaleSerializer, SaleItemSerializer, SalePaymentSerializer, DailyReportSerializer, ShiftSerializer, TableSerializer
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from datetime import date
from django.db.models import Sum
from finance.models import Expense

class CabinViewSet(viewsets.ModelViewSet):
    queryset = Cabin.objects.all()
    serializer_class = CabinSerializer

class TapchanViewSet(viewsets.ModelViewSet):
    queryset = Tapchan.objects.all()
    serializer_class = TapchanSerializer

class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        from rest_framework.exceptions import ValidationError
        from django.db import transaction
        from django.db.models import F
        from inventory.models import Product

        data = request.data
        table_type = data.get('table_type')
        table_id = data.get('table_id')
        items = data.get('items', [])
        payments = data.get('payments', [])
        total_amount = data.get('total_amount', 0)

        # Validate payments
        total_paid = sum(p.get('amount', 0) for p in payments)
        if total_paid < total_amount:
            raise ValidationError({"error": "To'lov summasi yetarli emas!"})

        # Get open shift
        shift = Shift.objects.filter(status='open').first()
        if not shift:
            shift = Shift.objects.create(status='open')

        with transaction.atomic():
            sale = Sale.objects.create(
                total_amount=total_amount,
                status='ACTIVE',
                shift=shift
            )
            
            if table_type == 'kabina':
                sale.cabin_id = table_id
            elif table_type == 'tapchan':
                sale.tapchan_id = table_id
            else:
                sale.table_id = table_id
            sale.save()

            for item_data in items:
                product_id = item_data.get('product')
                qty = item_data.get('quantity')
                price = item_data.get('price')
                
                if product_id:
                    product = Product.objects.select_for_update().get(id=product_id)
                    if product.current_stock < qty:
                        raise ValidationError({"error": f"Omborda yetarli mahsulot yo'q: {product.name}. Qoldiq: {product.current_stock}"})
                    product.current_stock = F('current_stock') - qty
                    product.save(update_fields=['current_stock'])
                
                SaleItem.objects.create(
                    sale=sale,
                    product_id=product_id,
                    quantity=qty,
                    price=price
                )
            
            for p_data in payments:
                SalePayment.objects.create(
                    sale=sale,
                    payment_type=p_data.get('payment_type'),
                    amount=p_data.get('amount')
                )

        return Response(SaleSerializer(sale).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        from django.db import transaction
        from django.db.models import F
        from inventory.models import Product

        sale = self.get_object()
        if sale.status == 'CANCELLED':
            return Response({"error": "Sotuv allaqachon bekor qilingan."}, status=400)

        with transaction.atomic():
            sale.status = 'CANCELLED'
            sale.save(update_fields=['status'])

            for item in sale.items.all():
                if item.product:
                    product = Product.objects.select_for_update().get(pk=item.product.pk)
                    product.current_stock = F('current_stock') + item.quantity
                    product.save(update_fields=['current_stock'])

        return Response({"status": "cancelled", "sale_id": sale.id})

class SaleItemViewSet(viewsets.ModelViewSet):
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        item = serializer.save()
        sale = item.sale
        
        if item.product:
            if item.product.current_stock < item.quantity:
                item.delete()
                raise ValidationError({"quantity": f"Omborda yetarli mahsulot yo'q. Qoldiq: {item.product.current_stock}"})
            
            item.product.current_stock -= item.quantity
            item.product.save()

        sale.total_amount += (item.quantity * item.price)
        sale.save()

    def perform_destroy(self, instance):
        sale = instance.sale
        sale.total_amount -= (instance.quantity * instance.price)
        sale.save()

        if instance.product:
            instance.product.current_stock += instance.quantity
            instance.product.save()
        
        instance.delete()

class SalePaymentViewSet(viewsets.ModelViewSet):
    queryset = SalePayment.objects.all()
    serializer_class = SalePaymentSerializer

class DailyReportViewSet(viewsets.ModelViewSet):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    @action(detail=False, methods=['post'])
    def close_shift(self, request):
        from django.utils import timezone
        shift = Shift.objects.filter(status='open').first()
        if not shift:
            return Response({"error": "Ochiq smena topilmadi!"}, status=400)
        
        shift.closed_at = timezone.now()
        shift.status = 'closed'
        
        # Aggregate stats
        sales = Sale.objects.filter(shift=shift, status='ACTIVE')
        shift.total_sales = sales.aggregate(total=Sum('total_amount'))['total'] or 0

        payments = SalePayment.objects.filter(sale__in=sales)
        shift.cash_total = payments.filter(payment_type='naqd').aggregate(total=Sum('amount'))['total'] or 0
        shift.card_total = payments.filter(payment_type__in=['uzcard', 'humo']).aggregate(total=Sum('amount'))['total'] or 0
        
        # Basic expense handling for shift (for now just all expenses in this period)
        expenses = Expense.objects.filter(date__gte=shift.opened_at, date__lte=shift.closed_at)
        shift.expense_total = expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        shift.profit = shift.total_sales - shift.expense_total
        shift.save()

        # Open new shift automatically
        new_shift = Shift.objects.create(status='open')

        return Response({
            "closed_shift": ShiftSerializer(shift).data,
            "new_shift": ShiftSerializer(new_shift).data
        })

@api_view(['POST'])
def close_day(request):
    today = date.today()
    if DailyReport.objects.filter(date=today).exists():
        return Response({"error": "Bugun uchun hisobot allaqachon yopilgan!"}, status=400)
    
    # Calculate everything for today
    today_sales = Sale.objects.filter(date__date=today)
    total_sales = today_sales.aggregate(total=Sum('total_amount'))['total'] or 0

    payments = SalePayment.objects.filter(sale__in=today_sales)
    cash_total = payments.filter(payment_type='naqd').aggregate(total=Sum('amount'))['total'] or 0
    card_total = payments.filter(payment_type__in=['uzcard', 'humo']).aggregate(total=Sum('amount'))['total'] or 0
    click_total = payments.filter(payment_type='click').aggregate(total=Sum('amount'))['total'] or 0
    payme_total = payments.filter(payment_type='payme').aggregate(total=Sum('amount'))['total'] or 0
    transfer_total = payments.filter(payment_type='transfer').aggregate(total=Sum('amount'))['total'] or 0

    today_expenses = Expense.objects.filter(date__date=today)
    expense_total = today_expenses.aggregate(total=Sum('amount'))['total'] or 0

    profit = total_sales - expense_total

    report = DailyReport.objects.create(
        date=today,
        total_sales=total_sales,
        cash_total=cash_total,
        card_total=card_total,
        click_total=click_total,
        payme_total=payme_total,
        transfer_total=transfer_total,
        expense_total=expense_total,
        profit=profit
    )

    return Response(DailyReportSerializer(report).data)
