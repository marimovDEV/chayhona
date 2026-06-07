import os
import requests
from django.conf import settings
from datetime import date
from django.db.models import Sum, F
from sales.models import Sale, SaleItem
from finance.models import Expense
from inventory.models import Product

def send_telegram_message(message: str):
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', os.environ.get('TELEGRAM_BOT_TOKEN', ''))
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', os.environ.get('TELEGRAM_CHAT_ID', ''))
    
    if not bot_token or not chat_id:
        print("Telegram bot token or chat ID is not configured.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending telegram message: {e}")
        return False

def generate_daily_report_text():
    today = date.today()
    
    today_revenue = Sale.objects.filter(date__date=today, status='ACTIVE').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    today_expense = Expense.objects.filter(date__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
    today_profit = today_revenue - today_expense

    # 1. Sold items list
    today_items = SaleItem.objects.filter(
        sale__date__date=today,
        sale__status='ACTIVE'
    ).values(
        'menu_item__name', 'product__name'
    ).annotate(
        total_qty=Sum('quantity')
    ).order_by('-total_qty')

    sold_items_str = ""
    for item in today_items:
        name = item['menu_item__name'] or item['product__name'] or "Noma'lum"
        qty = float(item['total_qty'])
        sold_items_str += f"  • {name} — {qty:g} dona\n"
    
    if not sold_items_str:
        sold_items_str = "  <i>Bugun hali mahsulot sotilmadi.</i>\n"

    # 2. Warehouse stocks
    all_products = Product.objects.filter(is_active=True).order_by('name')
    stock_str = ""
    for prod in all_products:
        qty = float(prod.current_stock)
        stock_str += f"  • {prod.name} — {qty:g} {prod.unit}\n"
    
    if not stock_str:
        stock_str = "  <i>Omborda mahsulotlar mavjud emas.</i>\n"

    # 3. Low stock warning
    low_stock_products = Product.objects.filter(
        is_active=True,
        current_stock__lte=F('min_stock')
    ).order_by('name')
    
    low_stock_str = ""
    for prod in low_stock_products:
        curr = float(prod.current_stock)
        min_s = float(prod.min_stock)
        low_stock_str += f"  🔴 {prod.name} ({curr:g} {prod.unit} / min: {min_s:g} {prod.unit})\n"
        
    if not low_stock_str:
        low_stock_str = "  ✅ Barcha mahsulotlar yetarli miqdorda.\n"

    message = f"📊 <b>Kunlik Hisobot ({today.strftime('%d.%m.%Y')})</b>\n\n"
    message += f"💰 <b>Tushum:</b> {today_revenue:,.0f} UZS\n"
    message += f"📉 <b>Xarajat:</b> {today_expense:,.0f} UZS\n"
    message += f"💵 <b>Sof foyda:</b> {today_profit:,.0f} UZS\n\n"
    
    message += f"🍽 <b>Sotilgan mahsulotlar:</b>\n{sold_items_str}\n"
    message += f"📦 <b>Ombor qoldig'i:</b>\n{stock_str}\n"
    message += f"⚠️ <b>Kam qolgan mahsulotlar:</b>\n{low_stock_str}"
    
    return message

