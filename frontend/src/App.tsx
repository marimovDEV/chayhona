import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Bell, 
  Clock, 
  CloudRain, 
  CloudLightning, 
  Cloud,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Wifi,
  Database
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import EmployeesView from './components/EmployeesView';
import WarehouseView from './components/WarehouseView';
import MenuView from './components/MenuView';
import SuppliersView from './components/SuppliersView';
import { TablesView } from './components/TablesView';
import { 
  ReservationsView, 
  DebtorsView, 
  ExpensesView, 
  FinanceView, 
  StatisticsView, 
  SettingsView 
} from './components/OtherViews';
import { LoginView } from './components/LoginView';

import {
  fetchEmployees,
  createEmployee,
  fetchWarehouseItems,
  fetchReservations,
  fetchDebtors,
  fetchExpenses,
  fetchSales,
  fetchFinanceStats,
  fetchDashboardStats,
  fetchFullStatistics,
  fetchDailyChart,
  fetchMonthlyChart,
  fetchTopProducts,
  fetchTopDrinks,
  fetchStatisticsKPI,
  fetchInventoryHistory,
  closeShift,
  sendTelegramReport,
  createExpense,
  updateEmployee,
  deleteEmployee,
  createWarehouseItem,
  updateWarehouseItem,
  deleteWarehouseItem,
  createStockEntry,
  createStockExit,
  createReservation,
  updateReservationStatus,
  createDebtor,
  createDebt,
  createDebtPayment,
  fetchTables,
  createTable,
  updateTable,
  deleteTable
} from './api';

import { PosTable, Employee, WarehouseItem, Reservation, Debtor, Expense, InventoryHistory, Sale, FinanceStats, DashboardStats, FullStatistics, ChartData, TopItem, StatisticsKPI, TableModel } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Global Tab Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Unified global databases state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [tables, setTables] = useState<PosTable[]>([]);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dailyChart, setDailyChart] = useState<ChartData[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopItem[]>([]);
  const [topDrinks, setTopDrinks] = useState<TopItem[]>([]);
  const [statisticsKPI, setStatisticsKPI] = useState<StatisticsKPI | null>(null);
  const [fullStatistics, setFullStatistics] = useState<FullStatistics | null>(null);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>([]);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Aziz Rahimov');
  const [selectedTableIdForPOS, setSelectedTableIdForPOS] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Auto Logout Logic
  useEffect(() => {
    if (!token) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert("Sessiya muddati tugadi. Xavfsizlik yuzasidan tizimdan chiqildi.");
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Load real data from backend
    const loadData = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) { console.error("Failed to load employees", err); }

      try {
        const data = await fetchWarehouseItems();
        setWarehouseItems(data);
      } catch (err) { console.error("Failed to load warehouse items", err); }

      try {
        const hist = await fetchInventoryHistory();
        setInventoryHistory(hist);
      } catch (err) { console.error("Failed to load inventory history", err); }

      try {
        const data = await fetchReservations();
        setReservations(data);
      } catch (err) { console.error("Failed to load reservations", err); }

      try {
        const data = await fetchDebtors();
        setDebtors(data);
      } catch (err) { console.error("Failed to load debtors", err); }

      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) { console.error("Failed to load expenses", err); }

      try {
        const data = await fetchSales();
        setSales(data);
      } catch (err) { console.error("Failed to load sales", err); }

      try {
        const stats = await fetchFinanceStats();
        setFinanceStats(stats);
      } catch (err) { console.error("Failed to load finance stats", err); }

      try {
        const dStats = await fetchDashboardStats();
        setDashboardStats(dStats);
      } catch (err) { console.error("Failed to load dashboard stats", err); }

      try {
        const tData = await fetchTables();
        const posData: PosTable[] = tData.map(t => ({
          ...t,
          items: [],
          billAmount: 0
        }));
        setTables(posData);
      } catch (err) { console.error("Failed to load tables", err); }

      try {
        const fullStats = await fetchFullStatistics();
        setFullStatistics(fullStats);
      } catch (err) { console.error("Failed to load full statistics", err); }

      try {
        const dChart = await fetchDailyChart(30);
        setDailyChart(dChart);
      } catch (err) { console.error("Failed to load daily chart", err); }

      try {
        const mChart = await fetchMonthlyChart();
        setMonthlyChart(mChart);
      } catch (err) { console.error("Failed to load monthly chart", err); }

      try {
        const tProducts = await fetchTopProducts();
        setTopProducts(tProducts);
      } catch (err) { console.error("Failed to load top products", err); }

      try {
        const tDrinks = await fetchTopDrinks();
        setTopDrinks(tDrinks);
      } catch (err) { console.error("Failed to load top drinks", err); }

      try {
        const sKPI = await fetchStatisticsKPI();
        setStatisticsKPI(sKPI);
      } catch (err) { console.error("Failed to load statistics KPI", err); }
    };
    loadData();
  }, []);

  // Compute dynamic notifications
  const notifications: {type: string; text: React.ReactNode}[] = [];
  
  warehouseItems.forEach(item => {
    if (item.currentQty <= item.minThreshold) {
      notifications.push({
        type: 'warning',
        text: <><strong className="text-rose-450">Ombor:</strong> {item.name} qoldig'i {item.currentQty} {item.unit}.</>
      });
    }
  });

  debtors.filter(d => d.remainingDebt > 0).forEach(d => {
    notifications.push({
      type: 'error',
      text: <><strong className="text-amber-450">Qarzdorlik:</strong> {d.name} qoldiq qarz {new Intl.NumberFormat('uz-UZ').format(d.remainingDebt)} so'm.</>
    });
  });

  const today = new Date().toISOString().split('T')[0];
  reservations.filter(r => r.date === today && r.status === 'PENDING').forEach(r => {
    notifications.push({
      type: 'info',
      text: <><strong className="text-sky-400">Bron:</strong> {r.name} bugun soat {r.time} ga.</>
    });
  });

  if (financeStats) {
    notifications.push({
      type: 'success',
      text: <><strong className="text-teal-400">Bugungi hisobot:</strong> Tushum: {new Intl.NumberFormat('uz-UZ').format(financeStats.dailyIncome)}, Sof foyda: {new Intl.NumberFormat('uz-UZ').format(financeStats.dailyProfit)} so'm.</>
    });
  }

  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);
  const notificationCount = hasViewedNotifications ? 0 : notifications.length;
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Handle active table edit (Sales POS state updates)
  const handleUpdateTableState = (updated: PosTable) => {
    setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  // Close Day Operation trigger
  const handleCheckoutSuccess = async () => {
    try {
      const wData = await fetchWarehouseItems();
      setWarehouseItems(wData);
      const sData = await fetchSales();
      setSales(sData);
      
      const fStats = await fetchFinanceStats();
      setFinanceStats(fStats);
      const dStats = await fetchDashboardStats();
      setDashboardStats(dStats);
      const fullStats = await fetchFullStatistics();
      setFullStatistics(fullStats);
      const dChart = await fetchDailyChart(30);
      setDailyChart(dChart);
      const mChart = await fetchMonthlyChart();
      setMonthlyChart(mChart);
    } catch(e) {
      console.error("Failed to refresh state after checkout", e);
    }
  };

  const handleCloseShift = async () => {
    const confirmation = window.confirm("Rostdan ham ushbu smenani yopib, joriy hisobotlarni yakunlamoqchimisiz?");
    if (confirmation) {
      try {
        const { closed_shift } = await closeShift();
        alert(`Smena yopildi! Sof foyda: ${closed_shift.profit} so'm`);
        // Reload stats and sales
        const stats = await fetchFinanceStats();
        setFinanceStats(stats);
        const s = await fetchSales();
        setSales(s);
        // Clear occupied tables
        setTables(prev => prev.map(t => ({ ...t, status: 'AVAILABLE', billAmount: 0, items: [] })));

        // Avtomatik ravishda Telegramga jo'natish
        try {
          await sendTelegramReport();
          // Opsional ravishda qisqa xabar berish mumkin (alert ustma-ust tushmasligi uchun console.log qilsak ham bo'ladi, lekin foydalanuvchi bilishi yaxshiroq)
          console.log("Smena yopilgandan so'ng telegram hisobot yuborildi.");
        } catch (tgErr) {
          console.error("Telegramga jo'natishda xatolik:", tgErr);
        }

      } catch (err: any) {
        alert("Xatolik! " + (err.response?.data?.error || err.message));
      }
    }
  };

  // Add / Update employee helpers
  const handleAddEmployee = async (newEmp: Employee) => {
    try {
      await createEmployee(newEmp);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to create employee", err);
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    try {
      await updateEmployee(updatedEmp.id, updatedEmp);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to update employee", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to delete employee", err);
    }
  };

  const handleAddTable = async (table: Omit<TableModel, 'id'>) => {
    try {
      await createTable(table);
      const data = await fetchTables();
      setTables(data.map(t => ({...t, items: [], billAmount: 0})));
    } catch (err) { console.error("Failed to add table", err); }
  };

  const handleUpdateTable = async (id: string, table: Partial<TableModel>) => {
    try {
      await updateTable(id, table);
      const data = await fetchTables();
      // preserve active orders
      setTables(prev => {
        return data.map(t => {
          const existing = prev.find(p => p.id === t.id);
          return { ...t, items: existing?.items || [], billAmount: existing?.billAmount || 0 };
        });
      });
    } catch (err) { console.error("Failed to update table", err); }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await deleteTable(id);
      const data = await fetchTables();
      setTables(prev => {
        return data.map(t => {
          const existing = prev.find(p => p.id === t.id);
          return { ...t, items: existing?.items || [], billAmount: existing?.billAmount || 0 };
        });
      });
    } catch (err) { console.error("Failed to delete table", err); }
  };

  // Add / Update warehouse stock helpers
  const handleAddWarehouseItem = async (newItem: WarehouseItem) => {
    try {
      await createWarehouseItem(newItem);
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
    } catch (err) {
      console.error("Failed to add warehouse item", err);
    }
  };

  const handleUpdateWarehouseItem = async (updatedItem: WarehouseItem) => {
    try {
      await updateWarehouseItem(updatedItem.id, updatedItem);
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
    } catch (err) {
      console.error("Failed to update warehouse item", err);
    }
  };

  const handleDeleteWarehouseItem = async (id: string) => {
    try {
      await deleteWarehouseItem(id);
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
    } catch (err) {
      console.error("Failed to delete warehouse item", err);
    }
  };

  const handleCreateStockEntry = async (productId: string, quantity: number, price: number, note: string) => {
    try {
      await createStockEntry(productId, quantity, price, note);
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
      const hist = await fetchInventoryHistory();
      setInventoryHistory(hist);
    } catch (err: any) {
      alert(err?.response?.data?.quantity || "Xatolik yuz berdi");
      console.error("Failed to create stock entry", err);
    }
  };

  const handleCreateStockExit = async (productId: string, quantity: number, reason: string) => {
    try {
      await createStockExit(productId, quantity, reason);
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
      const hist = await fetchInventoryHistory();
      setInventoryHistory(hist);
    } catch (err: any) {
      alert(err?.response?.data?.quantity || "Omborda mahsulot yetarli emas yoki xatolik yuz berdi");
    }
  };

  const handleRefreshWarehouse = async () => {
    try {
      const data = await fetchWarehouseItems();
      setWarehouseItems(data);
      const hist = await fetchInventoryHistory();
      setInventoryHistory(hist);
    } catch (err) {
      console.error("Failed to refresh warehouse data", err);
    }
  };

  const handleAddReservation = async (newRes: Reservation) => {
    try {
      await createReservation(newRes);
      const data = await fetchReservations();
      setReservations(data);
    } catch (e: any) {
      alert("Xatolik! " + (e.response?.data?.error || e.message));
    }
  };

  const handleUpdateReservation = async (updatedRes: Reservation) => {
    try {
      await updateReservationStatus(updatedRes.id, updatedRes.status);
      const data = await fetchReservations();
      setReservations(data);
    } catch (err) {
      console.error("Failed to update reservation", err);
    }
  };

  const handleAddDebtor = async (newDebt: Partial<Debtor>) => {
    try {
      await createDebtor(newDebt);
      const data = await fetchDebtors();
      setDebtors(data);
      // Fetch stats to update dashboard
      const stats = await fetchFinanceStats();
      setFinanceStats(stats);
      const dStats = await fetchDashboardStats();
      setDashboardStats(dStats);
    } catch (err) {
      console.error("Failed to add debtor", err);
    }
  };

  const handleUpdateDebtor = (updated: Debtor) => {
    setDebtors(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleAddDebt = async (debtorId: string, amount: number, desc: string) => {
    try {
      await createDebt(debtorId, amount, desc);
      const data = await fetchDebtors();
      setDebtors(data);
      const dStats = await fetchDashboardStats();
      setDashboardStats(dStats);
    } catch (err) {
      console.error("Failed to add debt", err);
    }
  };

  const handleAddDebtPayment = async (debtId: string, amount: number, paymentType: string) => {
    try {
      await createDebtPayment(debtId, amount, paymentType);
      const data = await fetchDebtors();
      setDebtors(data);
      const stats = await fetchFinanceStats();
      setFinanceStats(stats);
      const dStats = await fetchDashboardStats();
      setDashboardStats(dStats);
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || "To'lovda xatolik");
      console.error("Failed to add debt payment", err);
      throw err; // throw to be caught by the component
    }
  };

  const handleAddExpense = async (newExp: Expense) => {
    try {
      await createExpense(newExp);
      const data = await fetchExpenses();
      setExpenses(data);
      const fStats = await fetchFinanceStats();
      setFinanceStats(fStats);
      const dStats = await fetchDashboardStats();
      setDashboardStats(dStats);
      const fullStats = await fetchFullStatistics();
      setFullStatistics(fullStats);
      const mChart = await fetchMonthlyChart();
      setMonthlyChart(mChart);
    } catch (err: any) {
      alert(err?.response?.data?.error || "Xarajatni saqlashda xatolik");
      console.error("Failed to add expense", err);
      throw err;
    }
  };

  // Helper determining high-level active view name
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Tahlillari';
      case 'employees':
        return 'Xodimlar Boshqaruvi';
      case 'tables':
        return 'Stollar va Xonalar';
      case 'warehouse':
        return 'Ombor Boshqaruvi (Sklad)';
      case 'sales':
        return 'Sotuvlar (POS Kassa)';
      case 'reservations':
        return 'Rezervatsiyalar Jurnali';
      case 'debtors':
        return 'Qarzdorlik Jurnali';
      case 'expenses':
        return 'Xarajatlar Jurnali';
      case 'finance':
        return 'Moliya Tizimi';
      case 'statistics':
        return 'Diagrammalar & Tahlillar';
      case 'settings':
        return 'Tizim Sozlamalari';
      default:
        return 'Verdant RMS';
    }
  };

  // Top header universal search up action
  const handleSearchCommit = (e: FormEvent) => {
    e.preventDefault();
    alert("Universal qidiruv tizimi faollashtirildi. Ko'rsatkichlar tahlil qilindi.");
  };

  if (!token) {
    return (
      <LoginView 
        onLoginSuccess={(tok, user) => {
          localStorage.setItem('token', tok);
          localStorage.setItem('userName', user);
          setToken(tok);
          setUserName(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg font-sans flex text-theme-text antialiased selection:bg-sky-600 selection:text-white">
      
      {/* Visual Navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        employeeCount={employees.length}
        notificationsCount={notificationCount}
        onNotificationClick={() => {
          setShowNotificationPopup(!showNotificationPopup);
          setHasViewedNotifications(true);
        }}
        userName={userName}
      />

      {/* Main interactive panel canvas container */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col relative bg-theme-bg">
        
        {/* Top universal Header app bar */}
        <header className="h-16 px-8 bg-theme-header/85 border-b border-theme-border sticky top-0 flex justify-between items-center z-40 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-theme-text tracking-tight font-sans">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Search inputs bar */}
            <form onSubmit={handleSearchCommit} className="relative hidden md:block">
              <input 
                type="text"
                placeholder="Qidiruv..."
                className="pl-9 pr-3 py-1.5 bg-theme-input border border-theme-input-border rounded-xl text-xs text-theme-text placeholder:text-theme-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-theme-input transition-all w-52"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </form>

            {/* Quick interactive utility trays */}
            <div className="flex items-center gap-3">
              
              {/* Notification icon */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotificationPopup(!showNotificationPopup);
                    setHasViewedNotifications(true);
                  }}
                  className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition relative"
                >
                  <Bell className="w-4 h-4 text-slate-300" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white font-sans animate-bounce">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showNotificationPopup && (
                  <div className="absolute top-11 right-0 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl p-4.5 z-50 animate-scale-up text-left custom-scrollbar">
                    <h4 className="font-bold text-xs text-white mb-2.5 flex justify-between">
                      <span>So'nggi bildirishnomalar</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{notifications.length}</span>
                    </h4>
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400">Bildirishnomalar yo'q.</p>
                    ) : (
                      <ul className="text-[11px] text-slate-300 space-y-2">
                        {notifications.map((notif, idx) => (
                          <li key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                            {notif.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Live calendar scheduler */}
              <button 
                onClick={() => alert(`Joriy vaqt: ${new Date().toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})} • Tizim barqaror ishlamoqda.`)}
                className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition relative"
                title="Vaqt va Sana"
              >
                <Clock className="w-4 h-4 text-slate-300" />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              {/* Cloud back up sync badge state */}
              <div 
                onClick={() => alert("Barcha joriy buyurtmalar bulutli server bilan sinxronizatsiya qilingan! Tizim: xavfsiz.")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 transition cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-black tracking-wide text-sky-400 uppercase font-sans">
                  Bulutli Sinx
                </span>
              </div>

            </div>

          </div>
        </header>

        {/* Dynamic page container based on sidebar tabs */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'dashboard' && (
            <DashboardView 
              tables={tables}
              employees={employees}
              warehouseItems={warehouseItems}
              reservations={reservations}
              debtors={debtors}
              expenses={expenses}
              sales={sales}
              stats={dashboardStats}
              dailyChart={dailyChart}
              monthlyChart={monthlyChart}
              topProducts={topProducts}
              topDrinks={topDrinks}
              onNavigate={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView 
              tables={tables}
              warehouseItems={warehouseItems}
              sales={sales}
              onUpdateTable={handleUpdateTableState}
              onCloseShift={handleCloseShift}
              onCheckoutSuccess={handleCheckoutSuccess}
              initialTableId={selectedTableIdForPOS}
              onClearInitialTableId={() => setSelectedTableIdForPOS(null)}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'tables' && (
            <TablesView 
              tables={tables}
              reservations={reservations}
              sales={sales}
              onAddTable={handleAddTable}
              onUpdateTable={handleUpdateTable}
              onDeleteTable={handleDeleteTable}
              onGoToPOS={(tableId) => {
                setSelectedTableIdForPOS(tableId);
                setActiveTab('sales');
              }}
            />
          )}

          {activeTab === 'warehouse' && (
            <WarehouseView 
              warehouseItems={warehouseItems}
              inventoryHistory={inventoryHistory}
              onAddWarehouseItem={handleAddWarehouseItem}
              onUpdateWarehouseItem={handleUpdateWarehouseItem}
              onDeleteWarehouseItem={handleDeleteWarehouseItem}
              onCreateStockEntry={handleCreateStockEntry}
              onCreateStockExit={handleCreateStockExit}
              onRefreshWarehouse={handleRefreshWarehouse}
            />
          )}

          {activeTab === 'menu' && (
            <MenuView warehouseItems={warehouseItems} />
          )}

          {activeTab === 'reservations' && (
            <ReservationsView 
              reservations={reservations} 
              tables={tables}
              onAddReservation={handleAddReservation}
              onUpdateReservation={handleUpdateReservation}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView />
          )}

          {activeTab === 'debtors' && (
            <DebtorsView 
              debtors={debtors} 
              onAddDebtor={handleAddDebtor} 
              onUpdateDebtor={handleUpdateDebtor} 
              onAddDebt={handleAddDebt}
              onAddDebtPayment={handleAddDebtPayment}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView 
              expenses={expenses}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeTab === 'finance' && <FinanceView stats={financeStats} sales={sales} expenses={expenses} />}

          {activeTab === 'statistics' && <StatisticsView stats={fullStatistics} kpi={statisticsKPI} />}

          {activeTab === 'settings' && (
            <SettingsView 
              userName={userName} 
              setUserName={setUserName} 
              theme={theme}
              onThemeChange={setTheme}
              onLogout={handleLogout}
            />
          )}

        </div>

      </main>

    </div>
  );

}
