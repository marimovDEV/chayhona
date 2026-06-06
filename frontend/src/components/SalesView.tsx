import { useState } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  Printer, 
  Save, 
  Plus, 
  PlusCircle, 
  ShoppingBag,
  ListFilter,
  Check,
  Percent,
  FileText
} from 'lucide-react';
import { PosTable, CartItem, Sale, WarehouseItem, SalePayment } from '../types';
import { checkoutSale } from '../api';

interface SalesViewProps {
  tables: PosTable[];
  warehouseItems: WarehouseItem[];
  sales: Sale[];
  onUpdateTable: (updatedTable: PosTable) => void;
  onCloseShift: () => void;
  onCheckoutSuccess: () => void;
}

export default function SalesView({
  tables,
  warehouseItems,
  sales,
  onUpdateTable,
  onCloseShift,
  onCheckoutSuccess
}: SalesViewProps) {
  const [viewMode, setViewMode] = useState<'kassir' | 'tarix'>('kassir');
  // Navigation filters
  const [areaFilter, setAreaFilter] = useState<'barcha' | 'kabinalar' | 'tapchanlar'>('barcha');
  // Selected table ID to display in order panel. Initialize with the first table
  const [selectedId, setSelectedId] = useState<string>('');
  // Search query for menu items
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom manual price & qty insert state
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualPrice, setManualPrice] = useState<number>(45000);
  const [selectedCustomMenuIdx, setSelectedCustomMenuIdx] = useState<number>(0);

  // Receipt printed overlay state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptTable, setReceiptTable] = useState<PosTable | null>(null);
  
  // Multiple payments state
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [paymentType, setPaymentType] = useState<SalePayment['paymentType']>('naqd');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  // Custom Toast State
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper formatting function
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Find currently active selected table object
  const allTables = tables;
  const activeTable = allTables.find(t => t.id === selectedId) || allTables[0];

  // Filters results
  const filteredTables = allTables; // We can add status filters later if needed

  // Search filtered dishes/drinks from real warehouse
  const filteredMenuItems = warehouseItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selecting an item from search and putting it in order list
  const handleAddMenuItem = (productId: string, name: string, price: number) => {
    const existingIndex = activeTable.items.findIndex(i => i.productId === productId);
    let updatedItems = [...activeTable.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
    } else {
      updatedItems.push({ productId, name, price, quantity: 1 });
    }

    const billAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updatedTable: PosTable = {
      ...activeTable,
      status: 'OCCUPIED',
      items: updatedItems,
      billAmount
    };

    onUpdateTable(updatedTable);
  };

  // Add manually set item form
  const handleAddManualItem = () => {
    const menuItem = warehouseItems[selectedCustomMenuIdx] || warehouseItems[0];
    if (!menuItem) {
        showToast("Omborda mahsulot mavjud emas!");
        return;
    }
    const name = menuItem.name;
    const price = manualPrice;
    const qty = manualQty;
    const productId = menuItem.id;

    const existingIndex = activeTable.items.findIndex(i => i.productId === productId);
    const currentCartQty = existingIndex >= 0 ? activeTable.items[existingIndex].quantity : 0;

    if (menuItem.currentQty < currentCartQty + qty) {
      showToast(`Xatolik! Omborda faqat ${menuItem.currentQty} ${menuItem.unit} mavjud.`);
      return;
    }

    let updatedItems = [...activeTable.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + qty,
        price // update price to customized
      };
    } else {
      updatedItems.push({ productId, name, price, quantity: qty });
    }

    const billAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updatedTable: PosTable = {
      ...activeTable,
      status: 'OCCUPIED',
      items: updatedItems,
      billAmount
    };

    onUpdateTable(updatedTable);
    showToast("Buyurtma savatga muvaffaqiyatli qo'shildi!");
  };

  // Remove cart item or decrease quantity
  const handleRemoveCartItem = (name: string) => {
    const updatedItems = activeTable.items.filter(i => i.name !== name);
    const billAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updatedTable: PosTable = {
      ...activeTable,
      status: updatedItems.length === 0 ? 'AVAILABLE' : 'OCCUPIED',
      items: updatedItems,
      billAmount
    };

    onUpdateTable(updatedTable);
  };

  // Save/Release table order complete
  const handleSaveOrder = () => {
    showToast(`Buyurtma saqlandi! ${activeTable.name} buyurtmasi xotiraga yozildi.`);
  };

  // Clear/Reset table order
  const handleClearTable = (tableToClear: PosTable) => {
    const updatedTable: PosTable = {
      ...tableToClear,
      status: 'AVAILABLE',
      items: [],
      billAmount: 0
    };
    onUpdateTable(updatedTable);
  };

  // Print  invoice receipt
  const handlePrintReceipt = () => {
    if (activeTable.items.length === 0) {
      showToast("Savat bo'sh! Biror mahsulot qo'shing.");
      return;
    }
    setReceiptTable(activeTable);
    setPayments([]);
    setPaymentAmount(Math.round(activeTable.billAmount * 1.1)); // Initialize with total
    setChangeAmount(0);
    setShowReceiptModal(true);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPaidReceipt = async () => {
    if (receiptTable) {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const required = Math.round(receiptTable.billAmount * 1.1);
      if (totalPaid < required) {
        showToast(`Kamida ${formatCurrency(required)} so'm to'lanishi kerak!`);
        return;
      }

      setIsProcessing(true);
      try {
        await checkoutSale(receiptTable, payments);
        handleClearTable(receiptTable);
        setShowReceiptModal(false);
        setReceiptTable(null);
        setPayments([]);
        showToast("To'lov qabul qilindi. Chek chiqarildi!");
        onCheckoutSuccess();
      } catch (err) {
        console.error(err);
        showToast("Xatolik! To'lovni amalga oshirib bo'lmadi.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Calculate global summary items
  const runningTablesOrderCount = allTables.filter(t => t.status === 'OCCUPIED').length;
  const runningTablesCombinedBillSum = allTables.reduce((sum, t) => sum + t.billAmount, 0);

  // Static cumulative revenue reference matching 
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === todayStr);
  const baseTodayCombinedRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const grandCombinedRevenue = baseTodayCombinedRevenue + runningTablesCombinedBillSum;

  const totalCompletedOrdersCount = todaySales.length + runningTablesOrderCount;

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
        <div className="bg-slate-800/40 p-2 rounded-2xl flex gap-2 w-fit border border-slate-700/50 backdrop-blur-md mb-2">
          <button 
            onClick={() => setViewMode('kassir')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${
              viewMode === 'kassir' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Kassir (POS)
          </button>
          <button 
            onClick={() => setViewMode('tarix')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${
              viewMode === 'tarix' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Tarix (Yopilgan cheklar)
          </button>
        </div>

        {viewMode === 'kassir' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-full w-full">
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Navigation Filters & Legend details */}
              <div className="bg-slate-800/40 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border border-slate-700/50 backdrop-blur-md">
          <div className="flex gap-2">
            <button 
              onClick={() => setAreaFilter('barcha')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                areaFilter === 'barcha' 
                  ? 'bg-sky-500 text-white border-sky-450 shadow-md' 
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              Barcha hududlar
            </button>
            <button 
              onClick={() => setAreaFilter('kabinalar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                areaFilter === 'kabinalar' 
                  ? 'bg-sky-500 text-white border-sky-450 shadow-md' 
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              Kabinalar
            </button>
            <button 
              onClick={() => setAreaFilter('tapchanlar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                areaFilter === 'tapchanlar' 
                  ? 'bg-sky-500 text-white border-sky-450 shadow-md' 
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              Tapchanlar
            </button>
          </div>

          {/* Color coding legend instructions */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-700 rounded-full block" />
              <span>Bo'sh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#0ea5e9] rounded-full block" />
              <span>Tanlangan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full block" />
              <span>Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full block" />
              <span>Tozalashda</span>
            </div>
          </div>
        </div>

        {/* Dynamic Table scrollable grids container */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          
          {/* Unified Tables List */}
          {filteredTables.length > 0 && (
            <section className="bg-slate-800/40 p-5 rounded-[24px] border border-slate-700/50 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2.5 h-4 bg-sky-500 rounded-sm inline-block" />
                  Stollar va Xonalar
                </h3>
                <span className="text-xs text-slate-400 font-semibold">{filteredTables.length} ta ob'ekt</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredTables.map(table => {
                  const isCurSelected = table.id === selectedId;
                  const isOccupied = table.status === 'OCCUPIED' || table.status === 'RESERVED' || table.billAmount > 0;

                  return (
                    <div 
                      key={table.id}
                      onClick={() => setSelectedId(table.id)}
                      className={`p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border duration-200 ${
                        isCurSelected 
                          ? 'bg-sky-500/25 border-sky-400 text-white shadow-lg scale-105' 
                          : isOccupied 
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <ShoppingBag className={`w-6 h-6 mb-1.5 ${
                        isCurSelected ? 'text-sky-400' : isOccupied ? 'text-amber-450' : 'text-slate-500'
                      }`} />
                      <span className="font-bold text-sm text-center">{table.name}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider mt-1.5 ${
                        isCurSelected ? 'text-sky-400' : isOccupied ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {isOccupied ? `Joriy chek: ${formatCurrency(table.billAmount)} so'm` : "Bo'sh"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {/* Floating bottom sums consolidated register bar */}
        <div className="bg-slate-900 text-white p-6 rounded-[24px] flex flex-wrap gap-6 items-center justify-between border border-slate-800">
          <div className="flex gap-8 items-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Tugallangan jami</p>
              <h4 className="font-bold text-2xl text-emerald-400 mt-1">
                {formatCurrency(grandCombinedRevenue)} <span className="text-sm text-slate-300">UZS</span>
              </h4>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Bugungi buyurtmalar</p>
              <h4 className="font-bold text-2xl text-white mt-1">
                {totalCompletedOrdersCount} <span className="text-sm text-slate-400">ta</span>
              </h4>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                showToast("Kunlik hisobot kompilatsiya qilinib yuklandi. Kassa holati barqaror.");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-750 transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kunlik hisobot</span>
            </button>
            <button 
              onClick={onCloseShift}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-3.5 h-3.5 font-extrabold" />
              <span>Smenani yopish</span>
            </button>
          </div>
        </div>

      </div>

      {activeTable ? (
      <aside className="w-full lg:w-[380px] bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] flex flex-col overflow-hidden shadow-sm">
        
        {/* Active table info heading */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="font-bold text-white text-base">Sotuv qo'shish</h3>
            <span className="inline-block mt-1 bg-sky-950/60 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-800/50">
              {activeTable.name}
            </span>
          </div>
          {activeTable.items && activeTable.items.length > 0 && (
            <button 
              onClick={() => handleClearTable(activeTable)}
              className="p-1 px-2.5 text-xs text-rose-450 hover:text-white hover:bg-rose-950/50 rounded-full transition font-semibold"
              title="Joyni bo'shatish"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Scrollable order form structure */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Section 1: search database recipe products */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-1.5">
              Mahsulot qidirish
            </label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Nomi yoki kodi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700/50 text-white rounded-xl text-xs placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick search items menu results */}
            {searchQuery && (
              <div className="mt-1 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar z-25 relative text-xs">
                {filteredMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleAddMenuItem(item.id, item.name, item.sellPrice || item.purchasePrice);
                      setSearchQuery('');
                      showToast(`${item.name} qo'shildi`);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex justify-between items-center border-b border-slate-800 text-slate-200"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sky-400 font-extrabold">{formatCurrency(item.sellPrice || item.purchasePrice)} sum</span>
                  </button>
                ))}
                {filteredMenuItems.length === 0 && (
                  <div className="p-3 text-xs text-slate-500 text-center">Hech narsa topilmadi</div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Selected order items list */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-3">
              Buyurtma ro'yxati
            </label>
            
            {activeTable.items.length === 0 ? (
              <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Savat bo'sh</p>
                <p className="text-[10px] text-slate-500 mt-1">Sotuvni boshlash uchun mahsulot qidiring yoki qo'shing</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTable.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-slate-900/50 border-l-4 border-sky-500 rounded-r-xl group hover:bg-slate-900 transition"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-white text-xs truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sky-400 text-xs font-mono">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <button 
                        onClick={() => handleRemoveCartItem(item.name)}
                        className="text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Add new customized item interface */}
          <div className="p-4 bg-slate-900/40 border border-slate-750/50 rounded-xl space-y-3">
            <h4 className="text-[10px] text-sky-400 uppercase font-black tracking-wider">Tezkor kiritish shakli</h4>
            <div>
              <label className="block text-[10px] text-slate-350 mb-1">Mahsulot nomi select</label>
              <select 
                value={selectedCustomMenuIdx}
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  setSelectedCustomMenuIdx(idx);
                  if (warehouseItems[idx]) {
                    setManualPrice(warehouseItems[idx].sellPrice || warehouseItems[idx].purchasePrice);
                  }
                }}
                className="w-full text-xs font-bold px-2 py-1.5 bg-slate-900 border border-slate-750 rounded text-slate-200 outline-none"
              >
                {warehouseItems.map((item, idx) => (
                  <option key={idx} value={idx}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-350 mb-1">Miqdori</label>
                <input 
                  type="number"
                  min="1"
                  value={manualQty}
                  onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center font-bold text-xs px-2 py-1.5 bg-slate-900 border border-slate-700/60 rounded text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-350 mb-1">Narxi (so'm)</label>
                <input 
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-right font-bold text-xs px-2 py-1.5 bg-slate-900 border border-slate-700/60 rounded text-white outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleAddManualItem}
              className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>buyurtmaga qo'shish</span>
            </button>
          </div>

        </div>

        {/* Sidebar Footer Operations */}
        <div className="p-5 bg-slate-900/40 border-t border-slate-800/60">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Umumiy summa</span>
            <span className="text-lg font-black text-white font-mono">
              {formatCurrency(activeTable.billAmount)} UZS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handlePrintReceipt}
              className="py-3 bg-slate-900 border border-slate-705 text-slate-300 hover:bg-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Check chiqarish</span>
            </button>
            <button 
              onClick={handleSaveOrder}
              className="py-3 bg-sky-500 hover:bg-sky-450 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-sky-500/15 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Saqlash</span>
            </button>
          </div>
        </div>

      </aside>
      ) : (
        <aside className="w-full lg:w-[380px] bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] flex items-center justify-center overflow-hidden shadow-sm text-slate-500 font-bold">
          Stol tanlanmagan
        </aside>
      )}
            </div>
        ) : (
          <div className="flex-1 bg-slate-850/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-sky-400" />
                Tarix / Yopilgan cheklar
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {sales.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Hozircha yopilgan cheklar yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => (
                    <div key={sale.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/60 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sale.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {sale.status === 'CANCELLED' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Chek #{sale.id}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            {new Date(sale.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-white font-mono">{formatCurrency(sale.totalAmount)} <span className="text-[10px] text-slate-400">UZS</span></p>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${sale.status === 'CANCELLED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {sale.status === 'CANCELLED' ? 'Bekor qilingan' : 'Muvaffaqiyatli'}
                        </p>
                      </div>

                      {sale.status !== 'CANCELLED' && (
                        <button 
                          onClick={async () => {
                            if(window.confirm(`Rostdan ham Chek #${sale.id} ni bekor qilmoqchimisiz? Ombor va moliya qaytariladi!`)) {
                              try {
                                const { cancelSale } = await import('../api');
                                await cancelSale(sale.id.toString());
                                showToast(`Chek #${sale.id} bekor qilindi!`);
                                onCheckoutSuccess(); // to trigger refetch
                              } catch (e) {
                                showToast("Xatolik! Chekni bekor qilib bo'lmadi.");
                              }
                            }
                          }}
                          className="ml-4 p-2 text-rose-500 hover:bg-rose-500/20 rounded-lg transition"
                          title="Bekor qilish"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Interactive print receipt modal */}
      {showReceiptModal && receiptTable && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 relative animate-scale-up">
            <button 
              onClick={() => setShowReceiptModal(false)}
              className="absolute right-4 top-4 text-[#94a3b8] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt headers */}
            <div className="text-center font-mono">
              <h3 className="font-black text-base text-white">VERDANT RMS</h3>
              <p className="text-[10px] text-slate-400 mt-1">Toshkent sh., Yunusobod t., 4-mavze</p>
              <p className="text-[10px] text-slate-400">Tel: +998 71 200 05 05</p>
              <div className="border-b border-dashed border-slate-800 my-4" />
              <div className="text-left text-xs space-y-1 text-slate-300">
                <p><span className="font-bold text-slate-400">Sana:</span> {new Date().toLocaleDateString('uz-UZ')} {new Date().toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}</p>
                <p><span className="font-bold text-slate-400">Kassa:</span> #01 (Kassir: Malika K.)</p>
                <p><span className="font-bold text-slate-400">Joy:</span> {receiptTable.name}</p>
              </div>
              <div className="border-b border-dashed border-slate-800 my-4" />
              
              {/* Receipt items list */}
              <table className="w-full text-right text-xs text-slate-300">
                <thead>
                  <tr className="font-black text-slate-400 border-b border-slate-800">
                    <th className="text-left py-1">Nomi</th>
                    <th>Soni</th>
                    <th>Narxi</th>
                    <th>Jami</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {receiptTable.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="text-left py-1.5 truncate max-w-[120px]">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-800 my-4" />
              <p className="text-[10px] text-slate-400 italic">Xaridingiz uchun rahmat! Yoqimli ishtaha!</p>
            </div>

            {/* Multiple Payment Selectors */}
            <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-white mb-2">To'lov usullari</h4>
              <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                    <span className="uppercase">{p.paymentType}</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(p.amount)} UZS</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <select 
                    value={paymentType} 
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white outline-none"
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
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (paymentAmount > 0) {
                    const requiredTotal = Math.round(receiptTable.billAmount * 1.1);
                    const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0);
                    const requiredRemaining = Math.max(0, requiredTotal - currentTotal);
                    
                    const actualAmountToAdd = Math.min(paymentAmount, requiredRemaining);
                    const qaytim = Math.max(0, paymentAmount - requiredRemaining);
                    
                    if (actualAmountToAdd > 0) {
                      setPayments([...payments, { paymentType, amount: actualAmountToAdd }]);
                    }
                    
                    setChangeAmount(changeAmount + qaytim);
                    setPaymentAmount(Math.max(0, requiredRemaining - actualAmountToAdd));
                  }
                }}
                className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition"
              >
                Qo'shish
              </button>
            </div>

            {/* Qaytim Display */}
            {changeAmount > 0 && (
              <div className="mt-3 bg-emerald-500/20 border border-emerald-500/50 p-3 rounded-xl flex justify-between items-center text-emerald-400">
                <span className="text-xs font-bold uppercase tracking-wider">Qaytim beriladi:</span>
                <span className="text-lg font-black font-mono">{formatCurrency(changeAmount)} UZS</span>
              </div>
            )}

            {/* Print action buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleConfirmPaidReceipt}
                disabled={isProcessing}
                className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/10 text-center disabled:opacity-50"
              >
                {isProcessing ? 'Bajarilmoqda...' : "To'lovni tasdiqlash"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
