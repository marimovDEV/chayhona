from rest_framework import serializers
from .models import Reservation
from datetime import datetime, timedelta

class ReservationSerializer(serializers.ModelSerializer):
    cabin_name = serializers.CharField(source='cabin.name', read_only=True)
    tapchan_name = serializers.CharField(source='tapchan.name', read_only=True)
    table_name = serializers.CharField(source='table.name', read_only=True)

    class Meta:
        model = Reservation
        fields = '__all__'

    def validate(self, attrs):
        cabin = attrs.get('cabin', getattr(self.instance, 'cabin', None))
        tapchan = attrs.get('tapchan', getattr(self.instance, 'tapchan', None))
        date = attrs.get('date', getattr(self.instance, 'date', None))
        time = attrs.get('time', getattr(self.instance, 'time', None))
        status = attrs.get('status', getattr(self.instance, 'status', 'PENDING'))

        table = attrs.get('table', getattr(self.instance, 'table', None))

        if not cabin and not tapchan and not table:
            raise serializers.ValidationError("Kabin, tapchan yoki stol tanlanishi shart.")

        if status in ['PENDING', 'CONFIRMED'] and date and time:
            dt = datetime.combine(date, time)
            start_time = (dt - timedelta(hours=2)).time()
            end_time = (dt + timedelta(hours=2)).time()

            # Check existing overlapping reservations
            overlapping = Reservation.objects.filter(
                date=date,
                time__gte=start_time,
                time__lte=end_time,
                status__in=['PENDING', 'CONFIRMED']
            )

            # Ignore the current reservation when updating
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if cabin:
                overlapping = overlapping.filter(cabin=cabin)
                if overlapping.exists():
                    raise serializers.ValidationError({"error": "Ushbu kabina bu vaqt oralig'ida (±2 soat) band."})
            elif tapchan:
                overlapping = overlapping.filter(tapchan=tapchan)
                if overlapping.exists():
                    raise serializers.ValidationError({"error": "Ushbu tapchan bu vaqt oralig'ida (±2 soat) band."})
            elif table:
                overlapping = overlapping.filter(table=table)
                if overlapping.exists():
                    raise serializers.ValidationError({"error": "Ushbu stol bu vaqt oralig'ida (±2 soat) band."})

        return attrs
