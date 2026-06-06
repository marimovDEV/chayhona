import os
import shutil
from datetime import datetime
from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DailyReport
from .serializers import DailyReportSerializer

class DailyReportViewSet(viewsets.ModelViewSet):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer

@api_view(['POST'])
def create_backup(request):
    try:
        db_path = settings.DATABASES['default']['NAME']
        backup_name = f"backup_{datetime.now().strftime('%Y_%m_%d_%H%M%S')}.db"
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            
        backup_path = os.path.join(backup_dir, backup_name)
        shutil.copy2(db_path, backup_path)
        
        return Response({'message': 'Backup created successfully', 'file': backup_name})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def list_backups(request):
    try:
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        if not os.path.exists(backup_dir):
            return Response([])
        
        files = [f for f in os.listdir(backup_dir) if f.endswith('.db')]
        return Response(files)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def restore_backup(request):
    try:
        backup_name = request.data.get('filename')
        if not backup_name:
            return Response({'error': 'Filename is required'}, status=400)
            
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        backup_path = os.path.join(backup_dir, backup_name)
        
        if not os.path.exists(backup_path):
            return Response({'error': 'Backup file not found'}, status=404)
            
        db_path = settings.DATABASES['default']['NAME']
        shutil.copy2(backup_path, db_path)
        
        return Response({'message': 'Backup restored successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def send_telegram_report(request):
    try:
        from .telegram import generate_daily_report_text, send_telegram_message
        message = generate_daily_report_text()
        success = send_telegram_message(message)
        if success:
            return Response({'message': 'Telegram hisobot muvaffaqiyatli yuborildi'})
        else:
            return Response({'error': 'Telegramga yuborishda xatolik yuz berdi. Bot token yoki Chat ID ni tekshiring.'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
