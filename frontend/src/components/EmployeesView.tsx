import { useState, FormEvent, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  UserPlus, 
  Briefcase, 
  X,
  TrendingUp,
  Trash2,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Clock,
  Check,
  Phone,
  FileText
} from 'lucide-react';
import { Employee } from '../types';
import { fetchEmployeeProfile, createEmployeeFine, createEmployeeAdvance, createAttendance, updateAttendance } from '../api';

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

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTarget, setProfileTarget] = useState<Employee | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<'kalendar' | 'tarix'>('kalendar');

  // Fine/Advance form states
  const [fineAmount, setFineAmount] = useState(0);
  const [fineReason, setFineReason] = useState('');
  const [fineDate, setFineDate] = useState(new Date().toISOString().split('T')[0]);

  const [advAmount, setAdvAmount] = useState(0);
  const [advNote, setAdvNote] = useState('');
  const [advDate, setAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [advType, setAdvType] = useState<'avans' | 'maosh'>('avans');

  // Daily Details states
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayTimeIn, setDayTimeIn] = useState('');
  const [dayTimeOut, setDayTimeOut] = useState('');

  // Calendar states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtering positions list
  const positions = ['Barchasi', 'Ofitsiant', 'Bosh oshpaz', 'Povar', 'Menejer', 'Kassir'];

  const filteredEmployees = employees.filter(emp => {
    const matchesPosition = filterPosition === 'Barchasi' || emp.position.toLowerCase() === filterPosition.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.phone.includes(searchQuery) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  const loadProfile = async (empId: string) => {
    try {
      const data = await fetchEmployeeProfile(empId);
      setProfileData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profileTarget) {
      loadProfile(profileTarget.id);
    }
  }, [profileTarget]);

  useEffect(() => {
    if (!profileData || !selectedDateStr) return;
    const att = profileData.attendances?.find((a: any) => a.date === selectedDateStr);
    if (att) {
      setDayTimeIn(att.time_in ? att.time_in.substring(0, 5) : '');
      setDayTimeOut(att.time_out ? att.time_out.substring(0, 5) : '');
    } else {
      setDayTimeIn('');
      setDayTimeOut('');
    }
  }, [selectedDateStr, profileData]);

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
      startDate: new Date().toISOString().split('T')[0],
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

    showToast("Yangi xodim qo'shildi!");
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
      showToast("Xodim ma'lumotlari tahrirlandi!");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Haqiqatan ham bu xodimni o'chirmoqchimisiz?")) {
      onDeleteEmployee(id);
    }
  };

  const handleAddFine = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileTarget || fineAmount <= 0) return;
    try {
      await createEmployeeFine({
        employee: profileTarget.id,
        amount: fineAmount,
        reason: fineReason,
        date: fineDate
      });
      showToast("Jarima muvaffaqiyatli qo'shildi!");
      setFineAmount(0); setFineReason('');
      loadProfile(profileTarget.id);
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleAddAdvance = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileTarget || advAmount <= 0) return;
    try {
      await createEmployeeAdvance({
        employee: profileTarget.id,
        amount: advAmount,
        date: advDate,
        note: advNote,
        advance_type: advType
      });
      showToast("To'lov muvaffaqiyatli saqlandi!");
      setAdvAmount(0); setAdvNote('');
      loadProfile(profileTarget.id);
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleSaveAttendance = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileTarget || !selectedDateStr) return;
    try {
      const existingAtt = profileData.attendances?.find((a: any) => a.date === selectedDateStr);
      const attPayload = {
        employee: profileTarget.id,
        date: selectedDateStr,
        time_in: dayTimeIn ? `${dayTimeIn}:00` : null,
        time_out: dayTimeOut ? `${dayTimeOut}:00` : null
      };

      if (existingAtt) {
        await updateAttendance(existingAtt.id, attPayload);
      } else {
        await createAttendance(attPayload);
      }
      showToast("Davomat vaqti muvaffaqiyatli saqlandi!");
      loadProfile(profileTarget.id);
    } catch (err) {
      alert("Davomatni saqlashda xatolik!");
    }
  };

  const getPositionStyle = (pos: string) => {
    switch (pos.toLowerCase()) {
      case 'bosh oshpaz':
        return 'badge-emerald';
      case 'menejer':
        return 'badge-sky';
      case 'kassir':
        return 'badge-blue';
      case 'povar':
        return 'badge-amber';
      default:
        return 'badge-slate';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0
  })();

  const monthsList = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getUnifiedHistory = () => {
    if (!profileData) return [];
    const history: any[] = [];
    profileData.advances.forEach((adv: any) => {
      history.push({
        id: `adv-${adv.id}`,
        date: adv.date,
        type: adv.advance_type === 'maosh' ? "Maosh to'lovi" : 'Avans',
        amount: parseFloat(adv.amount),
        note: adv.note || (adv.advance_type === 'maosh' ? "Maosh to'lovi" : "Avans to'lovi"),
        color: 'text-sky-400'
      });
    });
    profileData.fines.forEach((fine: any) => {
      history.push({
        id: `fine-${fine.id}`,
        date: fine.date,
        type: 'Jarima',
        amount: -parseFloat(fine.amount),
        note: fine.reason,
        color: 'text-rose-400'
      });
    });
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Render Calendar Days
  const renderCalendarDays = () => {
    const cells = [];
    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-14 bg-slate-900/10 border border-slate-800/30" />);
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Check status
      const dayAttendances = profileData?.attendances?.filter((a: any) => a.date === dateStr) || [];
      const dayFines = profileData?.fines?.filter((f: any) => f.date === dateStr) || [];
      const dayAdvances = profileData?.advances?.filter((ad: any) => ad.date === dateStr) || [];

      const hasAttended = dayAttendances.length > 0;
      const hasFine = dayFines.length > 0;
      const hasAvans = dayAdvances.some((ad: any) => ad.advance_type === 'avans' || !ad.advance_type);
      const hasMaosh = dayAdvances.some((ad: any) => ad.advance_type === 'maosh');
      const isSelected = selectedDateStr === dateStr;

      cells.push(
        <div 
          key={`day-${day}`} 
          onClick={() => setSelectedDateStr(dateStr)}
          className={`h-14 p-1.5 border flex flex-col justify-between relative group hover:bg-slate-850 cursor-pointer transition ${
            isSelected 
              ? 'bg-sky-500/20 border-sky-500/80 shadow-md shadow-sky-500/10' 
              : 'bg-slate-900/40 border-slate-800/40'
          }`}
        >
          <span className={`text-[10px] font-bold ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>{day}</span>
          <div className="flex gap-1 justify-center mt-1 flex-wrap">
            {hasAttended && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Kelgan" />}
            {hasAvans && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" title="Avans" />}
            {hasMaosh && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" title="Maosh" />}
            {hasFine && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" title="Jarima" />}
          </div>
        </div>
      );
    }
    return cells;
  };

  // Dynamic statistics calculations
  const waitersSum = employees.filter(e => e.position === 'Ofitsiant').length;
  const kitchenSum = employees.filter(e => e.position === 'Bosh oshpaz' || e.position === 'Povar' || e.position === 'Oshpaz').length;

  return (
    <div className="space-y-8 animate-fade-in relative text-slate-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top action section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-400" />
            Xodimlar
          </h2>
          <p className="text-[#94a3b8] text-xs mt-1">
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
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs text-slate-200 block outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
            {waitersSum > 0 && <span className="text-[10px] px-2 py-0.5 font-bold rounded-md badge-sky border">Faol</span>}
          </div>
        </div>

        {/* Stat block 2 */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md p-5 rounded-[24px] shadow-xs flex flex-col justify-between h-32">
          <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Oshxona jamoasi</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-black text-3xl text-purple-400">{kitchenSum}</span>
            <span className="text-[10px] px-2 py-0.5 font-bold rounded-md badge-purple border">Barqaror</span>
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
              <tr className="bg-slate-900/40 border-b border-slate-800/60 text-slate-400">
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold">F.I.O</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold">Telefon raqami</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold">Lavozimi</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-right">Oylik maoshi</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-right">Shu oy olgan</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-right">Qoldiq</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold">Ish boshlagan sana</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-right">Amallar</th>
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
                  <td className="px-6 py-4 text-xs font-semibold text-slate-300 text-right font-mono">
                    {formatCurrency(emp.salary)} UZS
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-300 text-right font-mono">
                    {formatCurrency(emp.totalAdvances || 0)} UZS
                  </td>
                  <td className={`px-6 py-4 text-xs font-extrabold text-right font-mono ${
                    (emp.remainingSalary || 0) > 0 ? 'text-emerald-450' : 'text-slate-400'
                  }`}>
                    {formatCurrency(emp.remainingSalary !== undefined ? emp.remainingSalary : emp.salary)} UZS
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{emp.startDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setProfileTarget(emp);
                        setProfileTab('davomat');
                        setShowProfileModal(true);
                      }}
                      className="px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition text-[10px] font-extrabold rounded-lg mr-3"
                    >
                      Profil
                    </button>
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
      </section>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <span>Yangi xodim qo'shish</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'liq ism va familiya *</label>
                <input type="text" required placeholder="Masalan: Sardor Komilov" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami *</label>
                <input type="text" required placeholder="+998 90 123 45 67" value={newEmpPhone} onChange={(e) => setNewEmpPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lavozimi</label>
                  <select value={newEmpPos} onChange={(e) => setNewEmpPos(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 text-white">
                    <option value="Ofitsiant">Ofitsiant</option>
                    <option value="Bosh oshpaz">Bosh oshpaz</option>
                    <option value="Povar">Povar</option>
                    <option value="Menejer">Menejer</option>
                    <option value="Kassir">Kassir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Oylik maoshi (UZS)</label>
                  <input type="number" value={newEmpSalary} onChange={(e) => setNewEmpSalary(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 font-semibold transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Izoh / Qo'shimcha eslatmalar</label>
                <textarea rows={3} placeholder="Malakasi, o'ziga xosligi yoki smenasi..." value={newEmpNotes} onChange={(e) => setNewEmpNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition">Bekor qilish</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-sky-500/10">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-base">Xodimni tahrirlash: <span className="text-sky-400">{editingEmp.name}</span></h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#94a3b8] hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To'liq ism va familiya *</label>
                <input type="text" required value={editingName} onChange={(e) => setEditingName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefon raqami *</label>
                <input type="text" required value={editingPhone} onChange={(e) => setEditingPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lavozimi</label>
                  <select value={editingPos} onChange={(e) => setEditingPos(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 text-white">
                    <option value="Ofitsiant">Ofitsiant</option>
                    <option value="Bosh oshpaz">Bosh oshpaz</option>
                    <option value="Povar">Povar</option>
                    <option value="Menejer">Menejer</option>
                    <option value="Kassir">Kassir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Oylik maoshi (UZS)</label>
                  <input type="number" value={editingSalary} onChange={(e) => setEditingSalary(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 font-semibold transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qo'shimcha izoh / Ma'lumot</label>
                <textarea rows={2} value={editingNotes} onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-slate-700 text-[#94a3b8] hover:text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition">Bekor qilish</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-sky-500/10">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === DETAILED PROFILE MODAL === */}
      {showProfileModal && profileTarget && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-4xl w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center font-bold text-sky-400 text-base">
                  {profileTarget.avatarInitials}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{profileTarget.name}</h3>
                  <p className="text-xs text-sky-400 mt-1 font-semibold">{profileTarget.position} • {profileTarget.phone}</p>
                </div>
              </div>
              <button onClick={() => { setShowProfileModal(false); setProfileTarget(null); setProfileData(null); }} className="text-slate-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile KPI summary */}
            {profileData && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-450 uppercase text-[9px] font-bold block mb-1">Oylik maosh</span>
                  <span className="font-bold text-white text-sm font-mono">{formatCurrency(profileData.summary.salary)} UZS</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-450 uppercase text-[9px] font-bold block mb-1">Shu oy olgan</span>
                  <span className="font-bold text-sky-400 text-sm font-mono">{formatCurrency(profileData.summary.total_advances)} UZS</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-450 uppercase text-[9px] font-bold block mb-1">Jarima</span>
                  <span className="font-bold text-rose-400 text-sm font-mono">{formatCurrency(profileData.summary.total_fines)} UZS</span>
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                  <span className="text-slate-450 uppercase text-[9px] font-bold block mb-1">Qoldiq</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono">{formatCurrency(profileData.summary.remaining_salary)} UZS</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 col-span-2 md:col-span-1">
                  <span className="text-slate-450 uppercase text-[9px] font-bold block mb-1">Oxirgi to'lov</span>
                  <span className="font-bold text-white text-xs block leading-tight">
                    {profileData.advances && profileData.advances.length > 0 
                      ? `${new Date(profileData.advances[0].date).toLocaleDateString('uz-UZ')} - ${formatCurrency(profileData.advances[0].amount)} UZS` 
                      : 'Yo\'q'}
                  </span>
                </div>
              </div>
            )}

            {/* Tabs Trigger */}
            <div className="flex gap-4 border-b border-slate-850 pb-2 mb-6">
              {[
                { id: 'davomat', label: 'Davomat' },
                { id: 'jarimalar', label: 'Jarimalar' },
                { id: 'avanslar', label: 'Avanslar' },
                { id: 'kalendar', label: 'Kalendar' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setProfileTab(t.id as any)}
                  className={`text-xs font-bold pb-1 transition ${profileTab === t.id ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {profileData ? (
              <div className="space-y-4">
                
                {/* 1. Davomat Tab */}
                {profileTab === 'davomat' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-350">Davomat tarixi</h4>
                      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-805">
                              <th className="py-3 px-4">Sana</th>
                              <th className="py-3 px-4">Kelgan vaqti</th>
                              <th className="py-3 px-4">Ketgan vaqti</th>
                              <th className="py-3 px-4">Holat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.attendances.map((att: any) => (
                              <tr key={att.id} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition">
                                <td className="py-2.5 px-4 font-bold">{att.date}</td>
                                <td className="py-2.5 px-4 font-mono">{att.time_in ? att.time_in.substring(0,5) : '—'}</td>
                                <td className="py-2.5 px-4 font-mono">{att.time_out ? att.time_out.substring(0,5) : '—'}</td>
                                <td className="py-2.5 px-4">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold">Keldi</span>
                                </td>
                              </tr>
                            ))}
                            {profileData.attendances.length === 0 && (
                              <tr><td colSpan={4} className="py-6 text-center text-slate-500">Davomat ma'lumotlari mavjud emas</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Add Attendance Form */}
                    <form onSubmit={handleSaveAttendance} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3 h-fit">
                      <h4 className="text-xs font-bold text-emerald-400">Davomat kiritish</h4>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Sana *</label>
                        <input type="date" required value={selectedDateStr || ''} onChange={(e) => setSelectedDateStr(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-emerald-500/25 text-white font-mono" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Kelgan vaqti</label>
                          <input type="time" value={dayTimeIn || ''} onChange={(e) => setDayTimeIn(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-emerald-500/25 text-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Ketgan vaqti</label>
                          <input type="time" value={dayTimeOut || ''} onChange={(e) => setDayTimeOut(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-emerald-500/25 text-white font-mono" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-455 text-white text-xs font-bold rounded transition">
                        Davomatni saqlash
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. Jarimalar Tab */}
                {profileTab === 'jarimalar' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-350">Jarima tarixi</h4>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {profileData.fines.map((fine: any) => (
                          <div key={fine.id} className="bg-slate-900/40 p-3.5 border border-slate-805 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-white leading-snug">{fine.reason}</p>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{fine.date}</span>
                            </div>
                            <span className="font-bold text-rose-400 font-mono">-{formatCurrency(fine.amount)} UZS</span>
                          </div>
                        ))}
                        {profileData.fines.length === 0 && (
                          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">Jarima mavjud emas</div>
                        )}
                      </div>
                    </div>

                    {/* Add Fine Form */}
                    <form onSubmit={handleAddFine} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3 h-fit">
                      <h4 className="text-xs font-bold text-sky-400">Jarima yozish</h4>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Summa (UZS) *</label>
                        <input type="number" required value={fineAmount || ''} onChange={(e) => setFineAmount(parseInt(e.target.value) || 0)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Sabab *</label>
                        <input type="text" required placeholder="Masalan: Kechikish 30 daqiqa" value={fineReason} onChange={(e) => setFineReason(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Sana *</label>
                        <input type="date" required value={fineDate} onChange={(e) => setFineDate(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white font-mono" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-rose-500 hover:bg-rose-455 text-white text-xs font-bold rounded transition">Jarima yozish</button>
                    </form>
                  </div>
                )}

                {/* 3. Avanslar Tab */}
                {profileTab === 'avanslar' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-350">Avans tarixi</h4>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {profileData.advances.map((adv: any) => (
                          <div key={adv.id} className="bg-slate-900/40 p-3.5 border border-slate-805 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-white leading-snug">{adv.note || "Avans to'lovi"}</p>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{adv.date}</span>
                            </div>
                            <span className="font-bold text-sky-400 font-mono">{formatCurrency(adv.amount)} UZS</span>
                          </div>
                        ))}
                        {profileData.advances.length === 0 && (
                          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">Avans to'lovlari mavjud emas</div>
                        )}
                      </div>
                    </div>

                    {/* Add Advance Form */}
                    <form onSubmit={handleAddAdvance} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3 h-fit">
                      <h4 className="text-xs font-bold text-sky-400">Avans berish</h4>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Summa (UZS) *</label>
                        <input type="number" required value={advAmount || ''} onChange={(e) => setAdvAmount(parseInt(e.target.value) || 0)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Izoh</label>
                        <input type="text" placeholder="Ixtiyoriy" value={advNote} onChange={(e) => setAdvNote(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Sana *</label>
                        <input type="date" required value={advDate} onChange={(e) => setAdvDate(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none focus:ring-2 focus:ring-sky-500/25 text-white font-mono" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-sky-500 hover:bg-sky-455 text-white text-xs font-bold rounded transition">Avans berish</button>
                    </form>
                  </div>
                )}

                {/* 4. Kalendar Tab */}
                {profileTab === 'kalendar' && (
                  <div className="space-y-4">
                    {/* Header Month Switcher */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 max-w-sm mx-auto">
                      <button onClick={handlePrevMonth} className="p-1 text-slate-400 hover:text-white transition"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="font-bold text-xs text-white">{monthsList[currentMonth]} {currentYear}</span>
                      <button onClick={handleNextMonth} className="p-1 text-slate-400 hover:text-white transition"><ChevronRight className="w-4 h-4" /></button>
                    </div>

                    {/* Week headers */}
                    <div className="grid grid-cols-7 gap-1 border-b border-slate-850 pb-2 text-center text-[10px] font-black uppercase text-slate-450 tracking-wider">
                      <div>Dush</div><div>Sesh</div><div>Chor</div><div>Pay</div><div>Jum</div><div>Shan</div><div>Yak</div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 justify-center text-[9px] uppercase tracking-wider font-extrabold text-slate-400 pt-2 mb-4">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 block" /> <span>Kelgan</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 block" /> <span>Avans</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 block" /> <span>Maosh</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 block" /> <span>Jarima</span></div>
                    </div>

                    {/* Selected Day Details Panel */}
                    {selectedDateStr && (
                      <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-sky-400 mb-3 border-b border-slate-800 pb-2">
                          {selectedDateStr.split('-').reverse().join('.')}
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Attendances */}
                          {profileData?.attendances?.filter((a: any) => a.date === selectedDateStr).map((a: any, idx: number) => (
                            <div key={`att-${idx}`} className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20">
                              <span className="text-xs font-bold text-emerald-400">Davomat</span>
                              <div className="text-right">
                                <span className="text-xs text-slate-300 block">Kelgan: <strong className="text-white">{a.time_in ? a.time_in.substring(0,5) : '-'}</strong></span>
                                <span className="text-xs text-slate-300 block">Ketgan: <strong className="text-white">{a.time_out ? a.time_out.substring(0,5) : '-'}</strong></span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Advances */}
                          {profileData?.advances?.filter((ad: any) => ad.date === selectedDateStr).map((ad: any, idx: number) => (
                            <div key={`adv-${idx}`} className={`flex justify-between items-center p-2.5 rounded border ${
                              ad.advance_type === 'maosh' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-400/10 border-amber-400/20'
                            }`}>
                              <div>
                                <span className={`text-xs font-bold block ${ad.advance_type === 'maosh' ? 'text-blue-400' : 'text-amber-400'}`}>
                                  {ad.advance_type === 'maosh' ? 'Maosh' : 'Avans'}
                                </span>
                                {ad.note && <span className="text-[10px] text-slate-400 block">{ad.note}</span>}
                              </div>
                              <span className={`text-xs font-mono font-bold ${ad.advance_type === 'maosh' ? 'text-blue-300' : 'text-amber-300'}`}>
                                +{formatCurrency(ad.amount)} UZS
                              </span>
                            </div>
                          ))}

                          {/* Fines */}
                          {profileData?.fines?.filter((f: any) => f.date === selectedDateStr).map((f: any, idx: number) => (
                            <div key={`fine-${idx}`} className="flex justify-between items-center bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                              <div>
                                <span className="text-xs font-bold text-rose-400 block">Jarima</span>
                                <span className="text-[10px] text-slate-400 block">{f.reason}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-rose-300">
                                -{formatCurrency(f.amount)} UZS
                              </span>
                            </div>
                          ))}

                          {/* Empty State */}
                          {(!profileData?.attendances?.some((a: any) => a.date === selectedDateStr) &&
                            !profileData?.advances?.some((ad: any) => ad.date === selectedDateStr) &&
                            !profileData?.fines?.some((f: any) => f.date === selectedDateStr)) && (
                            <div className="text-center py-4 text-xs text-slate-500">
                              Bu sanada hodisalar yo'q
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Clock className="w-10 h-10 mx-auto mb-2 animate-spin text-sky-400" />
                <p className="text-xs">Ma'lumotlar yuklanmoqda...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
