import os
import requests
from django.conf import settings
from datetime import date
from django.db.models import Sum, F
from sales.models import Sale, SaleItem
from finance.models import Expense
from inventory.models import Product


def get_bot_token():
    """DB dan bot tokenni oladi, yo'q bo'lsa settings.py dagi default ishlatiladi"""
    from .models import TelegramConfig
    config = TelegramConfig.get_config()
    if config.bot_token:
        return config.bot_token.strip()
    return getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()


def get_admin_chat_ids():
    """DB dan barcha faol admin chat ID larni oladi"""
    from .models import TelegramAdmin
    admins = TelegramAdmin.objects.filter(is_active=True)
    chat_ids = [str(c).strip() for c in admins.values_list('chat_id', flat=True) if str(c).strip()]
    
    # Agar DB da hech kim bo'lmasa, settings.py dagi default ishlatiladi
    if not chat_ids:
        default_id = getattr(settings, 'TELEGRAM_CHAT_ID', '').strip()
        if default_id:
            chat_ids = [default_id]
    
    return chat_ids


def send_telegram_message(message: str):
    bot_token = get_bot_token()
    chat_ids = get_admin_chat_ids()
    
    if not bot_token:
        return False, "Telegram bot token sozlanmagan."
    
    if not chat_ids:
        return False, "Hech qanday admin chat ID topilmadi."

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    success = False
    errors = []
    
    for chat_id in chat_ids:
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        try:
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                success = True
            else:
                err_msg = response.json().get('description', response.text)
                errors.append(f"{chat_id}: {err_msg}")
        except Exception as e:
            errors.append(f"{chat_id}: {str(e)}")
    
    if not success and errors:
        return False, " | ".join(errors)
        
    return success, "OK"


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
