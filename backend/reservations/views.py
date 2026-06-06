from rest_framework import viewsets
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer
from datetime import datetime, timedelta
from django.utils import timezone
from sales.models import Sale, Shift

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def list(self, request, *args, **kwargs):
        # Auto-cancel NO_SHOW reservations (30 minutes passed)
        now = timezone.now()
        reservations = self.get_queryset().filter(status__in=['PENDING', 'CONFIRMED'])
        for res in reservations:
            dt = timezone.make_aware(datetime.combine(res.date, res.time))
            if now > dt + timedelta(minutes=30):
                res.status = 'NO_SHOW'
                res.save(update_fields=['status'])
        
        return super().list(request, *args, **kwargs)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'ARRIVED':
            # Create a Sale if not exists
            shift = Shift.objects.filter(status='open').first()
            if not shift:
                shift = Shift.objects.create(status='open')

            if instance.cabin:
                sale_exists = Sale.objects.filter(cabin=instance.cabin, status='ACTIVE').exists()
                if not sale_exists:
                    Sale.objects.create(cabin=instance.cabin, shift=shift, status='ACTIVE', total_amount=0)
            elif instance.tapchan:
                sale_exists = Sale.objects.filter(tapchan=instance.tapchan, status='ACTIVE').exists()
                if not sale_exists:
                    Sale.objects.create(tapchan=instance.tapchan, shift=shift, status='ACTIVE', total_amount=0)
            elif instance.table:
                sale_exists = Sale.objects.filter(table=instance.table, status='ACTIVE').exists()
                if not sale_exists:
                    Sale.objects.create(table=instance.table, shift=shift, status='ACTIVE', total_amount=0)
