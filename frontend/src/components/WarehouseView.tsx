import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  X,
  Archive,
  History,
  Check,
  Edit3,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { WarehouseItem, InventoryHistory } from '../types';

interface WarehouseViewProps {
  warehouseItems: WarehouseItem[];
  inventoryHistory: InventoryHistory[];
  onAddWarehouseItem: (item: WarehouseItem) => void;
  onUpdateWarehouseItem: (item: WarehouseItem) => void;
  onDeleteWarehouseItem: (id: string) => void;
  onCreateStockEntry: (productId: string, quantity: number, price: number, note: string) => void;
  onCreateStockExit: (productId: string, quantity: number, reason: string) => void;
}

export default function WarehouseView({
  warehouseItems,
  inventoryHistory,
  onAddWarehouseItem,
  onUpdateWarehouseItem,
  onDeleteWarehouseItem,
  onCreateStockEntry,
  onCreateStockExit
}: WarehouseViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Barchasi');

  // Modal triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInoutModal, setShowInoutModal] = useState(false);
  const [inoutType, setInoutType] = useState<'kirim' | 'chiqim'>('kirim');

  // Add item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Taom asosi');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemPurchase, setNewItemPurchase] = useState(25000);
  const [newItemSell, setNewItemSell] = useState(0);
  const [newItemMin, setNewItemMin] = useState(10);
  const [newItemQty, setNewItemQty] = useState(30);

  // Inlet-Outlet logs form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [logQty, setLogQty] = useState<number>(0);

  // Edit item state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingUnit, setEditingUnit] = useState('');
  const [editingPurchasePrice, setEditingPurchasePrice] = useState(0);
  const [editingSellPrice, setEditingSellPrice] = useState(0);
  const [editingMin, setEditingMin] = useState(0);

  // Custom Notifications Info toast
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Group unique categories
  const categories = ['Barchasi', ...Array.from(new Set(warehouseItems.map(item => item.category)))];

  // Filtering actions
  const filteredItems = warehouseItems.filter(item => {
    const matchesCat = categoryFilter === 'Barchasi' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Dynamic status badges
  const getStatusBadge = (item: WarehouseItem) => {
    if (item.currentQty <= item.minThreshold * 0.5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-400 uppercase border border-rose-500/20">
          Kritik
        </span>
      );
    } else if (item.currentQty <= item.minThreshold) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 uppercase border border-amber-500/20">
          Kam qolgan
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">
          Normal
        </span>
      );
    }
  };

  // Create new stock item
  const handleCreateItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showToast("Iltimos, mahsulot nomini kiriting.");
      return;
    }

    const calculatedStatus = newItemQty <= newItemMin * 0.5 
      ? 'critical' 
      : newItemQty <= newItemMin 
        ? 'low' 
        : 'normal';

    const newItem: WarehouseItem = {
      id: `wh-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      purchasePrice: newItemPurchase,
      sellPrice: newItemSell,
      minThreshold: newItemMin,
      currentQty: newItemQty,
      status: calculatedStatus
    };

    onAddWarehouseItem(newItem);
    setShowAddModal(false);

    // Reset forms
    setNewItemName('');
    setNewItemMin(10);
    setNewItemQty(30);
    setNewItemPurchase(25000);
    setNewItemSell(0);

    showToast("Yangi mahsulot omborga qo'shildi!");
  };

  const openEditModal = (item: WarehouseItem) => {
    setEditingItem(item);
    setEditingName(item.name);
    setEditingCategory(item.category);
    setEditingUnit(item.unit);
    setEditingPurchasePrice(item.purchasePrice);
    setEditingSellPrice(item.sellPrice || 0);
    setEditingMin(item.minThreshold);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) {
      showToast("Mahsulot nomini kiriting.");
      return;
    }
    if (editingItem) {
      const calculatedStatus = editingItem.currentQty <= editingMin * 0.5 
        ? 'critical' 
        : editingItem.currentQty <= editingMin 
          ? 'low' 
          : 'normal';

      const updated: WarehouseItem = {
        ...editingItem,
        name: editingName.trim(),
        category: editingCategory,
        unit: editingUnit,
        purchasePrice: editingPurchasePrice,
        sellPrice: editingSellPrice,
        minThreshold: editingMin,
        status: calculatedStatus
      };
      onUpdateWarehouseItem(updated);
      setShowEditModal(false);
      setEditingItem(null);
      showToast("Mahsulot muvaffaqiyatli tahrirlandi!");
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      onDeleteWarehouseItem(id);
      showToast("Mahsulot o'chirildi.");
    }
  };

  // Perform inlet/outlet stock update transaction
  const handleLogStockTransaction = (e: FormEvent) => {
    e.preventDefault();
    const itemToUpdate = warehouseItems.find(i => i.id === selectedItemId);
    if (!itemToUpdate) {
      showToast("Mahsulot topilmadi.");
      return;
    }

    if (inoutType === 'kirim') {
      onCreateStockEntry(itemToUpdate.id, logQty, itemToUpdate.purchasePrice, 'Qo\'lda kiritilgan kirim');
    } else {
      onCreateStockExit(itemToUpdate.id, logQty, 'Qo\'lda kiritilgan chiqim');
    }

    setShowInoutModal(false);
    setLogQty(0);
    showToast(`${inoutType} muvaffaqiyatli saqlandi!`);
  };

  // Dynamic KPI stats calculations
  const totalStockCount = warehouseItems.length;
  const lowStockCount = warehouseItems.filter(i => i.currentQty <= i.minThreshold && i.currentQty > i.minThreshold * 0.5).length;
  const criticalStockCount = warehouseItems.filter(i => i.currentQty <= i.minThreshold * 0.5).length;
  const monthlyInputsVal = inventoryHistory.filter(h => h.type === 'kirim').reduce((sum, h) => sum + h.amount, 0);

  // Real data for dynamics
  const totalOperations = inventoryHistory.length;
  const totalKirimCount = inventoryHistory.filter(h => h.type === 'kirim').length;
  const totalChiqimCount = inventoryHistory.filter(h => h.type === 'chiqim').length;
  const averageInputPerDay = monthlyInputsVal > 0 ? monthlyInputsVal / 30 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-[#0ea5e9] text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header and actions panel bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Sklad Boshqaruvi (Ombor)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Resurslar va mahsulotlar real vaqt rejimida limit nazorati</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setInoutType('chiqim');
              setShowInoutModal(true);
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-750 hover:bg-slate-800 text-rose-455 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Minus className="w-3.5 h-3.5 text-rose-450" />
            <span>Chiqim qo'shish</span>
          </button>
          <button 
            onClick={() => {
              setInoutType('kirim');
              setShowInoutModal(true);
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-450 transition shadow text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Kirim qo'shish</span>
          </button>
        </div>
      </div>

      {/* Grid: Stats panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 - All stock */}
        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Barcha mahsulotlar</p>
            <h4 className="text-2xl font-bold text-white">{totalStockCount}</h4>
            <div className="flex items-center gap-1 text-sky-450 font-bold text-[10px] mt-1.5">
              <span>Aktiv holatda</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 - Low stock */}
        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Kam qolganlar</p>
            <h4 className="text-2xl font-bold text-rose-400">{lowStockCount}</h4>
            <div className="flex items-center gap-1 text-rose-400 font-bold text-[10px] mt-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Tezkor ko'rib chiqish</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 - Out of stock */}
        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 font-sans">Tugagan mahsulotlar</p>
            <h4 className="text-2xl font-bold text-slate-200">{criticalStockCount}</h4>
            <div className="flex items-center gap-1 text-slate-400 font-semibold text-[10px] mt-1.5">
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Oxirgi 24 soat</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
            <X className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 - Combined Monthly Inputs */}
        <div className="bg-slate-850/40 p-5 border border-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Kirimlar (oylik)</p>
            <h4 className="text-2xl font-bold text-emerald-400">{monthlyInputsVal > 0 ? formatCurrency(monthlyInputsVal) : '0'}</h4>
            <div className="flex items-center justify-between font-bold text-[10px] text-slate-400 mt-1.5">
              <span>HISOB-FAKTURALAR • UZS</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Table: Sklad Ro'yxati */}
      <section className="bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="font-bold text-white text-sm">Mahsulotlar ombori ro'yxati</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Minimal va joriy qoldiqlar limit nazorati</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <input 
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs block text-white placeholder:text-slate-500 outline-none focus:border-sky-500 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>
            
            {/* Quick Categories Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1.5 border border-slate-700 bg-slate-900 text-xs rounded-lg text-slate-300 focus:border-sky-550 outline-none font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-400">
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold">Nomi</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold">Kategoriyasi</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold">Birligi</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-right">Xarid narxi</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-right">Sotuv narxi</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-right">Minimal limit</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-right">Joriy qoldiq</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-center">Holat</th>
                <th className="px-6 py-3.5 text-[10px] uppercase font-bold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-bold text-white text-sm">{item.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-300">{item.category}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{item.unit}</td>
                  <td className="px-6 py-4 text-xs text-right text-slate-300 font-mono">
                    {formatCurrency(item.purchasePrice)} UZS
                  </td>
                  <td className="px-6 py-4 text-xs text-right text-slate-300 font-mono">
                    {item.sellPrice > 0 ? `${formatCurrency(item.sellPrice)} UZS` : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-right text-slate-400 font-semibold">{item.minThreshold}</td>
                  <td className="px-6 py-4 text-xs text-right text-white font-black font-sans">{item.currentQty}</td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(item)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="text-slate-400 hover:text-sky-400 transition mr-3"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-500">
                    Skladda mahsulotlar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lower section: Recent logs inlet panel AND analysis abstract banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Abstract dynamics analytical box */}
        <div className="lg:col-span-2 bg-gradient-to-tr from-slate-950 to-slate-800 p-6 rounded-[24px] text-white relative overflow-hidden flex flex-col justify-end h-64 border border-slate-800 shadow-md">
          <div className="absolute right-0 top-0 w-64 h-64 opacity-5 pointer-events-none">
          </div>
          <div className="z-10">
            <span className="bg-sky-500/15 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Ombor Tahlillari</span>
            <h4 className="text-xl font-bold mt-2 font-sans tracking-tight">Ombor Dinamikasi</h4>
            <p className="text-slate-300 text-xs mt-1.5 max-w-md leading-relaxed">
              Tizimda jami {totalOperations} ta operatsiya qayd etilgan. Shundan {totalKirimCount} ta kirim va {totalChiqimCount} ta chiqim operatsiyasi amalga oshirilgan.
            </p>
            <div className="mt-5 flex gap-8">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">O'rtacha kirim</p>
                <p className="text-lg font-black text-emerald-450 mt-1">{averageInputPerDay > 0 ? formatCurrency(averageInputPerDay) + " so'm / kun" : "0 so'm"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Jami kirim summasi</p>
                <p className="text-lg font-black text-sky-400 mt-1">{formatCurrency(monthlyInputsVal)} so'm</p>
              </div>
            </div>
          </div>
        </div>

        {/* History logs block */}
        <div className="bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white text-sm">Oxirgi Kirimlar</h4>
            <History className="w-4 h-4 text-slate-500" />
          </div>
          
          <div className="space-y-3">
            {inventoryHistory.map((hist, idx) => (
              <div 
                key={hist.id} 
                className={`flex items-start gap-3 pl-3 py-1.5 border-l-4 ${
                  hist.type === 'kirim' ? 'border-emerald-500' : 'border-rose-500'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs truncate">{hist.itemName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{hist.user} • {hist.timeAgo}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${
                    hist.type === 'kirim' ? 'text-emerald-400' : 'text-rose-450'
                  }`}>
                    {hist.type === 'kirim' ? '+' : '-'}{hist.quantity} {hist.unit}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold">{formatCurrency(hist.amount)} UZS</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              showToast("Barcha operatsiyalar tarixi yuklanmoqda...");
            }}
            className="w-full mt-4 py-2 text-center text-xs font-bold text-slate-350 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl transition"
          >
            Barchasini ko'rish
          </button>
        </div>

      </div>

      {/* Floating corner FAB element trigger */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-sky-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-10 hover:bg-sky-400 cursor-pointer"
      >
        <Plus className="w-5 h-5 font-bold" />
      </button>

      {/* Add New Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-700/60">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <Package className="w-5 h-5 text-sky-400" />
                <span>Yangi mahsulot qo'shish</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mahsulot nomi*</label>
                <input 
                  type="text"
                  required
                  placeholder="Masalan: Guruch (Alanga)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kategoriya</label>
                  <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full text-xs px-2 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-medium"
                  >
                    <option value="Taom asosi">Taom asosi</option>
                    <option value="Ichimlik">Ichimlik</option>
                    <option value="Masalliq">Masalliq</option>
                    <option value="Salat">Salat</option>
                    <option value="Xo'jalik">Xo'jalik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">O'lchov birligi</label>
                  <select 
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full text-xs px-2 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-medium"
                  >
                    <option value="kg">kg</option>
                    <option value="dona">dona</option>
                    <option value="litr">litr</option>
                    <option value="porsiya">porsiya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Xarid narxi (UZS)*</label>
                  <input 
                    type="number"
                    required
                    value={newItemPurchase}
                    onChange={(e) => setNewItemPurchase(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Usti narxi (sotuv UZS)</label>
                  <input 
                    type="number"
                    value={newItemSell}
                    onChange={(e) => setNewItemSell(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Minimal limit ostonasi *</label>
                  <input 
                    type="number"
                    required
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Boshlang'ich qoldiq *</label>
                  <input 
                    type="number"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-450 text-white font-extrabold rounded-xl transition"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inlet/Outlet Log Register Modal */}
      {showInoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-base capitalize flex items-center gap-1">
                <span>{inoutType} qayd etish</span>
              </h3>
              <button onClick={() => setShowInoutModal(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogStockTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mahsulot tanlang</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full text-xs px-2 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-medium"
                >
                  {warehouseItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Miqdor (ta/kg/litr)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={logQty}
                  onChange={(e) => setLogQty(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none font-bold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowInoutModal(false)}
                  className="flex-1 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold rounded-xl"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-2 text-white font-extrabold rounded-xl ${
                    inoutType === 'kirim' ? 'bg-emerald-500 hover:bg-emerald-450' : 'bg-rose-500 hover:bg-rose-450'
                  }`}
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-base">
                Mahsulotni tahrirlash: <span className="text-sky-400">{editingItem.name}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomi *</label>
                  <input 
                    type="text"
                    required
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategoriyasi</label>
                  <select 
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  >
                    {categories.filter(c => c !== 'Barchasi').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Birligi</label>
                  <select 
                    value={editingUnit}
                    onChange={(e) => setEditingUnit(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  >
                    <option value="kg">kg</option>
                    <option value="dona">dona</option>
                    <option value="litr">litr</option>
                    <option value="porsiya">porsiya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimal limit</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={editingMin}
                    onChange={(e) => setEditingMin(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Xarid narxi (UZS)</label>
                  <input 
                    type="number"
                    required
                    value={editingPurchasePrice}
                    onChange={(e) => setEditingPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sotish narxi (UZS)</label>
                  <input 
                    type="number"
                    value={editingSellPrice}
                    onChange={(e) => setEditingSellPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-450 text-white font-extrabold rounded-xl transition"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
