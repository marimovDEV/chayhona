import axios from 'axios';
import { Employee, WarehouseItem, Reservation, Debtor, Expense, PosTable, TableModel, InventoryHistory, Sale, CartItem, SalePayment, FinanceStats, DailyReport, DashboardStats, Debt, DebtPayment, FullStatistics, ChartData, TopItem, StatisticsKPI } from './types';

const API_BASE_URL = 'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    avatarInitials: e.fio.substring(0, 2).toUpperCase()
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
  const res = await api.put(`sales/tables/${id}/`, table);
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
    tableNumber: r.table ? r.table.name : (r.cabin_name || r.tapchan_name || 'Aniqlanmagan'),
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
    totalAmount: parseFloat(s.total_amount),
    status: s.status,
    items: (s.items || []).map((i: any) => ({
      productId: i.product?.toString(),
      name: i.product_name || 'Noma\'lum',
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

export const cancelSale = async (saleId: string): Promise<any> => {
  const res = await api.post(`sales/sales/${saleId}/cancel/`);
  return res.data;
};

export const closeShift = async (): Promise<any> => {
  const res = await api.post('sales/shifts/close_shift/');
  return res.data;
};

export const sendTelegramReport = async (): Promise<any> => {
  const res = await api.post('reports/send-telegram/');
  return res.data;
};
