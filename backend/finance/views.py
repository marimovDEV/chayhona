from rest_framework import viewsets
from .models import Debtor, Debt, DebtPayment, ExpenseCategory, Expense
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from sales.models import SalePayment, Sale, SaleItem
from inventory.models import Product
from reservations.models import Reservation
from django.utils import timezone
from datetime import timedelta
from .serializers import DebtorSerializer, DebtSerializer, DebtPaymentSerializer, ExpenseCategorySerializer, ExpenseSerializer

class DebtorViewSet(viewsets.ModelViewSet):
    queryset = Debtor.objects.all()
    serializer_class = DebtorSerializer

class DebtViewSet(viewsets.ModelViewSet):
    queryset = Debt.objects.all()
    serializer_class = DebtSerializer

class DebtPaymentViewSet(viewsets.ModelViewSet):
    queryset = DebtPayment.objects.all()
    serializer_class = DebtPaymentSerializer

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        from django.db.models import Sum

        debt = serializer.validated_data['debt']
        amount = serializer.validated_data['amount']

        total_paid = debt.payments.aggregate(Sum('amount'))['amount__sum'] or 0
        remaining_debt = debt.amount - total_paid

        if amount > remaining_debt:
            raise ValidationError({"error": f"To'lov summasi qarzdorlikdan ({remaining_debt} UZS) oshib ketishi mumkin emas."})

        payment = serializer.save()

        # Update debt status
        new_total_paid = total_paid + amount
        if new_total_paid >= debt.amount:
            debt.status = 'PAID'
        elif new_total_paid > 0:
            debt.status = 'PARTIAL'
        else:
            debt.status = 'OPEN'
        debt.save(update_fields=['status'])

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

@api_view(['GET'])
def finance_stats(request):
    # Cash
    cash_sales = SalePayment.objects.filter(payment_type='naqd', sale__status='ACTIVE').aggregate(Sum('amount'))['amount__sum'] or 0
    cash_expenses = Expense.objects.filter(payment_type='naqd').aggregate(Sum('amount'))['amount__sum'] or 0
    cash_debt_payments = DebtPayment.objects.filter(payment_type='naqd').aggregate(Sum('amount'))['amount__sum'] or 0
    cash_balance = cash_sales - cash_expenses + cash_debt_payments

    # Card
    card_sales = SalePayment.objects.filter(payment_type__in=['uzcard', 'humo'], sale__status='ACTIVE').aggregate(Sum('amount'))['amount__sum'] or 0
    card_expenses = Expense.objects.filter(payment_type__in=['uzcard', 'humo']).aggregate(Sum('amount'))['amount__sum'] or 0
    card_debt_payments = DebtPayment.objects.filter(payment_type__in=['uzcard', 'humo']).aggregate(Sum('amount'))['amount__sum'] or 0
    card_balance = card_sales - card_expenses + card_debt_payments

    # Bank Transfer
    transfer_sales = SalePayment.objects.filter(payment_type='transfer', sale__status='ACTIVE').aggregate(Sum('amount'))['amount__sum'] or 0
    transfer_expenses = Expense.objects.filter(payment_type='transfer').aggregate(Sum('amount'))['amount__sum'] or 0
    transfer_debt_payments = DebtPayment.objects.filter(payment_type='transfer').aggregate(Sum('amount'))['amount__sum'] or 0
    transfer_balance = transfer_sales - transfer_expenses + transfer_debt_payments

    return Response({
        "cash_balance": cash_balance,
        "card_balance": card_balance,
        "transfer_balance": transfer_balance,
    })

@api_view(['GET'])
def dashboard_stats(request):
    now = timezone.now()
    today = now.date()
    month_start = now.replace(day=1).date()
    
    # Today stats
    today_revenue = Sale.objects.filter(date__date=today, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    today_expense = Expense.objects.filter(date__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
    today_profit = today_revenue - today_expense
    
    yesterday = today - timedelta(days=1)
    yesterday_revenue = Sale.objects.filter(date__date=yesterday, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    yesterday_expense = Expense.objects.filter(date__date=yesterday).aggregate(Sum('amount'))['amount__sum'] or 0
    
    today_revenue_change = round(((today_revenue - yesterday_revenue) / yesterday_revenue * 100), 1) if yesterday_revenue > 0 else (100 if today_revenue > 0 else 0)
    today_expense_change = round(((today_expense - yesterday_expense) / yesterday_expense * 100), 1) if yesterday_expense > 0 else (100 if today_expense > 0 else 0)

    # Month stats
    monthly_revenue = Sale.objects.filter(date__date__gte=month_start, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    monthly_expense = Expense.objects.filter(date__date__gte=month_start).aggregate(Sum('amount'))['amount__sum'] or 0
    monthly_profit = monthly_revenue - monthly_expense
    
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_end = month_start
    last_month_revenue = Sale.objects.filter(date__date__gte=last_month_start, date__date__lt=last_month_end, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    monthly_revenue_change = round(((monthly_revenue - last_month_revenue) / last_month_revenue * 100), 1) if last_month_revenue > 0 else (100 if monthly_revenue > 0 else 0)

    
    # Operational stats
    active_reservations = Reservation.objects.filter(date=today, status__in=['PENDING', 'CONFIRMED']).count()
    
    # Debtor calculation
    debtors = Debtor.objects.all()
    active_debtors = 0
    for d in debtors:
        d_debts = d.debts.aggregate(Sum('amount'))['amount__sum'] or 0
        d_payments = DebtPayment.objects.filter(debt__debtor=d).aggregate(Sum('amount'))['amount__sum'] or 0
        if (d_debts - d_payments) > 0:
            active_debtors += 1
            
    inventory_count = Product.objects.aggregate(Sum('current_stock'))['current_stock__sum'] or 0

    return Response({
        "today_revenue": today_revenue,
        "today_revenue_change": today_revenue_change,
        "today_expense": today_expense,
        "today_expense_change": today_expense_change,
        "today_profit": today_profit,
        "monthly_revenue": monthly_revenue,
        "monthly_revenue_change": monthly_revenue_change,
        "monthly_expense": monthly_expense,
        "monthly_profit": monthly_profit,
        "active_reservations": active_reservations,
        "active_debtors": active_debtors,
        "inventory_count": inventory_count
    })

@api_view(['GET'])
def daily_chart(request):
    now = timezone.now()
    days = int(request.query_params.get('days', 7))
    
    data = []
    for i in range(days - 1, -1, -1):
        target_date = (now - timedelta(days=i)).date()
        s_rev = Sale.objects.filter(date__date=target_date, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        s_exp = Expense.objects.filter(date__date=target_date).aggregate(Sum('amount'))['amount__sum'] or 0
        data.append({
            "date": target_date.strftime("%d-%b"),
            "revenue": s_rev,
            "expense": s_exp,
            "profit": s_rev - s_exp
        })
    return Response(data)

@api_view(['GET'])
def monthly_chart(request):
    now = timezone.now()
    months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"]
    
    data = []
    for month in range(1, 13):
        m_start = now.replace(month=month, day=1).date()
        if month == 12:
            m_end = now.replace(year=now.year + 1, month=1, day=1).date()
        else:
            m_end = now.replace(month=month + 1, day=1).date()
            
        m_rev = Sale.objects.filter(date__date__gte=m_start, date__date__lt=m_end, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        m_exp = Expense.objects.filter(date__date__gte=m_start, date__date__lt=m_end).aggregate(Sum('amount'))['amount__sum'] or 0
        
        data.append({
            "month": months[month - 1],
            "revenue": m_rev,
            "expense": m_exp,
            "profit": m_rev - m_exp
        })
    return Response(data)

@api_view(['GET'])
def top_products(request):
    now = timezone.now()
    month_start = now.replace(day=1).date()
    
    top_items_qs = SaleItem.objects.filter(
        sale__date__date__gte=month_start, 
        sale__status='ACTIVE'
    ).exclude(product__category__name__icontains='ichimlik').values('product__name').annotate(total_qty=Sum('quantity')).order_by('-total_qty')[:5]
    
    return Response([{"name": item['product__name'] or "Noma'lum", "qty": float(item['total_qty'])} for item in top_items_qs])

@api_view(['GET'])
def top_drinks(request):
    now = timezone.now()
    month_start = now.replace(day=1).date()
    
    top_drinks_qs = SaleItem.objects.filter(
        sale__date__date__gte=month_start, 
        sale__status='ACTIVE',
        product__category__name__icontains='ichimlik'
    ).values('product__name').annotate(total_qty=Sum('quantity')).order_by('-total_qty')[:5]
    
    return Response([{"name": item['product__name'] or "Noma'lum", "qty": float(item['total_qty'])} for item in top_drinks_qs])

@api_view(['GET'])
def statistics_kpi(request):
    from django.db.models.functions import ExtractHour, ExtractWeekDay
    
    total_sales = Sale.objects.filter(status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_orders = Sale.objects.filter(status='ACTIVE').count()
    average_check = (total_sales / total_orders) if total_orders > 0 else 0
    
    # Busiest hours
    hourly_data = Sale.objects.filter(status='ACTIVE').annotate(hour=ExtractHour('date')).values('hour').annotate(count=Count('id')).order_by('-count')[:5]
    busiest_hours = [{"hour": f"{item['hour']:02d}:00", "orders": item['count']} for item in hourly_data]
    
    # Busiest days (1=Sunday, 2=Monday... depending on DB, postgres usually 1=Sunday or 0=Sunday)
    daily_data = Sale.objects.filter(status='ACTIVE').annotate(day=ExtractWeekDay('date')).values('day').annotate(count=Count('id')).order_by('-count')[:7]
    days_map = {1: "Yakshanba", 2: "Dushanba", 3: "Seshanba", 4: "Chorshanba", 5: "Payshanba", 6: "Juma", 7: "Shanba"}
    busiest_days = [{"day": days_map.get(item['day'], "Noma'lum"), "orders": item['count']} for item in daily_data]
    
    return Response({
        "average_check": average_check,
        "busiest_hours": busiest_hours,
        "busiest_days": busiest_days
    })

@api_view(['GET'])
def full_statistics(request):
    now = timezone.now()
    today = now.date()
    month_start = now.replace(day=1).date()
    week_start = today - timedelta(days=today.weekday())
    year_start = now.replace(month=1, day=1).date()

    # Sales Stats
    daily_revenue = Sale.objects.filter(date__date=today, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    weekly_revenue = Sale.objects.filter(date__date__gte=week_start, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    monthly_revenue = Sale.objects.filter(date__date__gte=month_start, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    yearly_revenue = Sale.objects.filter(date__date__gte=year_start, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0

    # Finance Stats
    total_sales = Sale.objects.filter(status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_expenses = Expense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    net_profit = total_sales - total_expenses

    # Customer Stats
    total_orders = Sale.objects.filter(status='ACTIVE').count()
    average_check = (total_sales / total_orders) if total_orders > 0 else 0

    # Hourly distribution
    hourly_distribution = []
    # To get hourly dist we can extract the hour from date
    from django.db.models.functions import ExtractHour
    hourly_data = Sale.objects.filter(status='ACTIVE').annotate(hour=ExtractHour('date')).values('hour').annotate(count=Count('id')).order_by('hour')
    for item in hourly_data:
        hourly_distribution.append({
            "hour": f"{item['hour']:02d}:00",
            "count": item['count']
        })

    # Top and Least sold items
    item_stats = SaleItem.objects.filter(sale__status='ACTIVE').values('product__name').annotate(total_qty=Sum('quantity')).order_by('-total_qty')
    top_items = [{"name": item['product__name'] or "O'chirilgan mahsulot", "qty": float(item['total_qty'])} for item in item_stats[:10]]
    least_items = [{"name": item['product__name'] or "O'chirilgan mahsulot", "qty": float(item['total_qty'])} for item in item_stats.reverse()[:5]]

    # Warehouse Stats
    from inventory.models import StockExit, Product
    from django.db.models import F
    top_used_qs = StockExit.objects.values('product__name').annotate(total_qty=Sum('quantity')).order_by('-total_qty')
    top_used = [{"name": item['product__name'] or "Noma'lum", "qty": float(item['total_qty'])} for item in top_used_qs[:5]]
    
    low_stock = Product.objects.filter(current_stock__lte=F('min_stock'), current_stock__gt=0).count()
    out_of_stock = Product.objects.filter(current_stock__lte=0).count()

    return Response({
        "sales_stats": {
            "daily_revenue": daily_revenue,
            "weekly_revenue": weekly_revenue,
            "monthly_revenue": monthly_revenue,
            "yearly_revenue": yearly_revenue
        },
        "finance_stats": {
            "revenue": total_sales,
            "expense": total_expenses,
            "profit": net_profit
        },
        "customer_stats": {
            "average_check": average_check,
            "hourly_distribution": hourly_distribution
        },
        "product_stats": {
            "top_items": top_items,
            "least_items": least_items
        },
        "warehouse_stats": {
            "top_used": top_used,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock
        }
    })
