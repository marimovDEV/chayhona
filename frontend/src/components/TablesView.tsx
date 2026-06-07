import React, { useState } from 'react';
import { 
  Plus, X, Edit3, Trash2, ShieldCheck, Search, Users, 
  Clock, User, Phone, ArrowRight, ClipboardList, CheckCircle, AlertCircle
} from 'lucide-react';
import { TableModel, Reservation, Sale, PosTable } from '../types';
import { updateReservationStatus } from '../api';

interface TablesViewProps {
  tables: PosTable[];
  reservations: Reservation[];
  sales: Sale[];
  onAddTable: (table: Omit<TableModel, 'id'>) => void;
  onUpdateTable: (id: string, table: Partial<TableModel>) => void;
  onDeleteTable: (id: string) => void;
  onGoToPOS: (tableId: string) => void;
}

export function TablesView({ 
  tables, 
  reservations, 
  sales, 
  onAddTable, 
  onUpdateTable, 
  onDeleteTable,
  onGoToPOS
}: TablesViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);
  
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('AVAILABLE');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'kabina' | 'tapchan' | 'stol'>('all');
  
  // Selected table for details modal
  const [selectedTable, setSelectedTable] = useState<PosTable | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTable({ name, capacity, status });
    setShowAdd(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      onUpdateTable(editingTable.id, { name, capacity, status });
      setShowEdit(false);
      setEditingTable(null);
      resetForm();
    }
  };

  const openEdit = (table: TableModel) => {
    setEditingTable(table);
    setName(table.name);
    setCapacity(table.capacity);
    setStatus(table.status);
    setShowEdit(true);
  };

  const resetForm = () => {
    setName('');
    setCapacity(4);
    setStatus('AVAILABLE');
  };

  const handleStatusChange = (tableId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED') => {
    onUpdateTable(tableId, { status: newStatus });
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Check-in a reserved table
  const handleCheckInReservation = async (reservation: Reservation, tableId: string) => {
    try {
      await updateReservationStatus(reservation.id, 'ARRIVED');
      onUpdateTable(tableId, { status: 'OCCUPIED' });
      onGoToPOS(tableId);
      setSelectedTable(null);
    } catch (err) {
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  // Filtering tables
  const filteredTables = tables.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    const lowerName = t.name.toLowerCase();
    if (filterType === 'kabina') return lowerName.includes('kabina');
    if (filterType === 'tapchan') return lowerName.includes('tapchan') || lowerName.includes('topchan');
    if (filterType === 'stol') return lowerName.includes('stol') || (!lowerName.includes('kabina') && !lowerName.includes('tapchan'));
    
    return true;
  });

  // Stats calculation
  const totalCount = tables.length;
  const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const reservedCount = tables.filter(t => t.status === 'RESERVED').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Find active reservation for a table
  const getActiveReservation = (tableId: string) => {
    return reservations.find(r => 
      r.tableNumber === tableId && 
      (r.status === 'PENDING' || r.status === 'CONFIRMED')
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 text-slate-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Zal Monitoringi</h2>
          <p className="text-slate-400 text-sm mt-1">Stollar, kabinalar va tapchanlarning joriy holatini kuzatish</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 border border-slate-750 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Jami joylar</span>
            <h4 className="text-2xl font-extrabold text-white mt-1">{totalCount} ta</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-center font-bold text-slate-400">
            {totalCount}
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-750 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-450">Bo'sh</span>
            <h4 className="text-2xl font-extrabold text-emerald-450 mt-1">{availableCount} ta</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
            {availableCount}
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-750 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-455">Band</span>
            <h4 className="text-2xl font-extrabold text-rose-450 mt-1">{occupiedCount} ta</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-450">
            {occupiedCount}
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-750 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-450">Bron qilingan</span>
            <h4 className="text-2xl font-extrabold text-amber-455 mt-1">{reservedCount} ta</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-450">
            {reservedCount}
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 border-b border-slate-800 pb-2.5">
        {[
          { id: 'all', label: 'Barcha joylar' },
          { id: 'kabina', label: 'Kabinalar' },
          { id: 'tapchan', label: 'Tapchanlar' },
          { id: 'stol', label: 'Stollar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
              filterType === tab.id 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTables.map(table => {
          const res = getActiveReservation(table.id);
          const hasItems = table.items && table.items.length > 0;
          
          let statusStyle = "";
          let statusLabel = "";
          
          if (table.status === 'AVAILABLE') {
            statusStyle = "border-emerald-500/20 hover:border-emerald-500/40 bg-slate-900/20 hover:shadow-emerald-500/5";
            statusLabel = "Bo'sh";
          } else if (table.status === 'OCCUPIED') {
            statusStyle = "border-rose-500/30 bg-rose-950/5 hover:border-rose-500/50 hover:shadow-rose-500/5";
            statusLabel = "Band";
          } else {
            statusStyle = "border-amber-500/30 bg-amber-950/5 hover:border-amber-500/50 hover:shadow-amber-500/5";
            statusLabel = "Bron";
          }

          return (
            <div 
              key={table.id} 
              onClick={() => setSelectedTable(table)}
              className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg relative group overflow-hidden ${statusStyle}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-base tracking-tight leading-none pt-0.5">{table.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                  table.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' :
                  table.status === 'OCCUPIED' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                }`}>
                  {statusLabel}
                </span>
              </div>
              
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>Sig'imi: {table.capacity} kishi</span>
                </div>

                {table.status === 'OCCUPIED' && (
                  <div className="text-xs font-mono font-bold text-rose-400 bg-rose-950/20 px-2 py-1 rounded border border-rose-500/10 w-fit">
                    {formatCurrency(table.billAmount)} UZS
                  </div>
                )}

                {table.status === 'RESERVED' && res && (
                  <div className="text-[11px] text-amber-400 bg-amber-950/20 px-2 py-1 rounded border border-amber-500/10 truncate" title={`${res.name} (${res.time})`}>
                    🕒 {res.time.substring(0, 5)} • {res.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTables.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl">
            Hech qanday joy topilmadi
          </div>
        )}
      </div>

      {/* DETAILED OVERLAY/MODAL FOR TABLE */}
      {selectedTable && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800/80 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{selectedTable.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    selectedTable.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' :
                    selectedTable.status === 'OCCUPIED' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                  }`}>
                    {selectedTable.status === 'AVAILABLE' ? "Bo'sh" : selectedTable.status === 'OCCUPIED' ? 'Band' : 'Bron qilingan'}
                  </span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">Sig'imi: {selectedTable.capacity} kishi uchun mo'ljallangan</p>
              </div>
              <button 
                onClick={() => setSelectedTable(null)} 
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Quick Status Control */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Holatni o'zgartirish</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleStatusChange(selectedTable.id, 'AVAILABLE')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedTable.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🟢 Bo'sh
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedTable.id, 'OCCUPIED')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedTable.status === 'OCCUPIED'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                        : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🔴 Band
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedTable.id, 'RESERVED')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedTable.status === 'RESERVED'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-450'
                        : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🟡 Bron
                  </button>
                </div>
              </div>

              {/* Active Order Cart if status is OCCUPIED */}
              {selectedTable.status === 'OCCUPIED' && (
                <div className="space-y-3 bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Joriy buyurtma (Savat)</span>
                  
                  {selectedTable.items && selectedTable.items.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1 divide-y divide-slate-800/60">
                        {selectedTable.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 text-xs">
                            <div>
                              <p className="font-bold text-white">{item.name}</p>
                              <span className="text-slate-400 text-[10px]">{formatCurrency(item.price)} UZS x {item.quantity}</span>
                            </div>
                            <span className="font-bold font-mono text-white">{formatCurrency(item.price * item.quantity)} UZS</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-slate-800 pt-3 flex justify-between items-center font-bold text-sm">
                        <span className="text-slate-400">Jami hisob:</span>
                        <span className="text-rose-400 font-mono">{formatCurrency(selectedTable.billAmount)} UZS</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Savat bo'sh. Taom yoki ichimliklar qo'shilmagan.
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      onGoToPOS(selectedTable.id);
                      setSelectedTable(null);
                    }}
                    className="w-full mt-3 py-2.5 bg-rose-500 hover:bg-rose-450 transition text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Sotuv oynasini ochish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Reservation details if status is RESERVED */}
              {selectedTable.status === 'RESERVED' && (() => {
                const res = getActiveReservation(selectedTable.id);
                return (
                  <div className="space-y-3 bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Bron ma'lumotlari</span>
                    
                    {res ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Mijoz</span>
                            <span className="font-bold text-white">{res.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Telefon</span>
                            <span className="font-bold text-white font-mono">{res.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Sana / Vaqt</span>
                            <span className="font-bold text-white">{res.date} • {res.time.substring(0, 5)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Mehmonlar</span>
                            <span className="font-bold text-white">{res.guestsCount} kishi</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex gap-2">
                          <button
                            onClick={() => handleCheckInReservation(res, selectedTable.id)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-450 transition text-white text-xs font-bold rounded-xl"
                          >
                            Keldi (Band qilish)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        Ushbu joy uchun faol bronlash ma'lumotlari topilmadi.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action buttons for AVAILABLE */}
              {selectedTable.status === 'AVAILABLE' && (
                <button 
                  onClick={() => {
                    handleStatusChange(selectedTable.id, 'OCCUPIED');
                    onGoToPOS(selectedTable.id);
                    setSelectedTable(null);
                  }}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 transition text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>Yangi buyurtma ochish (POS)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>

            {/* Modal Actions (Tahrirlash / O'chirish) */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800/80 flex gap-3">
              <button 
                onClick={() => { setSelectedTable(null); openEdit(selectedTable); }}
                className="flex-1 py-2 border border-slate-700 hover:bg-slate-800 transition text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Tahrirlash
              </button>
              <button 
                onClick={() => { 
                  if(confirm("Haqiqatan ham bu joyni o'chirmoqchimisiz?")) {
                    onDeleteTable(selectedTable.id);
                    setSelectedTable(null);
                  }
                }}
                className="py-2 px-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition font-bold text-xs rounded-xl flex items-center justify-center"
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700/50 shadow-2xl p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{showEdit ? "Joyni tahrirlash" : "Yangi joy qo'shish"}</h3>
              <button onClick={() => showEdit ? setShowEdit(false) : setShowAdd(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={showEdit ? handleUpdate : handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomi *</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masalan: Stol 1, Kabina 5, Tapchan 12"
                  className="w-full bg-slate-900/50 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sig'imi (Kishi soni) *</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-900/50 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Boshlang'ich Holati</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900/50 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
                >
                  <option value="AVAILABLE">Bo'sh (AVAILABLE)</option>
                  <option value="OCCUPIED">Band (OCCUPIED)</option>
                  <option value="RESERVED">Bron (RESERVED)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => showEdit ? setShowEdit(false) : setShowAdd(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition text-xs">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-white bg-sky-500 hover:bg-sky-400 transition shadow-lg shadow-sky-500/20 text-xs">
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

