import axios from 'axios';
import { Employee, WarehouseItem, Reservation, Debtor, Expense, PosTable, TableModel, InventoryHistory, Sale, CartItem, SalePayment, FinanceStats, DailyReport, DashboardStats, Debt, DebtPayment, FullStatistics, ChartData, TopItem, StatisticsKPI, MenuCategory, MenuItem, RecipeItem, InventoryCheck, Supplier, SupplierDebt, SupplierPayment } from './types';

const API_BASE_URL = 'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const loginAdmin = async (username: string, password: string): Promise<{ token: string; username: string; user_id: number }> => {
  const res = await api.post('auth/login/', { username, password });
  return res.data;
};

export const changeCredentials = async (credentials: { username?: string; current_password: string; new_password?: string }): Promise<any> => {
  const res = await api.post('auth/change-credentials/', credentials);
  return res.data;
};


// --- Adapters for Employees ---
export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await api.get('employees/employees/');
  return res.data.map((e: any) => ({
    id: e.id.toString(),
    name: e.fio,
    phone: e.phone,
    position: e.role,
    salary: parseFloat(e.salary),
    startDate: e.start_date,
    notes: e.note || '',
    avatarInitials: e.fio.substring(0, 2).toUpperCase(),
    totalFines: e.total_fines !== undefined ? parseFloat(e.total_fines) : 0,
    totalAdvances: e.total_advances !== undefined ? parseFloat(e.total_advances) : 0,
    remainingSalary: e.remaining_salary !== undefined ? parseFloat(e.remaining_salary) : parseFloat(e.salary)
  }));
};

export const createEmployee = async (emp: Employee) => {
  const res = await api.post('employees/employees/', {
    fio: emp.name,
    phone: emp.phone,
    role: emp.position,
    salary: emp.salary.toString(),
    start_date: emp.startDate,
    note: emp.notes
  });
  return res.data;
};

export const updateEmployee = async (id: string, emp: Employee) => {
  const res = await api.put(`employees/employees/${id}/`, {
    fio: emp.name,
    phone: emp.phone,
    role: emp.position,
    salary: emp.salary.toString(),
    start_date: emp.startDate,
    note: emp.notes
  });
  return res.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await api.delete(`employees/employees/${id}/`);
  return res.data;
};

export const fetchEmployeeProfile = async (id: string): Promise<any> => {
  const res = await api.get(`employees/employees/${id}/profile/`);
  return res.data;
};

export const createEmployeeFine = async (fine: { employee: string; amount: number; reason: string; date: string }) => {
  const res = await api.post('employees/fines/', {
    employee: fine.employee,
    amount: fine.amount.toString(),
    reason: fine.reason,
    date: fine.date
  });
  return res.data;
};

export const createEmployeeAdvance = async (advance: { employee: string; amount: number; date: string; note?: string; advance_type?: string }) => {
  const res = await api.post('employees/advances/', {
    employee: advance.employee,
    amount: advance.amount.toString(),
    date: advance.date,
    note: advance.note || '',
    advance_type: advance.advance_type || 'avans'
  });
  return res.data;
};
export const createAttendance = async (att: { employee: string; date: string; time_in?: string | null; time_out?: string | null }): Promise<any> => {
  const res = await api.post('employees/attendance/', att);
  return res.data;
};

export const updateAttendance = async (id: string, att: { employee: string; date: string; time_in?: string | null; time_out?: string | null }): Promise<any> => {
  const res = await api.put(`employees/attendance/${id}/`, att);
  return res.data;
};


// --- Adapters for Inventory ---
export const fetchWarehouseItems = async (): Promise<WarehouseItem[]> => {
  const res = await api.get('inventory/products/');
  return res.data.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    category: p.category_name || 'Boshqa',
    unit: p.unit,
    purchasePrice: parseFloat(p.purchase_price),
    sellPrice: parseFloat(p.selling_price),
    minThreshold: parseFloat(p.min_stock),
    currentQty: parseFloat(p.current_stock),
    status: parseFloat(p.current_stock) <= parseFloat(p.min_stock) ? 'low' : 'normal'
  }));
};

export const createWarehouseItem = async (item: any) => {
  const res = await api.post('inventory/products/', {
    name: item.name,
    category: item.categoryId || null, // Assuming you might have categoryId if you implement select
    unit: item.unit,
    purchase_price: item.purchasePrice,
    selling_price: item.sellPrice,
    min_stock: item.minThreshold,
    current_stock: item.currentQty || 0
  });
  return res.data;
};

export const updateWarehouseItem = async (id: string, item: any) => {
  const res = await api.put(`inventory/products/${id}/`, {
    name: item.name,
    category: item.categoryId || null,
    unit: item.unit,
    purchase_price: item.purchasePrice,
    selling_price: item.sellPrice,
    min_stock: item.minThreshold,
    current_stock: item.currentQty
  });
  return res.data;
};

export const deleteWarehouseItem = async (id: string) => {
  const res = await api.delete(`inventory/products/${id}/`);
  return res.data;
};

export const createStockEntry = async (productId: string, quantity: number, purchasePrice: number, note: string) => {
  const res = await api.post('inventory/entries/', {
    product: productId,
    quantity: quantity.toString(),
    purchase_price: purchasePrice.toString(),
    note: note
  });
  return res.data;
};

export const createStockExit = async (productId: string, quantity: number, reason: string) => {
  const res = await api.post('inventory/exits/', {
    product: productId,
    quantity: quantity.toString(),
    reason: reason
  });
  return res.data;
};

export const fetchInventoryHistory = async (): Promise<any[]> => {
  const res = await api.get('inventory/history/');
  return res.data;
};

// --- Adapters for Reservations ---
export const createReservation = async (reservation: any) => {
  let tableId = null;
  // Try to find the matching table ID if we pass the tables list somehow, 
  // or we can pass tableId directly in reservation.tableId.
  // We'll update ReservationsView to pass tableId as tableNumber or a new field.
  const payload = {
    customer_name: reservation.name,
    phone: reservation.phone,
    date: reservation.date,
    time: reservation.time,
    guests_count: reservation.guestsCount,
    table: reservation.tableId || null
  };
  const res = await api.post('reservations/reservations/', payload);
  return res.data;
};

// --- Adapters for Tables ---
export const fetchTables = async (): Promise<TableModel[]> => {
  const res = await api.get('sales/tables/');
  return res.data.map((t: any) => ({
    id: t.id.toString(),
    name: t.name,
    capacity: t.capacity,
    status: t.status
  }));
};

export const createTable = async (table: Omit<TableModel, 'id'>) => {
  const res = await api.post('sales/tables/', table);
  return res.data;
};

export const updateTable = async (id: string, table: Partial<TableModel>) => {
  const res = await api.patch(`sales/tables/${id}/`, table);
  return res.data;
};

export const deleteTable = async (id: string) => {
  const res = await api.delete(`sales/tables/${id}/`);
  return res.data;
};

export const fetchReservations = async (): Promise<Reservation[]> => {
  const res = await api.get('reservations/reservations/');
  return res.data.map((r: any) => ({
    id: r.id.toString(),
    name: r.customer_name,
    phone: r.phone,
    guestsCount: r.guests_count,
    date: r.date,
    time: r.time,
    tableNumber: r.table_name || r.cabin_name || r.tapchan_name || 'Aniqlanmagan',
    status: r.status as any
  }));
};

export const updateReservationStatus = async (id: string, status: string) => {
  const res = await api.patch(`reservations/reservations/${id}/`, { status });
  return res.data;
};

// Placeholder removed

// --- Adapters for Finance ---
export const fetchDebtors = async (): Promise<Debtor[]> => {
  const res = await api.get('finance/debtors/');
  return res.data.map((d: any) => ({
    id: d.id.toString(),
    name: d.name,
    phone: d.phone,
    totalDebt: parseFloat(d.total_debt || 0),
    totalPaid: parseFloat(d.total_paid || 0),
    remainingDebt: parseFloat(d.remaining_debt || 0),
    status: parseFloat(d.remaining_debt || 0) > 0 ? 'faol' : 'to\'langan'
  }));
};

export const fetchDebts = async (debtorId: string): Promise<Debt[]> => {
  const res = await api.get(`finance/debts/?debtor=${debtorId}`);
  return res.data.map((d: any) => ({
    id: d.id.toString(),
    amount: parseFloat(d.amount),
    date: d.date.split('T')[0],
    itemDescription: d.item_description,
    status: d.status,
    remainingDebt: parseFloat(d.remaining_debt || 0)
  }));
};

export const fetchDebtPayments = async (debtorId: string): Promise<DebtPayment[]> => {
  const res = await api.get(`finance/debt-payments/?debt__debtor=${debtorId}`);
  return res.data.map((d: any) => ({
    id: d.id.toString(),
    amount: parseFloat(d.amount),
    date: d.date.split('T')[0],
    paymentType: d.payment_type
  }));
};

export const createDebtor = async (debtor: Partial<Debtor>) => {
  const res = await api.post('finance/debtors/', {
    name: debtor.name,
    phone: debtor.phone
  });
  return res.data;
};

export const createDebt = async (debtorId: string, amount: number, description: string) => {
  const res = await api.post('finance/debts/', {
    debtor: debtorId,
    amount: amount.toString(),
    item_description: description
  });
  return res.data;
};

export const createDebtPayment = async (debtId: string, amount: number, paymentType: string) => {
  const res = await api.post('finance/debt-payments/', {
    debt: debtId,
    amount: amount.toString(),
    payment_type: paymentType,
    is_full_payment: false
  });
  return res.data;
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await api.get('finance/expenses/');
  return res.data.map((e: any) => ({
    id: e.id.toString(),
    name: e.name,
    amount: parseFloat(e.amount),
    category: e.category_name || 'Boshqa',
    date: e.date.split('T')[0],
    notes: e.note || '',
    paymentMethod: e.payment_type || 'naqd'
  }));
};

export const createExpense = async (exp: Expense) => {
  const res = await api.post('finance/expenses/', {
    name: exp.name,
    amount: exp.amount,
    note: exp.notes,
    payment_type: exp.paymentMethod
    // category processing omitted for brevity
  });
  return res.data;
};

export const fetchFinanceStats = async (): Promise<FinanceStats> => {
  const res = await api.get('finance/stats/');
  return {
    cash_balance: parseFloat(res.data.cash_balance),
    card_balance: parseFloat(res.data.card_balance),
    transfer_balance: parseFloat(res.data.transfer_balance),
  };
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('finance/dashboard/');
  const data = res.data;
  return {
    todayRevenue: parseFloat(data.today_revenue),
    todayRevenueChange: parseFloat(data.today_revenue_change || 0),
    todayExpense: parseFloat(data.today_expense),
    todayExpenseChange: parseFloat(data.today_expense_change || 0),
    todayProfit: parseFloat(data.today_profit),
    monthRevenue: parseFloat(data.monthly_revenue),
    monthRevenueChange: parseFloat(data.monthly_revenue_change || 0),
    monthExpense: parseFloat(data.monthly_expense),
    monthProfit: parseFloat(data.monthly_profit),
    activeReservations: parseInt(data.active_reservations, 10),
    activeDebtors: parseInt(data.active_debtors, 10),
    inventoryCount: parseFloat(data.inventory_count)
  };
};

export const fetchDailyChart = async (days: number = 7): Promise<ChartData[]> => {
  const res = await api.get(`finance/dashboard/daily-chart/?days=${days}`);
  return res.data.map((d: any) => ({
    date: d.date,
    revenue: parseFloat(d.revenue),
    expense: parseFloat(d.expense),
    profit: parseFloat(d.profit)
  }));
};

export const fetchMonthlyChart = async (): Promise<ChartData[]> => {
  const res = await api.get('finance/dashboard/monthly-chart/');
  return res.data.map((d: any) => ({
    month: d.month,
    revenue: parseFloat(d.revenue),
    expense: parseFloat(d.expense),
    profit: parseFloat(d.profit)
  }));
};

export const fetchTopProducts = async (): Promise<TopItem[]> => {
  const res = await api.get('finance/dashboard/top-products/');
  return res.data;
};

export const fetchTopDrinks = async (): Promise<TopItem[]> => {
  const res = await api.get('finance/dashboard/top-drinks/');
  return res.data;
};

export const fetchStatisticsKPI = async (): Promise<StatisticsKPI> => {
  const res = await api.get('finance/statistics/kpi/');
  return res.data;
};

export const fetchFullStatistics = async (): Promise<FullStatistics> => {
  const res = await api.get('finance/full-statistics/');
  return res.data;
};

// --- Adapters for Sales ---
export const fetchSales = async (): Promise<Sale[]> => {
  const res = await api.get('sales/sales/');
  return res.data.map((s: any) => ({
    id: s.id.toString(),
    date: s.date,
    cabinName: s.cabin_name || null,
    tapchanName: s.tapchan_name || null,
    tableId: s.table ? s.table.toString() : null,
    tableName: s.table_name || null,
    totalAmount: parseFloat(s.total_amount),
    status: s.status,
    items: (s.items || []).map((i: any) => ({
      productId: i.product?.toString(),
      menuItemId: i.menu_item?.toString(),
      name: i.menu_item_name || i.product_name || 'Noma\'lum',
      price: parseFloat(i.price),
      quantity: parseFloat(i.quantity)
    })),
    payments: (s.payments || []).map((p: any) => ({
      paymentType: p.payment_type,
      amount: parseFloat(p.amount)
    }))
  }));
};

export const checkoutSale = async (table: PosTable, payments: SalePayment[]): Promise<any> => {
  const tableId = table.id;
  
  const payload = {
    table_type: 'table', // We can just send 'table' since we unified them
    table_id: tableId,
    total_amount: table.billAmount * 1.1, // Include 10% service charge
    items: table.items.map(i => ({
      product: i.productId || null,
      menu_item: i.menuItemId || null,
      quantity: i.quantity,
      price: i.price
    })),
    payments: payments.map(p => ({
      payment_type: p.paymentType,
      amount: p.amount
    }))
  };

  const res = await api.post('sales/sales/checkout/', payload);
  return res.data;
};
export const checkoutDirectSale = async (payload: any): Promise<any> => {
  const res = await api.post('sales/sales/checkout/', payload);
  return res.data;
};


export const cancelSale = async (saleId: string): Promise<any> => {
  const res = await api.post(`sales/sales/${saleId}/cancel/`);
  return res.data;
};

export const closeShift = async (): Promise<any> => {
  const res = await api.post('sales/shifts/close_shift/');
  return res.data;
};

export const fetchShifts = async (): Promise<any[]> => {
  const res = await api.get('sales/shifts/');
  return res.data;
};

export const sendTelegramReport = async (): Promise<any> => {
  const res = await api.post('reports/send-telegram/');
  return res.data;
};

// --- Adapters for Menu ---
export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  const res = await api.get('menu/categories/');
  return res.data.map((c: any) => ({
    id: c.id.toString(),
    name: c.name,
    order: c.order,
    itemsCount: c.items_count || 0
  }));
};

export const createMenuCategory = async (name: string, order: number = 0) => {
  const res = await api.post('menu/categories/', { name, order });
  return res.data;
};

export const updateMenuCategory = async (id: string, name: string, order: number) => {
  const res = await api.put(`menu/categories/${id}/`, { name, order });
  return res.data;
};

export const deleteMenuCategory = async (id: string) => {
  const res = await api.delete(`menu/categories/${id}/`);
  return res.data;
};

export const fetchMenuItems = async (categoryId?: string): Promise<MenuItem[]> => {
  const url = categoryId ? `menu/items/?category=${categoryId}` : 'menu/items/';
  const res = await api.get(url);
  return res.data.map((m: any) => ({
    id: m.id.toString(),
    name: m.name,
    category: m.category?.toString() || '',
    categoryName: m.category_name || 'Boshqa',
    sellingPrice: parseFloat(m.selling_price),
    isAvailable: m.is_available,
    description: m.description || '',
    recipes: (m.recipes || []).map((r: any) => ({
      id: r.id.toString(),
      menuItem: r.menu_item.toString(),
      ingredient: r.ingredient.toString(),
      quantity: parseFloat(r.quantity),
      ingredientName: r.ingredient_name,
      ingredientUnit: r.ingredient_unit,
      ingredientPurchasePrice: parseFloat(r.ingredient_purchase_price || 0),
      cost: parseFloat(r.cost || 0)
    })),
    foodCost: parseFloat(m.food_cost || 0),
    profitPerItem: parseFloat(m.profit_per_item || 0),
    foodCostPercent: parseFloat(m.food_cost_percent || 0)
  }));
};

export const createMenuItem = async (item: { name: string; category: string; selling_price: number; description?: string }) => {
  const res = await api.post('menu/items/', {
    name: item.name,
    category: item.category || null,
    selling_price: item.selling_price.toString(),
    description: item.description || '',
    is_available: true
  });
  return res.data;
};

export const updateMenuItem = async (id: string, item: { name: string; category: string; selling_price: number; is_available: boolean; description?: string }) => {
  const res = await api.put(`menu/items/${id}/`, {
    name: item.name,
    category: item.category || null,
    selling_price: item.selling_price.toString(),
    is_available: item.is_available,
    description: item.description || ''
  });
  return res.data;
};

export const deleteMenuItem = async (id: string) => {
  const res = await api.delete(`menu/items/${id}/`);
  return res.data;
};

export const addRecipe = async (menuItemId: string, ingredientId: string, quantity: number) => {
  const res = await api.post('menu/recipes/', {
    menu_item: menuItemId,
    ingredient: ingredientId,
    quantity: quantity.toString()
  });
  return res.data;
};

export const updateRecipe = async (id: string, quantity: number) => {
  const res = await api.patch(`menu/recipes/${id}/`, {
    quantity: quantity.toString()
  });
  return res.data;
};

export const deleteRecipe = async (id: string) => {
  const res = await api.delete(`menu/recipes/${id}/`);
  return res.data;
};

export const fetchFoodCostReport = async () => {
  const res = await api.get('menu/food-cost/');
  return res.data;
};

export const fetchInventoryChecks = async (): Promise<InventoryCheck[]> => {
  const res = await api.get('inventory/checks/');
  return res.data.map((c: any) => ({
    id: c.id.toString(),
    product: c.product.toString(),
    productName: c.product_name,
    productUnit: c.product_unit,
    systemQty: parseFloat(c.system_qty),
    actualQty: parseFloat(c.actual_qty),
    difference: parseFloat(c.difference),
    date: c.date,
    note: c.note || ''
  }));
};

export const createInventoryCheck = async (check: { product: string; system_qty: number; actual_qty: number; difference: number; note?: string }) => {
  const res = await api.post('inventory/checks/', check);
  return res.data;
};

// --- Adapters for Suppliers ---
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const res = await api.get('finance/suppliers/');
  return res.data.map((s: any) => ({
    id: s.id.toString(),
    name: s.name,
    phone: s.phone,
    category: s.category,
    totalDebt: parseFloat(s.total_debt || 0),
    totalPaid: parseFloat(s.total_paid || 0),
    remainingDebt: parseFloat(s.remaining_debt || 0)
  }));
};

export const createSupplier = async (supplier: { name: string; phone: string; category: string }) => {
  const res = await api.post('finance/suppliers/', supplier);
  return res.data;
};

export const fetchSupplierDebts = async (): Promise<SupplierDebt[]> => {
  const res = await api.get('finance/supplier-debts/');
  return res.data.map((d: any) => ({
    id: d.id.toString(),
    supplier: d.supplier.toString(),
    supplierName: d.supplier_name,
    itemDescription: d.item_description,
    amount: parseFloat(d.amount),
    date: d.date,
    status: d.status,
    totalPaid: parseFloat(d.total_paid || 0),
    remainingDebt: parseFloat(d.remaining_debt || 0)
  }));
};

export const fetchSupplierPayments = async (): Promise<SupplierPayment[]> => {
  const res = await api.get('finance/supplier-payments/');
  return res.data.map((p: any) => ({
    id: p.id.toString(),
    debt: p.debt.toString(),
    paymentType: p.payment_type,
    amount: parseFloat(p.amount),
    date: p.date
  }));
};

export const createSupplierDebt = async (debt: { supplier: string; item_description: string; amount: number }) => {
  const res = await api.post('finance/supplier-debts/', {
    supplier: debt.supplier,
    item_description: debt.item_description,
    amount: debt.amount.toString()
  });
  return res.data;
};

export const createSupplierPayment = async (payment: { debt: string; payment_type: string; amount: number }) => {
  const res = await api.post('finance/supplier-payments/', {
    debt: payment.debt,
    payment_type: payment.payment_type,
    amount: payment.amount.toString()
  });
  return res.data;
};
