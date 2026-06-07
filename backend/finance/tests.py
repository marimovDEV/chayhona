from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from decimal import Decimal
from .models import Debtor, Debt, DebtPayment
from sales.models import Sale, SalePayment, Shift

class DebtorsIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='testadmin1', password='password123', email='admin1@test.com')
        self.client.force_authenticate(user=self.user)
        self.debtor = Debtor.objects.create(name="Ali", phone="998901234567")
        self.debt = Debt.objects.create(debtor=self.debtor, item_description="Osh", amount=Decimal('500000.00'))

    def test_debt_payment_validation(self):
        # Attempt to pay 600,000 when debt is 500,000
        payload = {
            "debt": self.debt.id,
            "payment_type": "payme",
            "amount": "600000.00"
        }
        res = self.client.post('/api/finance/debt-payments/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", str(res.data))

        # Refresh debt status
        self.debt.refresh_from_db()
        self.assertEqual(self.debt.status, "OPEN")

    def test_debt_finance_integration(self):
        # Make a valid payment
        payload = {
            "debt": self.debt.id,
            "payment_type": "naqd",
            "amount": "300000.00"
        }
        res = self.client.post('/api/finance/debt-payments/', payload, format='json')
        self.assertEqual(res.status_code, 201)

        # Debt status should be PARTIAL
        self.debt.refresh_from_db()
        self.assertEqual(self.debt.status, "PARTIAL")

        # Check finance stats
        res_stats = self.client.get('/api/finance/stats/')
        self.assertEqual(res_stats.data['cash_balance'], 300000.00)

        # Pay the rest
        payload2 = {
            "debt": self.debt.id,
            "payment_type": "naqd",
            "amount": "200000.00"
        }
        self.client.post('/api/finance/debt-payments/', payload2, format='json')
        
        self.debt.refresh_from_db()
        self.assertEqual(self.debt.status, "PAID")
        
        res_stats2 = self.client.get('/api/finance/stats/')
        self.assertEqual(res_stats2.data['cash_balance'], 500000.00)

class DashboardEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='testadmin2', password='password123', email='admin2@test.com')
        self.client.force_authenticate(user=self.user)

    def test_dashboard_stats(self):
        res = self.client.get('/api/finance/dashboard/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('today_revenue', res.data)
        self.assertIn('monthly_revenue', res.data)

    def test_daily_chart(self):
        res = self.client.get('/api/finance/dashboard/daily-chart/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(isinstance(res.data, list))

    def test_monthly_chart(self):
        res = self.client.get('/api/finance/dashboard/monthly-chart/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 12)

    def test_top_products(self):
        res = self.client.get('/api/finance/dashboard/top-products/')
        self.assertEqual(res.status_code, 200)

    def test_top_drinks(self):
        res = self.client.get('/api/finance/dashboard/top-drinks/')
        self.assertEqual(res.status_code, 200)

    def test_statistics_kpi(self):
        res = self.client.get('/api/finance/statistics/kpi/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('average_check', res.data)
        self.assertIn('busiest_hours', res.data)
        self.assertIn('busiest_days', res.data)
