import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Landmark, LogOut, Shield, Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'teller': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'student': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teller': return 'Teler Tabungan';
      case 'student': return 'Siswa (Nasabah)';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner with branding */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  SIMPEL 46
                </h1>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Bank Mini SMKN 46 Jakarta
                </p>
              </div>
            </div>

            {/* Right side user info */}
            <div className="flex items-center gap-3">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-2.5 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                  <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 border rounded-full mt-1 ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                  <img src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={user.name} className="h-full w-full object-cover" />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Keluar Akun"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Mobile Menu Icon */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 md:hidden text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-slate-50 px-4 py-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 border rounded-full mt-1 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 py-1.5 px-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-150 py-5 text-center text-xs text-slate-400 font-medium mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Bank Mini SMKN 46 Jakarta - SIMPEL46. Semua Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Sistem Terkunci SSL</span>
            <span>•</span>
            <span>Program Kerja Ekstensi Akuntansi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
