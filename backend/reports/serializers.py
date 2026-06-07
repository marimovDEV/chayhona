from rest_framework import serializers
from .models import DailyReport, TelegramConfig, TelegramAdmin

class DailyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReport
        fields = '__all__'

class TelegramConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramConfig
        fields = ['id', 'bot_token']

class TelegramAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramAdmin
        fields = ['id', 'name', 'chat_id', 'is_active', 'created_at']
        read_only_fields = ['created_at']
