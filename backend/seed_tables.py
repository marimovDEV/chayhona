import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sales.models import Table

Table.objects.all().delete()

for i in range(1, 11):
    Table.objects.create(name=f"Kabina {i}", capacity=6, status='AVAILABLE')

for i in range(1, 41):
    Table.objects.create(name=f"Tapchan {i}", capacity=8, status='AVAILABLE')

for i in range(1, 11):
    Table.objects.create(name=f"Stol {i}", capacity=4, status='AVAILABLE')

print("Seeded 10 kabina, 40 tapchan, 10 stol.")
