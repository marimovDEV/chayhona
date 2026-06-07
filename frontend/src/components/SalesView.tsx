import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  FileText, 
  ChefHat,
  Clock,
  Calendar
} from 'lucide-react';
import { Sale, MenuCategory, MenuItem } from '../types';
import { checkoutDirectSale, fetchMenuCategories, fetchMenuItems, fetchShifts } from '../api';

interface SalesViewProps {
  tables?: any[];
  warehouseItems?: any[];
  sales: Sale[];
  onUpdateTable?: (updatedTable: any) => void;
  onCloseShift: () => void;
  onCheckoutSuccess: () => void;
  initialTableId?: string | null;
  onClearInitialTableId?: () => void;
}

export default function SalesView({
  sales,
  onCloseShift,
  onCheckoutSuccess
}: SalesViewProps) {
  const [viewMode, setViewMode] = useState<'kassir' | 'tarix'>('kassir');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menu data
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('all');

  // Direct Sell Modal state
  const [selectedItemToSell, setSelectedItemToSell] = useState<MenuItem | null>(null);
  const [sellQty, setSellQty] = useState<number>(1);
  const [sellPaymentType, setSellPaymentType] = useState<string>('naqd');
  const [isSelling, setIsSelling] = useState(false);

  // History & Shifts state
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);

  // Custom Toast State
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Load menu categories and items
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const cats = await fetchMenuCategories();
        setCategories(cats);
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (err) {
        console.error("Menu loading error in SalesView", err);
      }
    };
    loadMenu();
  }, []);

  // Load shifts on viewMode change
  const loadShiftsData = async () => {
    try {
      const data = await fetchShifts();
      data.sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());
      setShifts(data);
    } catch (err) {
      console.error("Failed to load shifts", err);
    }
  };

  useEffect(() => {
    if (viewMode === 'tarix') {
      loadShiftsData();
    }
  }, [viewMode]);

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeMenuCategory === 'all' || item.category === activeMenuCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Direct Sell function
  const handleDirectSell = async () => {
    if (!selectedItemToSell) return;
    if (sellQty <= 0) {
      showToast("Miqdor 0 dan katta bo'lishi kerak!");
      return;
    }
    
    setIsSelling(true);
    try {
      const totalAmount = selectedItemToSell.sellingPrice * sellQty;
      const payload: any = {
        table_type: 'table',
        table_id: null,
        total_amount: totalAmount,
        items: [
          {
            menu_item: selectedItemToSell.id,
            product: null,
            quantity: sellQty,
            price: selectedItemToSell.sellingPrice
          }
        ],
        payments: [
          {
            payment_type: sellPaymentType,
            amount: totalAmount
          }
        ]
      };
      
      const itemName = selectedItemToSell.name;
      const qtySold = sellQty;

      await checkoutDirectSale(payload);
      
      // Close modal and reset state immediately
      setSelectedItemToSell(null);
      setSellQty(1);
      setSellPaymentType('naqd');

      showToast(`${itemName} x${qtySold} muvaffaqiyatli sotildi!`);
      onCheckoutSuccess();
      loadShiftsData();
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.error || "Sotishda xatolik yuz berdi.";
      showToast(errMsg);
    } finally {
      setIsSelling(false);
    }
  };

  // Filter sales belonging to the selected shift
  const shiftSales = selectedShift ? sales.filter(s => s.shift === selectedShift.id) : [];

  // Calculate product totals for selected shift
  const getShiftProductSummary = () => {
    const summary: { [name: string]: { qty: number; total: number } } = {};
    shiftSales.forEach(s => {
      if (s.status === 'ACTIVE') {
        s.items.forEach(i => {
          if (!summary[i.name]) {
            summary[i.name] = { qty: 0, total: 0 };
          }
          summary[i.name].qty += i.quantity;
          summary[i.name].total += i.price * i.quantity;
        });
      }
    });
    return Object.entries(summary).map(([name, val]) => ({
      name,
      qty: val.qty,
      total: val.total
    }));
  };

  const shiftProducts = getShiftProductSummary();

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] select-none text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top-level View Mode Switcher */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-slate-800/40 p-2 rounded-2xl flex gap-2 border border-slate-700/50 backdrop-blur-md">
          <button 
            onClick={() => setViewMode('kassir')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${
              viewMode === 'kassir' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Kassir (Tezkor Sotuv)
          </button>
          <button 
            onClick={() => setViewMode('tarix')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${
              viewMode === 'tarix' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Smena Tarixi (Yopilgan Kunlar)
          </button>
        </div>

        {viewMode === 'kassir' && (
          <button 
            onClick={onCloseShift}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-500/10"
          >
            <Clock className="w-4 h-4" />
            <span>Smenani Yopish</span>
          </button>
        )}
      </div>

      {viewMode === 'kassir' ? (
        <div className="flex flex-col gap-4 overflow-hidden h-full w-full">
          {/* Categories and Search */}
          <div className="bg-slate-800/40 p-4 rounded-2xl space-y-3 border border-slate-700/50 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulot yoki taom qidirish..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveMenuCategory('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeMenuCategory === 'all' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'bg-slate-900/55 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                Barchasi ({menuItems.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveMenuCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeMenuCategory === cat.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'bg-slate-900/55 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  {cat.name} ({cat.itemsCount})
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 p-0.5">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isAvailable) {
                      setSelectedItemToSell(item);
                      setSellQty(1);
                      setSellPaymentType('naqd');
                    } else {
                      showToast("Mahsulot mavjud emas!");
                    }
                  }}
                  className={`bg-slate-800/40 border p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all hover:border-sky-500/30 ${
                    item.isAvailable ? 'border-slate-700/50' : 'opacity-50 border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-sm text-white leading-tight">{item.name}</span>
                      {!item.isAvailable && (
                        <span className="text-[8px] bg-rose-500/15 text-rose-450 font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">Yo'q</span>
                      )}
                    </div>
                    <span className="text-[10px] text-sky-400 mt-1 block font-semibold">{item.categoryName}</span>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-700/30">
                    <span className="font-black text-sm text-white">
                      {formatCurrency(item.sellingPrice)} <span className="text-[10px] text-slate-400">UZS</span>
                    </span>
                    {item.isAvailable && (
                      <div className="w-6 h-6 bg-sky-500/10 hover:bg-sky-500 rounded-lg flex items-center justify-center text-sky-400 hover:text-white transition">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredMenuItems.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-25 text-slate-400" />
                  <p className="text-sm font-semibold">Mahsulotlar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History & closed shifts View */
        <div className="flex flex-col lg:flex-row gap-6 h-full w-full overflow-hidden">
          
          {/* Left Panel: Shift list */}
          <div className="w-full lg:w-80 bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
              <h3 className="font-bold text-white text-sm">Yopilgan Smenalar</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Sana va aylanma summalari</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => setSelectedShift(shift)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedShift?.id === shift.id
                      ? 'bg-sky-500/10 border-sky-500/35 text-white'
                      : 'bg-slate-900/30 border-slate-800 text-slate-350 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-bold text-xs">
                        {new Date(shift.opened_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-450 font-mono">
                      {new Date(shift.opened_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} - {shift.closed_at ? new Date(shift.closed_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : 'Hozirgi'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs block font-mono">
                      {formatCurrency(parseFloat(shift.total_sales))} UZS
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${shift.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-405'}`}>
                      {shift.status === 'open' ? 'Ochiq' : 'Yopilgan'}
                    </span>
                  </div>
                </div>
              ))}

              {shifts.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-10 italic">Tarix va smenalar mavjud emas.</p>
              )}
            </div>
          </div>

          {/* Right Panel: Shift details */}
          <div className="flex-1 bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 flex flex-col overflow-hidden h-full">
            {selectedShift ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5">
                  <div>
                    <h3 className="font-black text-white text-base">
                      Smena #{selectedShift.id} Tafsiloti
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Aktivlik: {new Date(selectedShift.opened_at).toLocaleString('uz-UZ')} {selectedShift.closed_at ? ` - ${new Date(selectedShift.closed_at).toLocaleString('uz-UZ')}` : ' (Hozirgi ochiq)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Jami savdo</p>
                    <p className="font-black text-lg text-emerald-400 font-mono mt-0.5">
                      {formatCurrency(parseFloat(selectedShift.total_sales))} UZS
                    </p>
                  </div>
                </div>

                {/* Sub-panels layout */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
                  
                  {/* Aggregated Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Naqd Tushum</p>
                      <p className="text-sm font-extrabold text-white mt-1 font-mono">
                        {formatCurrency(parseFloat(selectedShift.cash_total))} UZS
                      </p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Karta Tushum</p>
                      <p className="text-sm font-extrabold text-white mt-1 font-mono">
                        {formatCurrency(parseFloat(selectedShift.card_total))} UZS
                      </p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Xarajatlar</p>
                      <p className="text-sm font-extrabold text-rose-450 mt-1 font-mono">
                        {formatCurrency(parseFloat(selectedShift.expense_total))} UZS
                      </p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Sof Foyda</p>
                      <p className={`text-sm font-extrabold mt-1 font-mono ${parseFloat(selectedShift.profit) >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                        {formatCurrency(parseFloat(selectedShift.profit))} UZS
                      </p>
                    </div>
                  </div>

                  {/* Products Sold Summary */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                    <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-sky-400" />
                      Sotilgan mahsulotlar kesimi
                    </h4>
                    <div className="space-y-2.5">
                      {shiftProducts.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800/40 pb-2 last:border-0">
                          <span className="text-slate-300 font-medium">{p.name}</span>
                          <div className="flex gap-6 items-center">
                            <span className="text-slate-400 font-semibold">{p.qty} dona</span>
                            <span className="font-extrabold text-white font-mono">{formatCurrency(p.total)} UZS</span>
                          </div>
                        </div>
                      ))}
                      {shiftProducts.length === 0 && (
                        <p className="text-xs text-slate-500 italic">Sotilgan taomlar yo'q.</p>
                      )}
                    </div>
                  </div>

                  {/* Shift Cheques list */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-xs">Smenadagi Cheklar ({shiftSales.length} ta)</h4>
                    <div className="space-y-2">
                      {shiftSales.map((sale) => (
                        <div key={sale.id} className="bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">Chek #{sale.id}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {new Date(sale.date).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-xs text-white font-mono">
                                {formatCurrency(sale.totalAmount)} UZS
                              </p>
                              <span className={`text-[8px] font-bold uppercase ${sale.status === 'CANCELLED' ? 'text-rose-455' : 'text-emerald-400'}`}>
                                {sale.status === 'CANCELLED' ? 'Bekor qilingan' : 'Muvaffaqiyatli'}
                              </span>
                            </div>
                            
                            {sale.status !== 'CANCELLED' && (
                              <button 
                                onClick={async () => {
                                  if(window.confirm(`Rostdan ham Chek #${sale.id} ni bekor qilmoqchimisiz?`)) {
                                    try {
                                      const { cancelSale } = await import('../api');
                                      await cancelSale(sale.id.toString());
                                      showToast(`Chek #${sale.id} bekor qilindi!`);
                                      onCheckoutSuccess();
                                      loadShiftsData();
                                    } catch (e) {
                                      showToast("Xatolik! Chekni bekor qilib bo'lmadi.");
                                    }
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-500/15 rounded border border-rose-500/25 transition"
                                title="Bekor qilish"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-semibold">Tafsilotlarni ko'rish uchun chap tomondan smenani tanlang</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Direct Sell Quantity & Payment Modal */}
      {selectedItemToSell && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 relative animate-scale-up">
            <button 
              onClick={() => setSelectedItemToSell(null)}
              className="absolute right-4 top-4 text-[#94a3b8] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-white text-center mb-1">
              {selectedItemToSell.name}
            </h3>
            <p className="text-xs text-sky-400 text-center font-bold mb-5 font-mono">
              Narxi: {formatCurrency(selectedItemToSell.sellingPrice)} UZS
            </p>

            <div className="space-y-4">
              {/* Quantity input */}
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Miqdori (Soni)</label>
                <input 
                  type="number"
                  min="1"
                  value={sellQty}
                  onChange={(e) => setSellQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center font-bold text-sm py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 transition"
                />
                
                {/* Fast Quantity Buttons */}
                <div className="grid grid-cols-6 gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5, 10].map(val => (
                    <button
                      key={val}
                      onClick={() => setSellQty(val)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        sellQty === val 
                          ? 'bg-sky-500 border-sky-500 text-white' 
                          : 'bg-slate-900/40 border-slate-750 text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-750 flex justify-between items-center mt-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Jami summa:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatCurrency(selectedItemToSell.sellingPrice * sellQty)} UZS
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={() => setSelectedItemToSell(null)}
                  className="py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={handleDirectSell}
                  disabled={isSelling}
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/10 text-center disabled:opacity-50"
                >
                  {isSelling ? 'Sotilmoqda...' : 'Sotish (Tasdiqlash)'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
