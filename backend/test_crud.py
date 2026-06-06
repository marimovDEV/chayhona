import requests
from datetime import datetime

BASE_URL = 'http://127.0.0.1:8000/api'

def test_warehouse():
    print("Testing Warehouse CRUD...")
    # Add Item
    res = requests.post(f"{BASE_URL}/inventory/items/", json={
        "name": "Test Item", "category": "Test Cat", "unit": "kg",
        "purchase_price": 1000, "sell_price": 2000, "min_threshold": 5
    })
    assert res.status_code == 201, f"Failed to add item: {res.text}"
    item_id = res.json()["id"]
    
    # Entry
    res = requests.post(f"{BASE_URL}/inventory/entries/", json={
        "item_id": item_id, "quantity": 10, "price_per_unit": 1000, "note": "Test entry"
    })
    assert res.status_code == 201, f"Failed to add entry: {res.text}"
    
    # Exit
    res = requests.post(f"{BASE_URL}/inventory/exits/", json={
        "item_id": item_id, "quantity": 2, "reason": "Test exit"
    })
    assert res.status_code == 201, f"Failed to add exit: {res.text}"

def test_employees():
    print("Testing Employees CRUD...")
    res = requests.post(f"{BASE_URL}/employees/", json={
        "fio": "Test Employee", "phone": "123456789", "role": "Ofitsiant",
        "salary": 1500000, "start_date": "2026-06-06"
    })
    assert res.status_code == 201, f"Failed to add employee: {res.text}"

def test_finance():
    print("Testing Finance CRUD...")
    res = requests.post(f"{BASE_URL}/finance/expenses/", json={
        "name": "Test Expense", "amount": 5000, "category": "Test",
        "date": "2026-06-06", "payment_method": "naqd"
    })
    assert res.status_code == 201, f"Failed to add expense: {res.text}"

def test_reservations():
    print("Testing Reservations CRUD...")
    # First get a table
    res = requests.get(f"{BASE_URL}/tables/")
    if res.status_code == 200 and len(res.json()) > 0:
        table_id = res.json()[0]["id"]
        res = requests.post(f"{BASE_URL}/reservations/", json={
            "name": "Test Res", "phone": "123", "guests_count": 2,
            "date": "2026-06-06", "time": "18:00:00", "table_id": table_id,
            "status": "PENDING"
        })
        assert res.status_code == 201, f"Failed to add reservation: {res.text}"

try:
    test_warehouse()
    test_employees()
    test_finance()
    test_reservations()
    print("All basic CRUD operations succeeded!")
except AssertionError as e:
    print(f"Error: {e}")

