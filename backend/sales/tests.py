from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from inventory.models import Product, ProductCategory
from sales.models import Shift, Sale, SaleItem, Tapchan
from decimal import Decimal

class SalesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='testadmin', password='password123', email='admin@test.com')
        self.client.force_authenticate(user=self.user)
        self.category = ProductCategory.objects.create(name="Drinks")
        self.product = Product.objects.create(
            name="Cola",
            category=self.category,
            unit="dona",
            purchase_price=5000,
            selling_price=10000,
            current_stock=10
        )
        self.shift = Shift.objects.create(status='open')
        self.tapchan = Tapchan.objects.create(name="Tapchan 1")

    def test_sale_create_and_stock_exit(self):
        # Test Sale Create checkout
        payload = {
            "table_type": "tapchan",
            "table_id": self.tapchan.id,
            "total_amount": 20000,
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 2,
                    "price": 10000
                }
            ],
            "payments": [
                {
                    "payment_type": "naqd",
                    "amount": 20000
                }
            ]
        }
        res = self.client.post('/api/sales/sales/checkout/', payload, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        
        # Check stock reduced
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 8)

        # Check finance stats increased
        res_stats = self.client.get('/api/finance/stats/')
        self.assertEqual(res_stats.data['cash_balance'], 20000.00)

        sale_id = res.data['id']
        # Test Sale Cancel
        res_cancel = self.client.post(f'/api/sales/sales/{sale_id}/cancel/')
        self.assertEqual(res_cancel.status_code, 200)

        # Check stock restored
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 10)

        # Check finance stats rollback
        res_stats2 = self.client.get('/api/finance/stats/')
        self.assertEqual(res_stats2.data['cash_balance'], 0)

    def test_payment_validation(self):
        # Underpayment should fail
        payload = {
            "table_type": "tapchan",
            "table_id": self.tapchan.id,
            "total_amount": 20000,
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 2,
                    "price": 10000
                }
            ],
            "payments": [
                {
                    "payment_type": "naqd",
                    "amount": 10000  # < 20000
                }
            ]
        }
        res = self.client.post('/api/sales/sales/checkout/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("To'lov summasi yetarli emas", str(res.data))

    def test_stock_exit_validation(self):
        # Try to buy 15 colas when stock is 10
        payload = {
            "table_type": "tapchan",
            "table_id": self.tapchan.id,
            "total_amount": 150000,
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 15,
                    "price": 10000
                }
            ],
            "payments": [
                {
                    "payment_type": "naqd",
                    "amount": 150000
                }
            ]
        }
        res = self.client.post('/api/sales/sales/checkout/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("Omborda yetarli mahsulot yo'q", str(res.data))
