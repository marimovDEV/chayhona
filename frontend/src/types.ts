// ==========================================
// MENYU TYPES
// ==========================================
export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  itemsCount: number;
}

export interface RecipeItem {
  id: string;
  menuItem: string;
  ingredient: string;
  quantity: number;
  ingredientName: string;
  ingredientUnit: string;
  ingredientPurchasePrice: number;
  cost: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  sellingPrice: number;
  isAvailable: boolean;
  description: string;
  recipes: RecipeItem[];
  foodCost: number;
  profitPerItem: number;
  foodCostPercent: number;
}

// ==========================================
// XODIMLAR TYPES
// ==========================================
export interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  salary: number; // in UZS
  startDate: string;
  notes: string;
  avatarInitials: string;
  totalFines?: number;
  totalAdvances?: number;
  remainingSalary?: number;
}

export interface WarehouseItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number; // in UZS
  sellPrice: number; // in UZS (can be null/0 if raw ingredient)
  minThreshold: number;
  currentQty: number;
  status: 'normal' | 'low' | 'critical';
}

export interface CartItem {
  productId?: string;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PosTable {
  id: string; // the Table model ID
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  billAmount: number;
  items: CartItem[];
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  guestsCount: number;
  date: string;
  time: string;
  tableNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export interface TableModel {
  id: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface Debt {
  id: string;
  amount: number;
  date: string;
  itemDescription: string;
  status?: 'OPEN' | 'PARTIAL' | 'PAID';
  remainingDebt?: number;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  paymentType: 'naqd' | 'uzcard' | 'humo' | 'click' | 'payme' | 'transfer';
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  status: 'faol' | 'to\'langan';
  debts?: Debt[];
  payments?: DebtPayment[];
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  paymentMethod: 'naqd' | 'uzcard' | 'humo' | 'click' | 'payme' | 'transfer';
}

export interface InventoryHistory {
  id: string;
  itemName: string;
  type: 'kirim' | 'chiqim';
  quantity: number;
  unit: string;
  user: string;
  timeAgo: string;
  amount: number; // Total value
}

export interface SalePayment {
  paymentType: 'naqd' | 'uzcard' | 'humo' | 'click' | 'payme' | 'transfer';
  amount: number;
}

export interface Sale {
  id: string;
  date: string;
  cabinName: string | null;
  tapchanName: string | null;
  tableId: string | null;
  tableName: string | null;
  totalAmount: number;
  items: CartItem[];
  payments: SalePayment[];
  status?: 'ACTIVE' | 'CANCELLED';
}

export interface FinanceStats {
  cash_balance: number;
  card_balance: number;
  transfer_balance: number;
}

export interface DailyReport {
  id: string;
  date: string;
  totalSales: number;
  cashTotal: number;
  cardTotal: number;
  clickTotal: number;
  paymeTotal: number;
  transferTotal: number;
  expenseTotal: number;
  profit: number;
}

export interface DashboardStats {
  todayRevenue: number;
  todayRevenueChange: number;
  todayExpense: number;
  todayExpenseChange: number;
  todayProfit: number;
  monthRevenue: number;
  monthRevenueChange: number;
  monthExpense: number;
  monthProfit: number;
  activeReservations: number;
  activeDebtors: number;
  inventoryCount: number;
}

export interface TopItem {
  name: string;
  qty: number;
}

export interface ChartData {
  date?: string; // For daily
  month?: string; // For monthly
  revenue: number;
  expense: number;
  profit: number;
}

export interface StatisticsKPI {
  average_check: number;
  busiest_hours: { hour: string; orders: number }[];
  busiest_days: { day: string; orders: number }[];
}

export interface FullStatistics {
  sales_stats: {
    daily_revenue: number;
    weekly_revenue: number;
    monthly_revenue: number;
    yearly_revenue: number;
  };
  finance_stats: {
    revenue: number;
    expense: number;
    profit: number;
  };
  customer_stats: {
    average_check: number;
    hourly_distribution: { hour: string; count: number }[];
  };
  product_stats: {
    top_items: { name: string; qty: number }[];
    least_items: { name: string; qty: number }[];
  };
  warehouse_stats: {
    top_used: { name: string; qty: number }[];
    low_stock: number;
    out_of_stock: number;
  };
}

export interface InventoryCheck {
  id: string;
  product: string;
  productName?: string; // product_name maps to productName in serialization/adaption
  productUnit?: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  date: string;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
}

export interface SupplierDebt {
  id: string;
  supplier: string;
  supplierName?: string;
  itemDescription: string;
  amount: number;
  date: string;
  status: 'OPEN' | 'PARTIAL' | 'PAID';
  remainingDebt?: number;
  totalPaid?: number;
}

export interface SupplierPayment {
  id: string;
  debt: string;
  paymentType: 'naqd' | 'uzcard' | 'humo' | 'click' | 'payme' | 'transfer';
  amount: number;
  date: string;
}
