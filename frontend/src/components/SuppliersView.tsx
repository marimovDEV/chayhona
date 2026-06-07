import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, Search, Check, Trash2, ShieldCheck, 
  TrendingUp, X, Factory, DollarSign, Phone,
  Tag, FileText, AlertTriangle, ArrowRight, Wallet
} from 'lucide-react';
import { Supplier, SupplierDebt } from '../types';
import { 
  fetchSuppliers, createSupplier, 
  fetchSupplierDebts, createSupplierDebt, createSupplierPayment, fetchSupplierPayments
} from '../api';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [debts, setDebts] = useState<SupplierDebt[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'debts' | 'history'>('debts');

  // Modal triggers
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Forms
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCategory, setSupCategory] = useState('');

  const [debtSupplierId, setDebtSupplierId] = useState('');
  const [debtDesc, setDebtDesc] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);

  const [payTargetDebt, setPayTargetDebt] = useState<SupplierDebt | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payType, setPayType] = useState<'naqd' | 'uzcard' | 'humo' | 'click' | 'payme' | 'transfer'>('naqd');

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  const loadData = async () => {
    try {
      const sups = await fetchSuppliers();
      setSuppliers(sups);
      const ds = await fetchSupplierDebts();
      setDebts(ds);
      const ps = await fetchSupplierPayments();
      setPayments(ps);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSupplier = async (e: FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    try {
      await createSupplier({ name: supName, phone: supPhone, category: supCategory });
      showToast("Yangi ta'minotchi qo'shildi!");
      setShowAddSupplierModal(false);
      setSupName(''); setSupPhone(''); setSupCategory('');
      loadData();
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleSaveDebt = async (e: FormEvent) => {
    e.preventDefault();
    if (!debtSupplierId || debtAmount <= 0) return;
    try {
      await createSupplierDebt({ supplier: debtSupplierId, item_description: debtDesc, amount: debtAmount });
      showToast("Qarzdorlik muvaffaqiyatli saqlandi!");
      setShowAddDebtModal(false);
      setDebtSupplierId(''); setDebtDesc(''); setDebtAmount(0);
      loadData();
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleSavePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!payTargetDebt || payAmount <= 0) return;
    try {
      await createSupplierPayment({ debt: payTargetDebt.id, payment_type: payType, amount: payAmount });
      showToast("To'lov qabul qilindi!");
      setShowPayModal(false);
      setPayTargetDebt(null); setPayAmount(0);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Xatolik yuz berdi!");
    }
  };

  // Compute stats
  const totalCorporateDebt = suppliers.reduce((sum, s) => sum + s.remainingDebt, 0);
  const totalCorporatePaid = suppliers.reduce((sum, s) => sum + s.totalPaid, 0);

  const activeSupplier = suppliers.find(s => s.id === activeSupplierId);
  const supplierDebts = debts.filter(d => d.supplier === activeSupplierId);
  const supplierPayments = payments.filter(p => debts.find(d => d.id === p.debt)?.supplier === activeSupplierId);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-sky-400" />
            Ta'minotchilar va Qarzlar
          </h2>
          <p className="text-xs text-slate-400 mt-1">Yetkazib beruvchilar bilan hisob-kitoblar va korxona qarzdorligi nazorati</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setDebtSupplierId(activeSupplierId || '');
              setShowAddDebtModal(true);
            }}
            className="px-4 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-xl border border-rose-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Qarz qo'shish
          </button>
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-sky-500/10"
          >
            <Plus className="w-4 h-4" /> Yangi ta'minotchi
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Jami qarzdorlik</p>
            <h4 className="text-2xl font-black text-rose-400 font-mono">{formatCurrency(totalCorporateDebt)} <span className="text-xs text-slate-300">UZS</span></h4>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Ta'minotchilardan olingan qarzlar</span>
          </div>
          <div className="w-11 h-11 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">To'langan summa</p>
            <h4 className="text-2xl font-black text-emerald-400 font-mono">{formatCurrency(totalCorporatePaid)} <span className="text-xs text-slate-300">UZS</span></h4>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Qaytarilgan jami mablag'lar</span>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Faol ta'minotchilar</p>
            <h4 className="text-2xl font-black text-slate-200 font-mono">{suppliers.filter(s => s.remainingDebt > 0).length} <span className="text-xs text-slate-400">ta</span></h4>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Hozirda qarzi bor korxonalar</span>
          </div>
          <div className="w-11 h-11 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400">
            <Factory className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Suppliers List */}
        <div className="flex-1 space-y-4">
          
          {/* Search bar */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ta'minotchi qidirish..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Grid of suppliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(sup => {
              const isActive = sup.id === activeSupplierId;
              return (
                <div
                  key={sup.id}
                  onClick={() => setActiveSupplierId(sup.id)}
                  className={`p-5 rounded-[22px] border cursor-pointer transition relative flex flex-col justify-between ${
                    isActive 
                      ? 'bg-sky-500/10 border-sky-400 text-white shadow-lg shadow-sky-500/5' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{sup.name}</h4>
                        <span className="text-[10px] bg-slate-900/60 text-slate-400 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block uppercase tracking-wider">{sup.category}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition ${isActive ? 'text-sky-400 translate-x-1' : 'text-slate-500'}`} />
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{sup.phone || "Telefon kiritilmagan"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/30 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">Jami qarz</p>
                      <p className="text-sm font-black font-mono text-slate-300">
                        {formatCurrency(sup.totalDebt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">To'langan</p>
                      <p className="text-sm font-black font-mono text-emerald-400">
                        {formatCurrency(sup.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">Qoldiq</p>
                      <p className={`text-sm font-black font-mono ${sup.remainingDebt > 0 ? 'text-rose-400' : 'text-emerald-450'}`}>
                        {formatCurrency(sup.remainingDebt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSuppliers.length === 0 && (
              <div className="col-span-2 text-center py-16 text-slate-500 bg-slate-805/40 border border-slate-700/50 rounded-2xl">
                <Factory className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-400" />
                <p className="text-sm font-semibold">Ta'minotchilar topilmadi</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Supplier detail dashboard */}
        <div className="w-full lg:w-[420px]">
          {activeSupplier ? (
            <div className="bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] p-6 space-y-6 shadow-sm">
              
              {/* Profile Card Header */}
              <div>
                <h3 className="font-bold text-base text-white">{activeSupplier.name}</h3>
                <span className="text-[10px] bg-sky-950/60 text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-800/50 inline-block mt-1">
                  {activeSupplier.category}
                </span>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-450 uppercase text-[9px] font-bold block">Jami Qarz</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(activeSupplier.totalDebt)} UZS</span>
                  </div>
                  <div>
                    <span className="text-slate-455 uppercase text-[9px] font-bold block">To'langan</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(activeSupplier.totalPaid)} UZS</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-700/50 mb-4 mt-6">
                <button 
                  onClick={() => setActiveTab('debts')}
                  className={`pb-2 text-xs font-bold transition-colors ${activeTab === 'debts' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Qarzlar
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 text-xs font-bold transition-colors ${activeTab === 'history' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  To'lovlar tarixi
                </button>
              </div>

              {/* Tab Content */}
              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'debts' ? (
                  <div className="space-y-3">
                    {supplierDebts.map(debt => (
                      <div key={debt.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between hover:bg-slate-900 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-white leading-snug">{debt.itemDescription || "Ta'minot xaridi"}</p>
                            <span className="text-[9px] text-slate-450 block mt-0.5">{new Date(debt.date).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            debt.status === 'PAID' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : debt.status === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-405 border-rose-500/20'
                          }`}>
                            {debt.status === 'PAID' ? 'Yopilgan' : debt.status === 'PARTIAL' ? 'Kisman' : 'Ochiq'}
                          </span>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-800/60 flex justify-between items-end">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-semibold">Qoldiq qarz</p>
                            <p className="text-xs font-black text-rose-400 font-mono">{formatCurrency(debt.remainingDebt || 0)} UZS</p>
                          </div>
                          {debt.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setPayTargetDebt(debt);
                                setPayAmount(debt.remainingDebt || 0);
                                setShowPayModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>To'lash</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {supplierDebts.length === 0 && (
                      <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <FileText className="w-8 h-8 text-slate-650 mx-auto mb-1.5" />
                        <p className="text-xs">Ushbu ta'minotchi bilan qarzlar mavjud emas</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase">Sana</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase">Summa</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase">Turi</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase">Asos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => {
                          const relDebt = debts.find(d => d.id === payment.debt);
                          return (
                            <tr key={payment.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                              <td className="py-3 text-xs text-slate-300 font-mono">
                                {new Date(payment.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </td>
                              <td className="py-3 text-xs font-black text-emerald-400 font-mono">
                                {formatCurrency(payment.amount)} UZS
                              </td>
                              <td className="py-3">
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold uppercase">
                                  {payment.paymentType}
                                </span>
                              </td>
                              <td className="py-3 text-[10px] text-slate-400">
                                {relDebt?.itemDescription}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {supplierPayments.length === 0 && (
                      <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <Wallet className="w-8 h-8 text-slate-650 mx-auto mb-1.5" />
                        <p className="text-xs">Ushbu ta'minotchiga hali to'lovlar qilinmagan</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] p-8 text-center text-slate-500 font-semibold h-72 flex flex-col justify-center items-center">
              <Factory className="w-10 h-10 text-slate-700 mb-2" />
              <span>Batafsil ma'lumot olish uchun chapdan ta'minotchini tanlang</span>
            </div>
          )}
        </div>

      </div>

      {/* === ADD SUPPLIER MODAL === */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Yangi Ta'minotchi</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-450 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Nomi *</label>
                <input type="text" value={supName} onChange={(e) => setSupName(e.target.value)} required placeholder="Masalan: Go'shtchi Shokir aka"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-355 mb-1.5">Telefon</label>
                <input type="text" value={supPhone} onChange={(e) => setSupPhone(e.target.value)} placeholder="Masalan: +998 90 123 4567"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Kategoriya *</label>
                <input type="text" value={supCategory} onChange={(e) => setSupCategory(e.target.value)} required placeholder="Masalan: Go'sht, Sabzavot, Idishlar..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === ADD DEBT MODAL === */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">Qarzdorlik qo'shish</h3>
              <button onClick={() => setShowAddDebtModal(false)} className="text-slate-450 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Ta'minotchi *</label>
                <select value={debtSupplierId} onChange={(e) => setDebtSupplierId(e.target.value)} required
                  className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-white">
                  <option value="">Tanlang</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Tavsif *</label>
                <input type="text" value={debtDesc} onChange={(e) => setDebtDesc(e.target.value)} required placeholder="Masalan: 20 kg Go'sht, 5 quti Kola..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Summa (UZS) *</label>
                <input type="number" value={debtAmount || ''} onChange={(e) => setDebtAmount(parseInt(e.target.value) || 0)} required min="1"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === PAY DEBT MODAL === */}
      {showPayModal && payTargetDebt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">Qarz to'lash</h3>
                <p className="text-[10px] text-slate-405 mt-0.5">{payTargetDebt.itemDescription}</p>
              </div>
              <button onClick={() => { setShowPayModal(false); setPayTargetDebt(null); }} className="text-slate-450 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <div className="bg-slate-900/50 p-3 rounded-xl flex justify-between items-center mb-4 border border-slate-700/50">
                  <div className="text-center flex-1 border-r border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Jami qarz</p>
                    <p className="text-xs font-black text-slate-300 font-mono mt-0.5">{formatCurrency(payTargetDebt.amount)}</p>
                  </div>
                  <div className="text-center flex-1 border-r border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">To'langan</p>
                    <p className="text-xs font-black text-emerald-400 font-mono mt-0.5">{formatCurrency(payTargetDebt.totalPaid || 0)}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Qoldiq</p>
                    <p className="text-xs font-black text-rose-400 font-mono mt-0.5">{formatCurrency(payTargetDebt.remainingDebt || 0)}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">To'lov turi *</label>
                <select value={payType} onChange={(e) => setPayType(e.target.value as any)} required
                  className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-white">
                  <option value="naqd">Naqd</option>
                  <option value="uzcard">Uzcard</option>
                  <option value="humo">Humo</option>
                  <option value="click">Click</option>
                  <option value="payme">Payme</option>
                  <option value="transfer">Bank O'tkazmasi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">To'lov summasi (UZS) *</label>
                <input type="number" value={payAmount || ''} onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)} required min="1" max={payTargetDebt.remainingDebt}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-emerald-500/10">
                To'lovni tasdiqlash
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
