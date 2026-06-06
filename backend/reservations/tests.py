from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Reservation
from sales.models import Cabin, Tapchan, Sale, Shift

class ReservationIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cabin = Cabin.objects.create(name='Kabina 1')
        self.tapchan = Tapchan.objects.create(name='Tapchan 1')
        self.shift = Shift.objects.create(status='open')

    def test_double_booking_validation(self):
        # Create a pending reservation
        Reservation.objects.create(
            customer_name='Ali',
            phone='12345',
            date=timezone.now().date(),
            time=(timezone.now() + timedelta(hours=3)).time(),
            guests_count=4,
            cabin=self.cabin,
            status='PENDING'
        )

        # Attempt to create an overlapping reservation within 2 hours
        data = {
            'customer_name': 'Vali',
            'phone': '54321',
            'date': timezone.now().date(),
            'time': (timezone.now() + timedelta(hours=4)).time(),
            'guests_count': 2,
            'cabin': self.cabin.id
        }
        res = self.client.post('/api/reservations/reservations/', data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', res.data)
        
        # Valid reservation in another cabin
        del data['cabin']
        data['tapchan'] = self.tapchan.id
        res2 = self.client.post('/api/reservations/reservations/', data)
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

    def test_arrived_integration(self):
        resv = Reservation.objects.create(
            customer_name='Ali',
            phone='12345',
            date=timezone.now().date(),
            time=(timezone.now() + timedelta(hours=1)).time(),
            guests_count=4,
            cabin=self.cabin,
            status='CONFIRMED'
        )

        # Update to ARRIVED
        res = self.client.patch(f'/api/reservations/reservations/{resv.id}/', {'status': 'ARRIVED'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Check if Sale is created
        sale_exists = Sale.objects.filter(cabin=self.cabin, status='ACTIVE').exists()
        self.assertTrue(sale_exists)

    def test_no_show_logic(self):
        past_time = timezone.now() - timedelta(hours=1)
        resv = Reservation.objects.create(
            customer_name='Ali',
            phone='12345',
            date=past_time.date(),
            time=past_time.time(),
            guests_count=4,
            cabin=self.cabin,
            status='CONFIRMED'
        )

        # Hitting list endpoint should auto-cancel it to NO_SHOW
        res = self.client.get('/api/reservations/reservations/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        resv.refresh_from_db()
        self.assertEqual(resv.status, 'NO_SHOW')

