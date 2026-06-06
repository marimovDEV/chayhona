import React, { useState } from 'react';
import { Plus, X, Edit3, Trash2, ShieldCheck, Search } from 'lucide-react';
import { TableModel } from '../types';

interface TablesViewProps {
  tables: TableModel[];
  onAddTable: (table: Omit<TableModel, 'id'>) => void;
  onUpdateTable: (id: string, table: Partial<TableModel>) => void;
  onDeleteTable: (id: string) => void;
}

export function TablesView({ tables, onAddTable, onUpdateTable, onDeleteTable }: TablesViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);
  
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('AVAILABLE');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredTables = tables.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusBadge = (status: string) => {
    if (status === 'AVAILABLE') return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">Bo'sh</span>;
    if (status === 'OCCUPIED') return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-bold">Band</span>;
    return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold">Bron</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Stollar Boshqaruvi</h2>
          <p className="text-slate-400 text-sm mt-1">Barcha xonalar, tapchanlar va stollarni nazorat qilish</p>
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
            className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" /> Stol qo'shish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map(table => (
          <div key={table.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-colors group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center border border-slate-700/50">
                <ShieldCheck className={`w-6 h-6 ${table.status === 'AVAILABLE' ? 'text-emerald-400' : table.status === 'OCCUPIED' ? 'text-rose-400' : 'text-amber-400'}`} />
              </div>
              {getStatusBadge(table.status)}
            </div>
            <h3 className="text-lg font-bold text-white">{table.name}</h3>
            <p className="text-sm text-slate-400 mt-1">Sig'imi: <span className="text-slate-300 font-semibold">{table.capacity} kishi</span></p>
            
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => openEdit(table)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700/30 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
              </button>
              <button 
                onClick={() => { if(confirm("O'chirishni xohlaysizmi?")) onDeleteTable(table.id); }}
                className="p-2 bg-slate-700/30 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700/50 shadow-2xl p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{showEdit ? "Stolni tahrirlash" : "Yangi stol qo'shish"}</h3>
              <button onClick={() => showEdit ? setShowEdit(false) : setShowAdd(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={showEdit ? handleUpdate : handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stol/Xona nomi *</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masalan: Stol 1 yoki Kabina 5"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sig'imi (Kishi soni) *</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Holati</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50"
                >
                  <option value="AVAILABLE">Bo'sh</option>
                  <option value="OCCUPIED">Band</option>
                  <option value="RESERVED">Bron qilingan</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => showEdit ? setShowEdit(false) : setShowAdd(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-sky-500 hover:bg-sky-400 transition shadow-lg shadow-sky-500/20">
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
