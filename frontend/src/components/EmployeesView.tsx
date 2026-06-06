import { useState, FormEvent } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  UserPlus, 
  Briefcase, 
  X,
  TrendingUp,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeesView({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: EmployeesViewProps) {
  const [filterPosition, setFilterPosition] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add employee modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('+998 ');
  const [newEmpPos, setNewEmpPos] = useState('Ofitsiant');
  const [newEmpSalary, setNewEmpSalary] = useState(4000000);
  const [newEmpNotes, setNewEmpNotes] = useState('');

  // Edit employee state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [editingPos, setEditingPos] = useState('');
  const [editingSalary, setEditingSalary] = useState(0);
  const [editingNotes, setEditingNotes] = useState('');

  // Filtering positions list
  const positions = ['Barchasi', 'Ofitsiant', 'Bosh oshpaz', 'Povar', 'Menejer', 'Kassir'];

  const filteredEmployees = employees.filter(emp => {
    const matchesPosition = filterPosition === 'Barchasi' || emp.position.toLowerCase() === filterPosition.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.phone.includes(searchQuery) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  // Handle adding employee
  const handleCreateEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) {
      alert("Iltimos, ism va familiyani kiriting.");
      return;
    }

    const initials = newEmpName.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'XM';

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpName.trim(),
      phone: newEmpPhone.trim(),
      position: newEmpPos,
      salary: newEmpSalary,
      startDate: new Date().toLocaleDateString('uz-UZ'),
      notes: newEmpNotes.trim() || '—',
      avatarInitials: initials
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    
    // Reset form fields
    setNewEmpName('');
    setNewEmpPhone('+998 ');
    setNewEmpPos('Ofitsiant');
    setNewEmpSalary(4000000);
    setNewEmpNotes('');

    alert("Yangi xodim muvaffaqiyatli qo'shildi!");
  };

  // Open Edit modal
  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setEditingName(emp.name);
    setEditingPhone(emp.phone);
    setEditingPos(emp.position);
    setEditingSalary(emp.salary);
    setEditingNotes(emp.notes);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) {
      alert("Iltimos, ism va familiyani kiriting.");
      return;
    }
    if (editingEmp) {
      const updated = {
        ...editingEmp,
        name: editingName.trim(),
        phone: editingPhone.trim(),
        position: editingPos,
        salary: editingSalary,
        notes: editingNotes.trim() || '—'
      };
      onUpdateEmployee(updated);
      setShowEditModal(false);
      setEditingEmp(null);
      alert("Xodim ma'lumotlari muvaffaqiyatli tahrirlandi!");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Haqiqatan ham bu xodimni o'chirmoqchimisiz?")) {
      onDeleteEmployee(id);
    }
  };

  const getPositionStyle = (pos: string) => {
    switch (pos.toLowerCase()) {
      case 'bosh oshpaz':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'menejer':
        return 'bg-sky-950/60 text-sky-400 border-sky-800/50';
      case 'kassir':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
      case 'povar':
        return 'bg-amber-950/60 text-amber-450 border-amber-800/50';
      default:
        return 'bg-slate-900/60 text-slate-300 border-slate-700/50';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Dynamic statistics calculations
  const waitersSum = employees.filter(e => e.position === 'Ofitsiant').length;
  const kitchenSum = employees.filter(e => e.position === 'Bosh oshpaz' || e.position === 'Povar' || e.position === 'Oshpaz').length;

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Top action section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Xodimlar</h2>
          <p className="text-[#94a3b8] text-sm mt-0.5">
            Hozirda {employees.length} nafar xodim faoliyat ko'rsatmoqda ({filteredEmployees.length} tasi ro'yxatda)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input 
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 block outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition shadow-lg shadow-sky-500/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Xodim qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Grid displays: quick figures, filters sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Stat block 1 */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-[24px] shadow-xs flex flex-col justify-between h-32">
          <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Jami Ofitsiantlar Soni</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-black text-3xl text-sky-400">{waitersSum}</span>
            {waitersSum > 0 && <span className="text-[10px] text-sky-400 bg-sky-950/55 px-2 py-0.5 font-bold rounded-md">Faol</span>}
          </div>
        </div>

        {/* Stat block 2 */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-[24px] shadow-xs flex flex-col justify-between h-32">
          <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Oshxona jamoasi</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-black text-3xl text-purple-400">{kitchenSum}</span>
            <span className="text-[10px] text-purple-400 bg-purple-950/55 px-2 py-0.5 font-bold rounded-md">Barqaror</span>
          </div>
        </div>

        {/* Quick filter tabs block */}
        <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-[24px] flex flex-col justify-center shadow-xs">
          <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-2.5">Lavozim bo'yicha saralash</p>
          <div className="flex flex-wrap gap-1.5">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setFilterPosition(pos)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  filterPosition === pos 
                    ? 'bg-sky-500 border-sky-450 text-white shadow-md' 
                    : 'bg-slate-900/40 text-slate-400 border-slate-850 hover:bg-slate-900/80 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main staff list table */}
      <section className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-[24px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/60">
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">F.I.O</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Telefon raqami</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Lavozimi</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Oylik maoshi</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Ish boshlagan sana</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Izoh</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs text-sky-400">
                        {emp.avatarInitials}
                      </div>
                      <span className="font-bold text-white text-sm">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{emp.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPositionStyle(emp.position)}`}>
                      {emp.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-350">
                    {formatCurrency(emp.salary)} UZS
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{emp.startDate}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 italic max-w-xs truncate">{emp.notes}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(emp)}
                      className="text-slate-400 hover:text-sky-400 transition mr-3"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="text-slate-400 hover:text-red-400 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#94a3b8]">
                    Hech qanday xodim topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom structured foot Pagination panel */}
        <div className="px-6 py-4 bg-slate-900/20 border-t border-slate-800/60 flex items-center justify-between">
          <p className="text-xs text-[#94a3b8]">Jami {filteredEmployees.length} ta xodim ko'rsatilmoqda</p>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-500 text-white font-extrabold text-xs shadow">
              1
            </button>
          </div>
        </div>
      </section>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <span>Yangi xodim qo'shish</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'liq ism va familiya *</label>
                <input 
                  type="text"
                  required
                  placeholder="Masalan: Sardor Komilov"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami *</label>
                <input 
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={newEmpPhone}
                  onChange={(e) => setNewEmpPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-mono transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lavozimi</label>
                  <select 
                    value={newEmpPos}
                    onChange={(e) => setNewEmpPos(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-medium text-slate-200"
                  >
                    <option value="Ofitsiant">Ofitsiant</option>
                    <option value="Bosh oshpaz">Bosh oshpaz</option>
                    <option value="Povar">Povar</option>
                    <option value="Menejer">Menejer</option>
                    <option value="Kassir">Kassir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Oylik maoshi (UZS)</label>
                  <input 
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-semibold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Izoh / Qo'shimcha eslatmalar</label>
                <textarea 
                  rows={3}
                  placeholder="Malakasi, o'ziga xosligi yoki smenasi..."
                  value={newEmpNotes}
                  onChange={(e) => setNewEmpNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/10"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-base">
                Xodimni tahrirlash: <span className="text-sky-400">{editingEmp.name}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#94a3b8] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'liq ism va familiya *</label>
                <input 
                  type="text"
                  required
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami *</label>
                <input 
                  type="text"
                  required
                  value={editingPhone}
                  onChange={(e) => setEditingPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-mono transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lavozimi</label>
                  <select 
                    value={editingPos}
                    onChange={(e) => setEditingPos(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-medium text-slate-200"
                  >
                    <option value="Ofitsiant">Ofitsiant</option>
                    <option value="Bosh oshpaz">Bosh oshpaz</option>
                    <option value="Povar">Povar</option>
                    <option value="Menejer">Menejer</option>
                    <option value="Kassir">Kassir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Oylik maoshi (UZS)</label>
                  <input 
                    type="number"
                    value={editingSalary}
                    onChange={(e) => setEditingSalary(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] font-semibold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qo'shimcha izoh / Ma'lumot</label>
                <textarea 
                  rows={2}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0ea5e9] transition"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-sky-500/10"
                >
                  Tuzatishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
