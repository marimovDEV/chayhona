from django.core.management.base import BaseCommand
from reports.telegram_bot import send_daily_report

class Command(BaseCommand):
    help = 'Sends the daily report via Telegram and saves it to the database'

    def handle(self, *args, **kwargs):
        self.stdout.write('Calculating and sending daily report...')
        send_daily_report()
        self.stdout.write(self.style.SUCCESS('Successfully sent daily report.'))
