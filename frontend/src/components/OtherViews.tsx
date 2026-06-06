import { useState, FormEvent } from 'react';
import { 
  Calendar, 
  UserMinus, 
  FileSpreadsheet, 
  Wallet, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus, 
  Check, 
  X, 
  Phone, 
  Users, 
  Search,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  Inbox,
  CreditCard,
  Building
} from 'lucide-react';
import { Reservation, Debtor, Expense, FinanceStats, TableModel, Sale } from '../types';

// Helper function for local currency formatting
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val);
};

// ==========================================
// RESERVATIONS VIEW
// ==========================================
interface ReservationsViewProps {
  reservations: Reservation[];
  tables: TableModel[];
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation: (res: Reservation) => void;
}

export function ReservationsView({ reservations, tables, onAddReservation, onUpdateReservation }: ReservationsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('+998 ');
  const [resGuests, setResGuests] = useState(4);
  const [resTime, setResTime] = useState('19:00');
  const [resTable, setResTable] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!resName.trim()) return;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      name: resName,
      phone: resPhone,
      guestsCount: resGuests,
      date: new Date().toISOString().split('T')[0],
      time: resTime,
      tableNumber: tables.find(t => t.id === resTable)?.name || resTable,
      tableId: resTable, // Add this so it can be passed to the backend
      status: 'PENDING'
    } as any;

    onAddReservation(newRes);
    setShowAdd(false);
    setResName('');
    setResPhone('+998 ');
    showToast("Yangi bron qabul qilindi!");
  };

  const handleSetStatus = (id: string, status: Reservation['status']) => {
    const res = reservations.find(r => r.id === id);
    if (res) {
      onUpdateReservation({ ...res, status });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-sans text-white">Bronlar (Rezervatsiyalar)</h2>
          <p className="text-xs text-slate-400 mt-1">Mijozlar joy bron qilish ro'yxati</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Bron qo'shish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {reservations.map(res => (
            <div key={res.id} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-600/70 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{res.name}</span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                    res.status === 'PENDING' ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' :
                    res.status === 'CONFIRMED' ? 'bg-blue-950/60 text-blue-400 border-blue-800/50' :
                    res.status === 'ARRIVED' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 
                    res.status === 'NO_SHOW' ? 'bg-rose-950/60 text-rose-400 border-rose-800/50' :
                    res.status === 'COMPLETED' ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50' :
                    'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}>
                    {res.status === 'PENDING' ? 'Kutilmoqda' : 
                     res.status === 'CONFIRMED' ? 'Tasdiqlangan' :
                     res.status === 'ARRIVED' ? 'Kelgan' : 
                     res.status === 'NO_SHOW' ? 'Kelmadi (No Show)' : 
                     res.status === 'COMPLETED' ? 'Yakunlangan' : 
                     'Bekor qilingan'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-x-4">
                  <span>Joy: <strong className="text-white">{res.tableNumber}</strong></span>
                  <span>Soni: <strong className="text-white">{res.guestsCount} kishi</strong></span>
                  <span>Vaqt: <strong className="text-sky-400 font-bold font-mono">{res.time}</strong></span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Tel: {res.phone}</p>
              </div>

              {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                <div className="flex gap-2">
                  {res.status === 'PENDING' && (
                    <button 
                      onClick={() => handleSetStatus(res.id, 'CONFIRMED')}
                      className="p-1.5 px-3 bg-blue-500/15 hover:bg-blue-550 transition-colors text-blue-400 hover:text-white rounded-lg text-xs font-bold border border-blue-500/25"
                    >
                      Tasdiqlash
                    </button>
                  )}
                  <button 
                    onClick={() => handleSetStatus(res.id, 'ARRIVED')}
                    className="p-1.5 px-3 bg-sky-500/15 hover:bg-sky-550 transition-colors text-sky-400 hover:text-white rounded-lg text-xs font-bold border border-sky-500/25"
                  >
                    Mijoz Keldi
                  </button>
                  <button 
                    onClick={() => handleSetStatus(res.id, 'CANCELLED')}
                    className="p-1.5 px-2.5 border border-slate-700 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition"
                  >
                    Bekor qilish
                  </button>
                </div>
              )}
              {res.status === 'ARRIVED' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSetStatus(res.id, 'COMPLETED')}
                    className="p-1.5 px-3 bg-indigo-500/15 hover:bg-indigo-550 transition-colors text-indigo-400 hover:text-white rounded-lg text-xs font-bold border border-indigo-500/25"
                  >
                    Yakunlash
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info panel */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl h-fit">
          <Calendar className="w-8 h-8 text-sky-400" />
          <h4 className="font-bold text-base text-white mt-4">Rezervatsiyalar tartibi</h4>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            Mijozlar buyurtmalarini joy bo'shashidan 2 soat avval tasdiqlashlari so'raladi. Bron stol kutilgandan 30 minut keyin avtomatik ravishda bekor qilinadi.
          </p>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Yangi bron qabul qilish</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mijoz ismi *</label>
                <input 
                  type="text" 
                  value={resName} 
                  onChange={(e) => setResName(e.target.value)} 
                  required
                  placeholder="Masalan: Dilshodbek"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami</label>
                <input 
                  type="text" 
                  value={resPhone} 
                  onChange={(e) => setResPhone(e.target.value)} 
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kishi soni</label>
                  <input 
                    type="number" 
                    value={resGuests} 
                    onChange={(e) => setResGuests(parseInt(e.target.value) || 2)} 
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Joy (Stol/Xona)</label>
                  <select 
                    value={resTable} 
                    onChange={(e) => setResTable(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] text-white"
                  >
                    <option value="">Tanlang</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.capacity} kishi)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bron vaqti</label>
                <input 
                  type="text" 
                  value={resTime} 
                  placeholder="19:00"
                  onChange={(e) => setResTime(e.target.value)} 
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                Tasdiqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DEBTORS VIEW
// ==========================================
interface DebtorsViewProps {
  debtors: Debtor[];
  onAddDebtor: (debtor: Partial<Debtor>) => void;
  onUpdateDebtor: (debtor: Debtor) => void;
  onAddDebt: (debtorId: string, amount: number, desc: string) => void;
  onAddDebtPayment: (debtId: string, amount: number, paymentType: string) => Promise<void>;
}

import { fetchDebts, fetchDebtPayments } from '../api';
import { Debt, DebtPayment } from '../types';

export function DebtorsView({ debtors, onAddDebtor, onUpdateDebtor, onAddDebt, onAddDebtPayment }: DebtorsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [debtAmount, setDebtAmount] = useState(0);
  const [debtDesc, setDebtDesc] = useState('');

  const [showPayment, setShowPayment] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payType, setPayType] = useState('naqd');

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateDebtor = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddDebtor({ name, phone });
    setShowAdd(false);
    setName('');
    setPhone('+998 ');
    showToast("Yangi qarzdor qo'shildi!");
  };

  const handleCreateDebt = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    onAddDebt(selectedDebtor.id, debtAmount, debtDesc);
    setShowAddDebt(false);
    setDebtAmount(0);
    setDebtDesc('');
    showToast("Qarz qo'shildi!");
    loadDebts(selectedDebtor.id);
  };

  const handleCreatePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDebtId) return;
    try {
      await onAddDebtPayment(selectedDebtId, payAmount, payType);
      setShowPayment(false);
      setPayAmount(0);
      showToast("To'lov qabul qilindi!");
      if (selectedDebtor) loadDebts(selectedDebtor.id);
    } catch (e) {
      // error is alerted in App.tsx
    }
  };

  const loadDebts = async (debtorId: string) => {
    try {
      const fetchedDebts = await fetchDebts(debtorId);
      setDebts(fetchedDebts);
    } catch(e) { console.error(e); }
  };

  const openDebtorDetails = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    loadDebts(debtor.id);
  };

  const activeDebtsTotal = debtors
    .filter(d => d.status === 'faol')
    .reduce((sum, d) => sum + d.remainingDebt, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-sans text-white">Qarzdorlar jurnali</h2>
          <p className="text-xs text-slate-400 mt-1">Muddatli to'lovlar va hisob-kitoblar nazorati</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Qarzdor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {debtors.map(debtor => (
            <div key={debtor.id} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-600/70 transition cursor-pointer" onClick={() => openDebtorDetails(debtor)}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{debtor.name}</span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                    debtor.status === 'faol' ? 'bg-rose-950/60 text-rose-400 border-rose-800/50' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  }`}>
                    {debtor.status === 'faol' ? 'Aktiv qarz' : "To'langan"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">Tel: {debtor.phone}</p>
                <p className="text-sm font-black text-rose-450 mt-1">{formatCurrency(debtor.remainingDebt)} UZS</p>
              </div>
              <div className="text-xs text-sky-400 opacity-0 hover:opacity-100 transition">Batafsil</div>
            </div>
          ))}
        </div>

        {/* Financial KPI stats box */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl h-fit">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Umumiy aktiv qarzlar</p>
          <h3 className="text-2xl font-black text-rose-400 mt-2">{formatCurrency(activeDebtsTotal)} UZS</h3>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            Qarz stavkasi jami aylanmaning 4% dan oshmasligi lozim. Muddatidan o'tgan qarzlarni zudlik bilan menejer nazoratiga bering.
          </p>
        </div>
      </div>

      {/* Add Debtor Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Yangi Qarzdor qo'shish</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDebtor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mijoz ismi *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="Masalan: Elyorbek Fozilov"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Debtor Details Modal */}
      {selectedDebtor && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">{selectedDebtor.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedDebtor.phone}</p>
              </div>
              <button onClick={() => setSelectedDebtor(null)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 flex gap-4">
              <button 
                onClick={() => setShowAddDebt(true)}
                className="flex-1 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl font-bold text-xs transition"
              >
                + Qarz yozish
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Qarzlar ro'yxati</h4>
              {debts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Qarzlar topilmadi.</p>
              ) : (
                debts.map(d => (
                  <div key={d.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">Qolgan qarz: {formatCurrency(d.remainingDebt || d.amount)} UZS</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Jami qarz: {formatCurrency(d.amount)} UZS • {d.itemDescription} • {d.date}</p>
                    </div>
                    {d.status !== 'PAID' ? (
                      <button 
                        onClick={() => { setSelectedDebtId(d.id); setShowPayment(true); }}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/30 transition"
                      >
                        To'lov qabul qilish
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 text-emerald-500 text-[10px] font-bold">To'langan</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddDebt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Yangi Qarz yozish</h3>
              <button onClick={() => setShowAddDebt(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qarz summasi (UZS) *</label>
                <input 
                  type="number" 
                  value={debtAmount} 
                  onChange={(e) => setDebtAmount(parseInt(e.target.value) || 0)} 
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sabab / Izoh *</label>
                <input 
                  type="text" 
                  value={debtDesc} 
                  onChange={(e) => setDebtDesc(e.target.value)} 
                  required
                  placeholder="Masalan: Banketdan qolgan qarz"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-rose-500/10">
                Qarzni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">To'lov qabul qilish</h3>
              <button onClick={() => setShowPayment(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'lov summasi (UZS) *</label>
                <input 
                  type="number" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)} 
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'lov turi *</label>
                <select 
                  value={payType} 
                  onChange={(e) => setPayType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                >
                  <option value="naqd">Naqd</option>
                  <option value="uzcard">Uzcard</option>
                  <option value="humo">Humo</option>
                  <option value="click">Click</option>
                  <option value="payme">Payme</option>
                  <option value="transfer">Bank o'tkazmasi</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-emerald-500/10">
                To'lovni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// EXPENSES VIEW 
// ==========================================
interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export function ExpensesView({ expenses, onAddExpense }: ExpensesViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(150000);
  const [category, setCategory] = useState('Logistika');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('naqd');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      name,
      amount,
      category,
      date: new Date().toISOString().split('T')[0],
      notes,
      paymentMethod
    };

    try {
      await onAddExpense(newExp);
      setShowAdd(false);
      setName('');
      setNotes('');
      showToast("Xarajat muvaffaqiyatli qayd etildi!");
    } catch(err) {
      // App.tsx handles alert
    }
  };

  const expensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-rose-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-rose-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-sans text-white">Xarajatlar daftari</h2>
          <p className="text-xs text-slate-400 mt-1">Soliqlar, logistika, xo'jalik va oziq-ovqat sotib olish varag'i (Ledge)</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-550 to-pink-650 hover:from-rose-500 hover:to-pink-600 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-550/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Xarajat qayd etish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {expenses.map(exp => (
            <div key={exp.id} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-2xl flex justify-between shadow-sm hover:border-slate-600/70 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{exp.name}</span>
                  <span className="px-2.5 py-0.5 text-[8px] font-black rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50 uppercase tracking-wider">
                    {exp.category}
                  </span>
                  <span className="px-2.5 py-0.5 text-[8px] font-black rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    {exp.paymentMethod}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{exp.notes || 'Izohsiz'}</p>
                <p className="text-[10px] text-slate-500 font-mono">Xarid sanasi: {exp.date}</p>
              </div>
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-black text-rose-400">-{formatCurrency(exp.amount)} UZS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sum totals box */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl h-fit">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bugungi jami qayd etilgan xarajatlar</p>
          <h3 className="text-2xl font-black text-rose-400 mt-2">-{formatCurrency(expensesSum)} UZS</h3>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Kundalik xarajatlar kassa limiti va menejer ma'qullashi bo'yicha cheklanadi. Iltimos, barcha invoyslarni tizimga biriktiring.
          </p>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Xarajat qo'shish</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Xarajat o'tkazilgan obyekt *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="Masalan: Go'sht sotib olish"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategoriya</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] text-white"
                  >
                    <option value="Logistika">Logistika</option>
                    <option value="Xo'jalik">Xo'jalik</option>
                    <option value="Kommunal">Kommunal</option>
                    <option value="Mahsulot">Mahsulot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'lov turi</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] text-white"
                  >
                    <option value="naqd">Naqd</option>
                    <option value="uzcard">Uzcard</option>
                    <option value="humo">Humo</option>
                    <option value="click">Click</option>
                    <option value="payme">Payme</option>
                    <option value="transfer">O'tkazma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Summasi (UZS)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)} 
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Batafsil tushuntirish</label>
                <textarea 
                  rows={2}
                  value={notes} 
                  placeholder="Kvitansiya raqami yoki sotuvchi..."
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-450 hover:to-pink-500 font-bold text-xs text-white rounded-xl transition text-center shadow-lg shadow-rose-500/10">
                Fiskallashtirish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// FINANCE VIEW
// ==========================================

interface FinanceViewProps {
  stats: FinanceStats | null;
  sales: Sale[];
  expenses: Expense[];
}

export function FinanceView({ stats, sales, expenses }: FinanceViewProps) {
  // Combine sales and expenses into a single history array
  const history = [
    ...sales.map(s => ({
      id: `sale-${s.id}`,
      type: 'kirim' as const,
      amount: s.totalAmount,
      date: s.date.split('T')[0],
      time: s.date.includes('T') ? new Date(s.date).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'}) : '12:00',
      description: `Sotuv tushumi (Chek #${s.id})`,
      paymentType: s.payments?.[0]?.paymentType || 'aralash'
    })),
    ...expenses.map(e => ({
      id: `exp-${e.id}`,
      type: 'chiqim' as const,
      amount: e.amount,
      date: e.date,
      time: '12:00', // Expenses don't have time right now in frontend type
      description: `Xarajat: ${e.name}`,
      paymentType: e.paymentMethod
    }))
  ].sort((a, b) => {
    // Sort descending by date and time
    const aDate = new Date(`${a.date}T${a.time}`);
    const bDate = new Date(`${b.date}T${b.time}`);
    return bDate.getTime() - aDate.getTime();
  });
  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      <div className="pb-4 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white font-sans">Moliya va Bank xizmatlari</h2>
        <p className="text-xs text-slate-400 mt-1">Kassa balanslari, hisob raqam tahlillari, debet-kredit aylanmalari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl w-fit">
            <Inbox className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase mt-4">Naqd kassa balansi</p>
          <h3 className="text-3xl font-black mt-2 font-sans text-emerald-400">{formatCurrency(stats?.cash_balance || 0)} UZS</h3>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold">Tugallangan jismoniy operatsiyalar</p>
        </div>
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl shadow-sm">
          <div className="p-2.5 bg-sky-500/10 rounded-xl w-fit">
            <CreditCard className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase mt-4">Plastik karta (Ucard / Humo)</p>
          <h3 className="text-3xl font-black mt-2 font-sans text-sky-400">{formatCurrency(stats?.card_balance || 0)} UZS</h3>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold">Bank terminallari o'tkazmalari</p>
        </div>
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl shadow-sm">
          <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase mt-4">Yuridik hisob raqam</p>
          <h3 className="text-3xl font-black mt-2 font-sans text-purple-400">{formatCurrency(stats?.transfer_balance || 0)} UZS</h3>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold">Korporativ tashkilotlar shartnomalari</p>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-white text-sm">Oxirgi operatsiyalar tarixi</h3>
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Sana</th>
                <th className="px-4 py-3 font-semibold">Tavsif</th>
                <th className="px-4 py-3 font-semibold">To'lov turi</th>
                <th className="px-4 py-3 font-semibold text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {history.length > 0 ? (
                history.slice(0, 15).map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition text-xs font-semibold">
                    <td className="px-4 py-3 text-slate-300">
                      <div>{item.date}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{item.time}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'kirim' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-slate-400 uppercase text-[9px]">{item.paymentType}</td>
                    <td className={`px-4 py-3 text-right font-mono ${item.type === 'kirim' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.type === 'kirim' ? '+' : '-'}{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-bold text-xs">
                    Operatsiyalar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// STATISTICS VIEW
// ==========================================
// STATISTICS VIEW
// ==========================================
import { FullStatistics, StatisticsKPI } from '../types';

interface StatisticsViewProps {
  stats: FullStatistics | null;
  kpi: StatisticsKPI | null;
}

export function StatisticsView({ stats, kpi }: StatisticsViewProps) {
  if (!stats) {
    return <div className="text-white text-center mt-10">Statistika yuklanmoqda...</div>;
  }

  // To find the busiest hour for AI recommendation
  const busiestHour = kpi?.busiest_hours?.reduce((prev, current) => 
    (prev.orders > current.orders) ? prev : current
  , { hour: "N/A", orders: 0 }) || { hour: "N/A", orders: 0 };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      <div className="pb-4 border-b border-slate-800/80 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white">Ko'rsatkichlar va Statistika</h2>
          <p className="text-xs text-slate-400 mt-1">Sotuvlar, mijozlar va ombor qoldig'i tahlili</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Kunlik Tushum</p>
          <p className="text-lg font-black text-sky-400 mt-1">{formatCurrency(stats.sales_stats.daily_revenue)} UZS</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Haftalik Tushum</p>
          <p className="text-lg font-black text-sky-400 mt-1">{formatCurrency(stats.sales_stats.weekly_revenue)} UZS</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Oylik Tushum</p>
          <p className="text-lg font-black text-sky-400 mt-1">{formatCurrency(stats.sales_stats.monthly_revenue)} UZS</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Yillik Tushum</p>
          <p className="text-lg font-black text-sky-400 mt-1">{formatCurrency(stats.sales_stats.yearly_revenue)} UZS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-white text-sm">Mijozlar kelish vaqti aylanmasi (Eng gavjum soatlar)</h4>
          <div className="h-48 flex items-end justify-between font-mono font-bold text-slate-400 text-xs px-2 select-none relative pt-4">
            {!kpi || !kpi.busiest_hours || kpi.busiest_hours.length === 0 ? (
              <p className="text-xs text-slate-500 w-full text-center mb-10">Ma'lumot yetarli emas</p>
            ) : (
              kpi.busiest_hours.map((dist, idx) => {
                const maxCount = Math.max(...kpi.busiest_hours.map(d => d.orders), 1);
                const heightPercent = Math.max((dist.orders / maxCount) * 100, 5); // min 5%
                const isBusiest = dist.hour === busiestHour.hour;
                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group">
                    <div 
                      className={`w-8 rounded-t transition-transform group-hover:scale-y-105 ${isBusiest ? 'bg-sky-500' : 'bg-sky-500/50'}`} 
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] tracking-tight mt-1.5 font-bold ${isBusiest ? 'text-sky-400 font-black' : ''}`}>
                      {dist.hour}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-white text-sm">Mijozlar va Ombor ko'rsatkichi</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Joriy davrda bitta buyurtmaning o'rtacha chek miqdori <strong className="text-emerald-400">{formatCurrency(kpi?.average_check || 0)} so'm</strong>ni tashkil etmoqda.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <p className="text-[10px] text-rose-400 font-bold uppercase">Kam qolgan / Tugagan</p>
                <p className="text-sm font-bold text-white mt-1">{stats.warehouse_stats.low_stock} ta / {stats.warehouse_stats.out_of_stock} ta</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Sof Foyda (Jami)</p>
                <p className="text-sm font-bold text-white mt-1">{formatCurrency(stats.finance_stats.profit)} UZS</p>
              </div>
            </div>
          </div>
          <div className="bg-sky-500/5 text-sky-350 p-4 border border-sky-550/25 rounded-xl flex items-center gap-4 mt-4">
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse shrink-0" />
            <p className="text-xs leading-normal">
              <strong>Tizim Tavsiyasi:</strong> Odatda eng ko'p mijozlar soat <strong>{busiestHour.hour}</strong> da kelmoqda. Shu soatlarda zaldagi xodimlar sonini maksimal darajada saqlash tavsiya etiladi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top items */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl">
          <h4 className="font-bold text-white text-sm mb-4">Eng ko'p sotilgan taom va ichimliklar (TOP 10)</h4>
          <div className="space-y-3">
            {stats.product_stats.top_items.length === 0 ? <p className="text-xs text-slate-500">Sotuvlar yo'q</p> : null}
            {stats.product_stats.top_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-2 last:border-0">
                <div className="flex gap-3 items-center">
                  <span className="font-bold text-slate-500 w-4">{idx + 1}.</span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-emerald-400">{item.qty} marta sotildi</span>
              </div>
            ))}
          </div>
        </div>

        {/* Least items */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl">
          <h4 className="font-bold text-white text-sm mb-4">Eng kam sotilganlar (E'tibor berish kerak)</h4>
          <div className="space-y-3">
            {stats.product_stats.least_items.length === 0 ? <p className="text-xs text-slate-500">Sotuvlar yo'q</p> : null}
            {stats.product_stats.least_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-2 last:border-0">
                <div className="flex gap-3 items-center">
                  <span className="font-bold text-slate-500 w-4">{idx + 1}.</span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-rose-400">{item.qty} marta sotildi</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SETTINGS VIEW
// ==========================================
export function SettingsView() {
  const [currency, setCurrency] = useState('so\'m (UZS)');
  const [taxPercent, setTaxPercent] = useState(10);
  const [backupActive, setBackupActive] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="pb-4 border-b border-slate-800/80">
        <h2 className="text-xl font-bold text-white">Tizim Sozlamalari</h2>
        <p className="text-xs text-slate-400 mt-1">Verdant RMS platformasini boshqarish va kalibrlash</p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-6 rounded-2xl max-w-2xl space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-700/60">
          <div>
            <label className="block text-xs font-bold text-slate-350 mb-2">Tizim pul birligi (Valyuta)</label>
            <input 
              type="text" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-350 mb-2">Xizmat ko'rsatish ustamasi (%)</label>
            <input 
              type="number" 
              value={taxPercent} 
              onChange={(e) => setTaxPercent(parseInt(e.target.value) || 0)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/60">
          <div>
            <h4 className="text-xs font-bold text-white">Avtomatik Bulutli zaxiralash (Cloud Sync)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Barcha buyurtma ma'lumotlarini serverga sinxronlash</p>
          </div>
          <button 
            type="button" 
            onClick={() => setBackupActive(!backupActive)}
            className={`w-11 h-6 rounded-full transition relative ${
              backupActive ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <span className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
              backupActive ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        <button 
          onClick={() => {
            showToast("Barcha sozlamalar muvaffaqiyatli saqlandi!");
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-sky-500/10"
        >
          O'zgarishlarni saqlash
        </button>

      </div>
    </div>
  );
}
