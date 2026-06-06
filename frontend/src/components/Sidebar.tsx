import { 
  LayoutDashboard, 
  Users, 
  Package, 
  DollarSign, 
  CalendarDays, 
  UserMinus, 
  FileSpreadsheet, 
  Wallet, 
  BarChart3, 
  Settings as SettingsIcon,
  Store,
  Grid,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  employeeCount: number;
  notificationsCount: number;
  onNotificationClick: () => void;
  userName: string;
}

export default function Sidebar({ activeTab, onTabChange, employeeCount, notificationsCount, onNotificationClick, userName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', name: 'Xodimlar', icon: Users, badge: employeeCount },
    { id: 'tables', name: 'Stollar', icon: Grid },
    { id: 'warehouse', name: 'Omborxona', icon: Package },
    { id: 'sales', name: 'Sotuvlar', icon: DollarSign },
    { id: 'reservations', name: 'Bronlar', icon: CalendarDays },
    { id: 'debtors', name: 'Qarzdorlar', icon: UserMinus },
    { id: 'expenses', name: 'Xarajatlar', icon: FileSpreadsheet },
    { id: 'finance', name: 'Moliya', icon: Wallet },
    { id: 'statistics', name: 'Statistika', icon: BarChart3 },
    { id: 'settings', name: 'Sozlamalar', icon: SettingsIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1e293b] text-[#f1f5f9] flex flex-col border-r border-slate-800 z-50">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/10">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-tight flex items-center gap-1.5">
            Verdant RMS
          </h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">
            Bento Tizim
          </p>
        </div>
        <div className="ml-auto relative">
          <button onClick={onNotificationClick} className="p-2 hover:bg-slate-800 rounded-xl transition-colors relative group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#1e293b]"></span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700/40'
                  : 'text-[#94a3b8] hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors duration-200 ${
                  isActive ? 'text-sky-400' : 'text-[#94a3b8] group-hover:text-sky-400'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-sky-950/50 text-sky-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
          <div className="relative">
            <img
              className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp3_gIuQSkrw7EoXz4B8pLiu9pHrW3h2Tn7bvIGq50jqHPan5O9fw-lKOzVPl4aAfMO3M7sogySF-KB6mMcWZjDBD9WweWw72cua3m0MzPgGsxdFhe8aD1bmaAljj_woZiH1ds508jn_sIss62KNiuXWZYBDQXVIbigId2zEIjQORXEvGDQWkgAtk9O2Wh97dXvgn1z3xzEEmgw9ndZAEZGIVgYmvmlW_1lUoIGV1jZFBLXV5IXk-6SXI4KBLjlvmJypvzKFI3NO0"
              alt="Manager Profile"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sky-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
