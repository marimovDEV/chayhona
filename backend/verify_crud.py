import requests

BASE_URL = 'http://127.0.0.1:8000/api'
s = requests.Session()

def run_tests():
    print("--- 1. Employees CRUD ---")
    res = s.post(f"{BASE_URL}/employees/employees/", json={
        "fio": "Test User", "phone": "998901234567", "role": "Ofitsiant",
        "salary": 5000, "start_date": "2026-06-06"
    })
    assert res.status_code == 201, f"Create employee failed: {res.text}"
    emp_id = res.json()["id"]
    
    res = s.put(f"{BASE_URL}/employees/employees/{emp_id}/", json={
        "fio": "Test User Updated", "phone": "998901234567", "role": "Menejer",
        "salary": 6000, "start_date": "2026-06-06"
    })
    assert res.status_code == 200, f"Update employee failed: {res.text}"
    
    res = s.delete(f"{BASE_URL}/employees/employees/{emp_id}/")
    assert res.status_code == 204, f"Delete employee failed: {res.text}"
    print("Employees CRUD OK.")

    print("--- 2. Warehouse/Inventory CRUD ---")
    
    cat_id = None
    res_cat = s.post(f"{BASE_URL}/inventory/categories/", json={"name": "Test Cat"})
    if res_cat.status_code == 201:
        cat_id = res_cat.json()["id"]
        
    res = s.post(f"{BASE_URL}/inventory/products/", json={
        "name": "Test Prod", "category": cat_id, "unit": "kg",
        "purchase_price": 100, "selling_price": 200, "min_stock": 10,
        "current_stock": 10
    })
    
    assert res.status_code == 201, f"Create product failed: {res.text}"
    prod_id = res.json()["id"]

    res = s.put(f"{BASE_URL}/inventory/products/{prod_id}/", json={
        "name": "Test Prod Updated", "category": cat_id, "unit": "kg",
        "purchase_price": 100, "selling_price": 250, "min_stock": 10,
        "current_stock": 10
    })
    assert res.status_code == 200, f"Update product failed: {res.text}"

    # Entries
    res = s.post(f"{BASE_URL}/inventory/entries/", json={
        "product": prod_id, "quantity": 50, "purchase_price": 100, "note": "Test Entry"
    })
    assert res.status_code == 201, f"Create entry failed: {res.text}"

    # Exits
    res = s.post(f"{BASE_URL}/inventory/exits/", json={
        "product": prod_id, "quantity": 10, "reason": "Test Exit"
    })
    assert res.status_code == 201, f"Create exit failed: {res.text}"

    print("Warehouse CRUD OK.")

    print("--- 3. Sales & Tables ---")
    res = s.post(f"{BASE_URL}/sales/tables/", json={
        "name": "Test Table", "capacity": 4, "status": "AVAILABLE"
    })
    assert res.status_code == 201, f"Create table failed: {res.text}"
    table_id = res.json()["id"]

    res = s.post(f"{BASE_URL}/sales/sales/checkout/", json={
        "table_id": table_id,
        "items": [{"product": prod_id, "price": 250, "quantity": 2}],
        "payments": [{"payment_type": "naqd", "amount": 500}],
        "total_amount": 500
    })
    assert res.status_code in [200, 201], f"Checkout failed: {res.text}"
    print("Sales Checkout OK.")

    print("--- 4. Reservations ---")
    res = s.post(f"{BASE_URL}/reservations/reservations/", json={
        "customer_name": "Res User", "phone": "123", "guests_count": 4,
        "date": "2026-06-06", "time": "18:00:00", "table": table_id,
        "status": "PENDING"
    })
    assert res.status_code == 201, f"Create reservation failed: {res.text}"
    res_id = res.json()["id"]

    res = s.patch(f"{BASE_URL}/reservations/reservations/{res_id}/", json={
        "status": "CONFIRMED"
    })
    assert res.status_code == 200, f"Update reservation failed: {res.text}"
    
    res = s.delete(f"{BASE_URL}/reservations/reservations/{res_id}/")
    assert res.status_code == 204, f"Delete reservation failed: {res.text}"
    print("Reservations CRUD OK.")

    print("--- 5. Finance Expenses ---")
    
    exp_cat_id = None
    res_exp_cat = s.post(f"{BASE_URL}/finance/expense-categories/", json={"name": "Test Exp Cat"})
    if res_exp_cat.status_code == 201:
        exp_cat_id = res_exp_cat.json()["id"]

    res = s.post(f"{BASE_URL}/finance/expenses/", json={
        "name": "Test Expense", "amount": 1000, "category": exp_cat_id,
        "date": "2026-06-06", "payment_type": "naqd"
    })
    assert res.status_code == 201, f"Create expense failed: {res.text}"
    exp_id = res.json()["id"]

    res = s.delete(f"{BASE_URL}/finance/expenses/{exp_id}/")
    assert res.status_code == 204, f"Delete expense failed: {res.text}"
    print("Finance Expenses CRUD OK.")

    print("--- 6. Finance Debtors ---")
    res = s.post(f"{BASE_URL}/finance/debtors/", json={
        "name": "Debtor User", "phone": "123"
    })
    assert res.status_code == 201, f"Create debtor failed: {res.text}"
    debtor_id = res.json()["id"]

    res = s.post(f"{BASE_URL}/finance/debtors/add_payment/", json={
        "debtor_id": debtor_id, "amount": 100, "payment_type": "naqd"
    })
    if res.status_code == 400:
        pass # Validation rejected because debt is 0
    else:
        assert res.status_code == 200, f"Add payment failed unexpectedly: {res.text}"

    res = s.delete(f"{BASE_URL}/finance/debtors/{debtor_id}/")
    assert res.status_code == 204, f"Delete debtor failed: {res.text}"
    print("Finance Debtors CRUD OK.")

    print("ALL TESTS PASSED WITH ZERO ERRORS!")

run_tests()
