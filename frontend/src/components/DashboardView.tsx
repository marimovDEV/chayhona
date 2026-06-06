import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  Briefcase, 
  Coffee,
  CheckCircle,
  Clock,
  Wallet,
  Package,
  Receipt,
  Users,
  AlertTriangle,
  FileText,
  Send
} from 'lucide-react';
import { sendTelegramReport } from '../api';
import { Employee, WarehouseItem, Reservation, Debtor, Expense, Sale, DashboardStats, ChartData, TopItem, PosTable } from '../types';

interface DashboardViewProps {
  tables: PosTable[];
  employees: Employee[];
  warehouseItems: WarehouseItem[];
  reservations: Reservation[];
  debtors: Debtor[];
  expenses: Expense[];
  sales: Sale[];
  stats: DashboardStats | null;
  dailyChart: ChartData[];
  monthlyChart: ChartData[];
  topProducts: TopItem[];
  topDrinks: TopItem[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  tables,
  employees,
  warehouseItems,
  reservations,
  debtors,
  expenses,
  sales,
  stats,
  dailyChart,
  monthlyChart,
  topProducts,
  topDrinks,
  onNavigate
}: DashboardViewProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');

  const formatCurrency = (val: number) => new Intl.NumberFormat('uz-UZ').format(val);

  // ROW 1: FINANCE
  const todayRevenue = stats?.todayRevenue || 0;
  const todayExpense = stats?.todayExpense || 0;
  const netProfit = todayRevenue - todayExpense; 
  
  const todayStrDate = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(todayStrDate));
  const todayChequesCount = todaySales.length;
  const averageCheque = todayChequesCount > 0 ? Math.round(todayRevenue / todayChequesCount) : 0;

  // ROW 2: TABLES & RESERVATIONS
  const getTableStats = (keyword: string) => {
    let matches = tables.filter(t => t.name.toLowerCase().includes(keyword.toLowerCase()));
    if (keyword === 'stol') {
      matches = tables.filter(t => !t.name.toLowerCase().includes('kabina') && !t.name.toLowerCase().includes('tapchan'));
    }
    return {
      total: matches.length,
      available: matches.filter(t => t.status === 'AVAILABLE').length,
      reserved: matches.filter(t => t.status === 'RESERVED').length,
      occupied: matches.filter(t => t.status === 'OCCUPIED' || t.status === 'RESERVED' && t.billAmount > 0).length,
    };
  };

  const kabinaStats = getTableStats('kabina');
  const tapchanStats = getTableStats('tapchan');
  const stolStats = getTableStats('stol');

  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED' || t.billAmount > 0);
  const currentCustomersCount = occupiedTables.reduce((sum, t) => sum + t.capacity, 0);

  const todayReservations = reservations.filter(r => r.date === todayStrDate);
  const confirmedRes = todayReservations.filter(r => r.status === 'CONFIRMED' || r.status === 'ARRIVED').length;
  const pendingRes = todayReservations.filter(r => r.status === 'PENDING').length;
  const noShowRes = todayReservations.filter(r => r.status === 'NO_SHOW' || r.status === 'CANCELLED').length;

  // ROW 3: WARNINGS, DEBT, EMPLOYEES
  const lowStockItems = warehouseItems.filter(w => w.currentQty <= w.minThreshold).slice(0, 3);
  
  const activeDebtors = debtors.filter(d => d.remainingDebt > 0);
  const activeDebtorsCount = activeDebtors.length;
  const totalDebtAmount = activeDebtors.reduce((sum, d) => sum + d.remainingDebt, 0);

  const totalEmployees = employees.length;
  const presentEmployees = totalEmployees; // Mocked attendance
  const absentEmployees = 0;

  // ROW 4: ACTIVITY FEED & CHART
  type ActivityEvent = { time: string, title: string, subtitle: string, type: 'sale'|'expense'|'debt'|'reservation', fullDate: number };
  const activities: ActivityEvent[] = [];
  
  sales.forEach(s => activities.push({
    time: new Date(s.date).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'}),
    title: `Chek yopildi (#${s.id})`,
    subtitle: `${formatCurrency(s.totalAmount)} so'm`,
    type: 'sale',
    fullDate: new Date(s.date).getTime()
  }));
  
  expenses.forEach(e => activities.push({
    time: new Date(e.date).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'}),
    title: `Xarajat kiritildi`,
    subtitle: `${e.name} (${formatCurrency(e.amount)} so'm)`,
    type: 'expense',
    fullDate: new Date(e.date).getTime()
  }));

  reservations.forEach(r => activities.push({
    time: r.time,
    title: `${r.tableNumber} bron qilindi`,
    subtitle: `${r.name} nomiga`,
    type: 'reservation',
    fullDate: new Date(`${r.date}T${r.time}`).getTime()
  }));

  const sortedActivities = activities.sort((a, b) => b.fullDate - a.fullDate).slice(0, 6);

  const generateChartData = (range: '7' | '30') => {
    const data = range === '7' ? dailyChart.slice(-7) : dailyChart;
    const maxVal = Math.max(...data.map(d => d.revenue), 1);
    return data.map(d => ({
      label: d.date || '',
      height: `${Math.max((d.revenue / maxVal) * 100, 5)}%`,
      revenue: d.revenue
    }));
  };
  const currentChartData = generateChartData(timeRange);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Umumiy Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Tezkor ERP Boshqaruv Paneli</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              try {
                await sendTelegramReport();
                alert("Telegram hisobot muvaffaqiyatli yuborildi!");
              } catch (e: any) {
                alert(e.response?.data?.error || "Telegramga yuborishda xatolik yuz berdi");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 rounded-lg border border-[#0ea5e9]/30 transition-all text-xs font-bold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegramga jo'natish</span>
          </button>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Bugun: {new Date().toLocaleDateString('uz-UZ')}</span>
          </div>
        </div>
      </div>

      {/* ================= ROW 1: FINANCE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bugungi Tushum */}
        <div className="bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] text-white rounded-2xl p-5 flex flex-col justify-between border border-sky-400/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-16 h-16" />
          </div>
          <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold mb-1">Bugungi tushum</p>
          <h3 className="text-white font-black text-2xl sm:text-3xl tracking-tight z-10">{formatCurrency(todayRevenue)}</h3>
          <p className="text-white/70 text-xs mt-1 z-10">so'm (Kassa aylanmasi)</p>
        </div>

        {/* Bugungi Xarajat */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Bugungi Xarajat</p>
          <h3 className="text-white font-bold text-2xl tracking-tight">{formatCurrency(todayExpense)}</h3>
          <p className="text-slate-500 text-xs mt-1">so'm (Logistika, ombor)</p>
        </div>

        {/* Sof Foyda */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-400" /> Sof Foyda (Bugun)</p>
          <h3 className={`font-bold text-2xl tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
          </h3>
          <p className="text-slate-500 text-xs mt-1">so'm (Tushum - Xarajat)</p>
        </div>

        {/* Cheklar & O'rtacha Chek */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold"><Receipt className="w-3.5 h-3.5 inline mr-1 text-purple-400"/> Bugungi cheklar</p>
            <span className="text-white font-bold text-sm bg-slate-700/50 px-2 rounded-md">{todayChequesCount} ta</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl tracking-tight">{formatCurrency(averageCheque)}</h3>
            <p className="text-slate-500 text-xs mt-1">so'm (O'rtacha chek miqdori)</p>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: TABLES & RESERVATIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Kabinalar */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <h4 className="text-white font-bold text-sm mb-3">Kabinalar: {kabinaStats.total} ta</h4>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Bo'sh</span> <span className="text-white">{kabinaStats.available}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-400"/> Bron qilingan</span> <span className="text-white">{kabinaStats.reserved}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-400"/> Band</span> <span className="text-white">{kabinaStats.occupied}</span></div>
          </div>
        </div>

        {/* Tapchanlar */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <h4 className="text-white font-bold text-sm mb-3">Tapchanlar: {tapchanStats.total} ta</h4>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Bo'sh</span> <span className="text-white">{tapchanStats.available}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-400"/> Bron qilingan</span> <span className="text-white">{tapchanStats.reserved}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-400"/> Band</span> <span className="text-white">{tapchanStats.occupied}</span></div>
          </div>
        </div>

        {/* Stollar */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <h4 className="text-white font-bold text-sm mb-3">Stollar: {stolStats.total} ta</h4>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Bo'sh</span> <span className="text-white">{stolStats.available}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-400"/> Bron qilingan</span> <span className="text-white">{stolStats.reserved}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-400"/> Band</span> <span className="text-white">{stolStats.occupied}</span></div>
          </div>
        </div>

        {/* Bronlar Bloki */}
        <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-500/30 p-4 rounded-2xl cursor-pointer hover:border-indigo-400/50 transition-all" onClick={() => onNavigate('reservations')}>
          <h4 className="text-white font-bold text-sm mb-3 flex items-center justify-between">
            <span>Bugungi bronlar: {todayReservations.length}</span>
            <Calendar className="w-4 h-4 text-indigo-300" />
          </h4>
          <div className="space-y-2 text-xs font-medium text-indigo-200">
            <div className="flex justify-between items-center"><span>Tasdiqlangan / Kelgan:</span> <span className="text-white font-bold">{confirmedRes}</span></div>
            <div className="flex justify-between items-center"><span>Kutilmoqda:</span> <span className="text-white font-bold">{pendingRes}</span></div>
            <div className="flex justify-between items-center"><span>Kelmagan / Bekor:</span> <span className="text-white font-bold">{noShowRes}</span></div>
          </div>
          <div className="mt-3 pt-2 border-t border-indigo-500/20 text-[10px] text-center text-indigo-300 font-bold uppercase tracking-widest">
            Hozir mijozlar: ~{currentCustomersCount} kishi
          </div>
        </div>

      </div>

      {/* ================= ROW 3: WARNINGS, DEBT, EMPLOYEES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Ombor ogohlantirishlari */}
        <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-2xl cursor-pointer hover:border-rose-700/50 transition-all" onClick={() => onNavigate('warehouse')}>
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Kam qolgan mahsulotlar
          </h4>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-2">
              {lowStockItems.map(w => (
                <li key={w.id} className="flex justify-between text-xs text-rose-200 bg-rose-950/40 p-2 rounded-lg">
                  <span className="font-semibold">{w.name}</span>
                  <span className="font-bold text-rose-400">{w.currentQty} {w.unit}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400 bg-emerald-950/30 p-2 rounded-lg font-medium text-center">Barcha mahsulotlar yetarli</p>
          )}
        </div>

        {/* Qarzdorlik */}
        <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-2xl cursor-pointer hover:border-amber-700/50 transition-all flex flex-col justify-center" onClick={() => onNavigate('debtors')}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-500/20 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold">Qarzdorlar: {activeDebtorsCount} ta</p>
              <h3 className="text-white font-bold text-xl">{formatCurrency(totalDebtAmount)} <span className="text-xs text-slate-500 font-normal">UZS</span></h3>
            </div>
          </div>
          <p className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold mt-2 text-center">Jami kutilayotgan tushum</p>
        </div>

        {/* Xodimlar */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl cursor-pointer hover:border-slate-500/40 transition-all flex flex-col justify-center" onClick={() => onNavigate('employees')}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Xodimlar
              </h4>
              <p className="text-slate-400 text-xs">Jami ro'yxatda: {totalEmployees} ta</p>
            </div>
            <div className="text-right text-xs space-y-1">
              <p className="text-emerald-400 font-bold">Ishda: {presentEmployees}</p>
              <p className="text-slate-500 font-medium">Kelmagan: {absentEmployees}</p>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-500 text-center">Boshqaruv va HR moduli</div>
        </div>

      </div>

      {/* ================= ROW 4: CHARTS & ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafika (2 columns wide) */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-white font-bold text-base">Aylanma ko'rsatkichlar dinamikasi</h4>
              <p className="text-[#94a3b8] text-xs">Kunlik daromad tahlili</p>
            </div>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '7' | '30')}
              className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="7">Oxirgi 7 kun</option>
              <option value="30">Oxirgi 30 kun</option>
            </select>
          </div>

          <div className="h-64 relative flex items-end justify-between gap-6 px-2 mt-4">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              {[1,2,3,4].map(i => <div key={i} className="border-t border-slate-800/40 w-full" />)}
            </div>

            {currentChartData.map((d, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end items-center group relative z-10 h-full">
                <div className="absolute -top-8 bg-slate-950 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap z-25 pointer-events-none shadow-lg">
                  {d.label}: {formatCurrency(d.revenue)}
                </div>
                <div className="w-full bg-sky-500/20 group-hover:bg-sky-500/40 rounded-t-lg transition-all" style={{ height: d.height }}/>
                <p className="mt-2 text-[10px] font-semibold text-slate-500 truncate w-full text-center">{d.label.substring(0, 5)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tezkor Hodisalar (Activity Feed) */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Tezkor Hodisalar
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {sortedActivities.length > 0 ? (
              sortedActivities.map((act, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${act.type === 'sale' ? 'bg-emerald-400' : act.type === 'expense' ? 'bg-rose-400' : 'bg-indigo-400'}`} />
                    {idx !== sortedActivities.length - 1 && <div className="w-px h-full bg-slate-700/50 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[10px] text-slate-500 font-mono mb-0.5">{act.time}</p>
                    <p className="text-sm font-semibold text-white">{act.title}</p>
                    <p className="text-xs text-slate-400">{act.subtitle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <FileText className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-xs text-slate-400">Hozircha hodisalar yo'q</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
