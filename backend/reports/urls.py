from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyReportViewSet, create_backup, list_backups, restore_backup, send_telegram_report, TelegramConfigViewSet, TelegramAdminViewSet

router = DefaultRouter()
router.register(r'daily-reports', DailyReportViewSet)
router.register(r'telegram-config', TelegramConfigViewSet)
router.register(r'telegram-admins', TelegramAdminViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('backup/create/', create_backup, name='create_backup'),
    path('backup/list/', list_backups, name='list_backups'),
    path('backup/restore/', restore_backup, name='restore_backup'),
    path('send-telegram/', send_telegram_report, name='send_telegram_report'),
]
