import React, { useState, useMemo } from 'react';
import { Student, Teller, Transaction, BankStats, User } from '../types';
import { formatRupiah, formatDate, formatDateTime, generateId } from '../utils/format';
import { 
  Users, Landmark, Banknote, ShieldAlert, Plus, Search, Filter, 
  Trash2, ToggleLeft, ToggleRight, Check, X, FileSpreadsheet, FileText,
  UserPlus, UserCheck, RefreshCw, Calendar, TrendingUp, TrendingDown, Edit3, Key
} from 'lucide-react';

interface AdminPanelProps {
  students: Student[];
  tellers: Teller[];
  transactions: Transaction[];
  users: User[];
  onAddStudent: (student: Student, initialDeposit: number, tellerId: string, tellerName: string) => void;
  onEditStudent: (student: Student) => void;
  onAddTeller: (teller: Teller, username?: string, password?: string) => void;
  onToggleTellerStatus: (id: string) => void;
  onToggleStudentStatus: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onResetTellerPassword?: (tellerId: string, newPassword: string) => void;
}

type AdminTab = 'ringkasan' | 'siswa' | 'teler' | 'laporan';

export default function AdminPanel({
  students,
  tellers,
  transactions,
  users,
  onAddStudent,
  onEditStudent,
  onAddTeller,
  onToggleTellerStatus,
  onToggleStudentStatus,
  onDeleteStudent,
  onResetTellerPassword
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('ringkasan');
  
  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Teller States
  const [tellerSearch, setTellerSearch] = useState('');
  
  // Report Filter States
  const [reportSearch, setReportSearch] = useState('');
  const [reportType, setReportType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [reportClass, setReportClass] = useState('');
  const [reportTeller, setReportTeller] = useState('');

  // Form Modals / Adding states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTellerModal, setShowAddTellerModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);

  // Form Fields - New Student
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('X RPL 1');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentInitialDeposit, setNewStudentInitialDeposit] = useState(50000);

  // Form Fields - Edit Student
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields - New Teller
  const [newTellerName, setNewTellerName] = useState('');
  const [newTellerCode, setNewTellerCode] = useState('');
  const [newTellerEmail, setNewTellerEmail] = useState('');
  const [newTellerUsername, setNewTellerUsername] = useState('');
  const [newTellerPassword, setNewTellerPassword] = useState('');

  // Password reset states
  const [resettingTeller, setResettingTeller] = useState<Teller | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Dropdown options for classes
  const CLASS_OPTIONS = [
    'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI RPL 2', 'XII RPL 1', 'XII RPL 2',
    'X AKL 1', 'X AKL 2', 'XI AKL 1', 'XI AKL 2', 'XII AKL 1', 'XII AKL 2',
    'X OTKP 1', 'XI OTKP 1', 'XII OTKP 1',
    'X BDP 1', 'X BDP 2', 'XI BDP 1', 'XII BDP 1'
  ];

  // Calculate stats
  const stats = useMemo<BankStats>(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach(tx => {
      if (tx.type === 'deposit') {
        totalDeposits += tx.amount;
      } else {
        totalWithdrawals += tx.amount;
      }
    });

    const totalSavings = totalDeposits - totalWithdrawals;

    return {
      totalSavings,
      totalTransactionsCount: transactions.length,
      totalStudents: students.length,
      totalTellers: tellers.length,
      totalDeposits,
      totalWithdrawals
    };
  }, [students, tellers, transactions]);

  // Form Submission Handlers
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNisn || !newStudentName || !newStudentClass) return;

    if (students.some(s => s.id === newStudentNisn)) {
      alert('Siswa dengan NISN ini sudah terdaftar.');
      return;
    }

    const newStudent: Student = {
      id: newStudentNisn,
      name: newStudentName,
      class: newStudentClass,
      balance: 0, // Initial deposit handled by transaction routine
      status: 'active',
      phoneNumber: newStudentPhone || undefined,
      email: newStudentEmail || undefined,
      createdAt: new Date().toISOString()
    };

    onAddStudent(newStudent, newStudentInitialDeposit, 'ADMIN-SYS', 'Sistem Admin');
    
    // Reset Form & Close Modal
    setNewStudentNisn('');
    setNewStudentName('');
    setNewStudentClass('X RPL 1');
    setNewStudentPhone('');
    setNewStudentEmail('');
    setNewStudentInitialDeposit(50000);
    setShowAddStudentModal(false);
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onEditStudent(editingStudent);
    setShowEditStudentModal(false);
    setEditingStudent(null);
  };

  const handleAddTellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTellerName || !newTellerCode || !newTellerUsername.trim() || !newTellerPassword.trim()) {
      alert('Semua kolom termasuk username dan kata sandi akun wajib diisi.');
      return;
    }

    if (tellers.some(t => t.code === newTellerCode)) {
      alert('Teler dengan kode ini sudah ada.');
      return;
    }

    // Check username uniqueness
    if (users.some(u => u.username.toLowerCase() === newTellerUsername.trim().toLowerCase())) {
      alert('Username ini sudah terdaftar untuk pengguna lain. Silakan pilih username yang unik.');
      return;
    }

    const newTeller: Teller = {
      id: generateId('TLR'),
      name: newTellerName,
      code: newTellerCode,
      status: 'active',
      email: newTellerEmail || undefined,
      createdAt: new Date().toISOString()
    };

    onAddTeller(newTeller, newTellerUsername.trim(), newTellerPassword.trim());
    setNewTellerName('');
    setNewTellerCode('');
    setNewTellerEmail('');
    setNewTellerUsername('');
    setNewTellerPassword('');
    setShowAddTellerModal(false);
  };

  // Filtered lists
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.id.includes(studentSearch);
      const matchClass = classFilter ? s.class === classFilter : true;
      const matchStatus = statusFilter ? s.status === statusFilter : true;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, studentSearch, classFilter, statusFilter]);

  const filteredTellers = useMemo(() => {
    return tellers.filter(t => {
      return t.name.toLowerCase().includes(tellerSearch.toLowerCase()) || 
             t.code.toLowerCase().includes(tellerSearch.toLowerCase());
    });
  }, [tellers, tellerSearch]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.studentName.toLowerCase().includes(reportSearch.toLowerCase()) || 
                          tx.studentId.includes(reportSearch) ||
                          tx.id.toLowerCase().includes(reportSearch.toLowerCase());
      const matchType = reportType === 'all' ? true : tx.type === reportType;
      const matchClass = reportClass ? tx.studentClass === reportClass : true;
      const matchTeller = reportTeller ? tx.tellerName === reportTeller : true;
      return matchSearch && matchType && matchClass && matchTeller;
    });
  }, [transactions, reportSearch, reportType, reportClass, reportTeller]);

  // Visual chart calculation (for recent days transaction activity)
  const chartPoints = useMemo(() => {
    // Collect transactions grouped by day for last 7 days
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const result = days.map(day => {
      let depSum = 0;
      let witSum = 0;
      transactions.forEach(tx => {
        if (tx.date.startsWith(day)) {
          if (tx.type === 'deposit') depSum += tx.amount;
          else witSum += tx.amount;
        }
      });
      return { day, deposit: depSum, withdrawal: witSum };
    });

    const maxVal = Math.max(...result.map(r => Math.max(r.deposit, r.withdrawal)), 100000);
    return { data: result, maxVal };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${activeTab === 'ringkasan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Ringkasan & Grafik
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${activeTab === 'siswa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Kelola Nasabah (Siswa)
        </button>
        <button
          onClick={() => setActiveTab('teler')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${activeTab === 'teler' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Kelola Petugas (Teler)
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${activeTab === 'laporan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Laporan Transaksi
        </button>
      </div>

      {/* 1. RINGKASAN & GRAFIK */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Tabungan Kas</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1 leading-none">{formatRupiah(stats.totalSavings)}</h3>
                <p className="text-[10px] text-indigo-500 font-semibold mt-2">Net Tabungan Aktif</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Landmark className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Nasabah</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1 leading-none">{stats.totalStudents} Siswa</h3>
                <p className="text-[10px] text-emerald-500 font-semibold mt-2">
                  {students.filter(s => s.status === 'active').length} Status Aktif
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Setoran</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 leading-none">{formatRupiah(stats.totalDeposits)}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-2">Akumulasi Dana Masuk</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Penarikan</p>
                <h3 className="text-2xl font-extrabold text-red-600 mt-1 leading-none">{formatRupiah(stats.totalWithdrawals)}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-2">Akumulasi Dana Keluar</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Graphical Analytics & Quick Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Balance SVG Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Tren Transaksi (7 Hari Terakhir)</h4>
                  <p className="text-xs text-slate-400">Grafik perbandingan setoran harian vs penarikan</p>
                </div>
                <div className="flex gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Setoran
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-400" /> Penarikan
                  </span>
                </div>
              </div>

              {/* Chart Stage */}
              <div className="h-64 flex flex-col justify-between pt-4">
                <div className="flex-1 flex items-end justify-between gap-4 h-48 border-b border-slate-100 pb-2">
                  {chartPoints.data.map((item, idx) => {
                    const depHeight = `${Math.max((item.deposit / chartPoints.maxVal) * 100, 4)}%`;
                    const witHeight = `${Math.max((item.withdrawal / chartPoints.maxVal) * 100, 4)}%`;
                    
                    const dateObj = new Date(item.day);
                    const formattedDay = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div className="w-full flex justify-center gap-1.5 items-end h-full">
                          {/* Deposit Bar */}
                          <div 
                            style={{ height: depHeight }}
                            title={`Setor: ${formatRupiah(item.deposit)}`}
                            className="w-4 sm:w-6 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all cursor-pointer relative group"
                          >
                            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-20">
                              {formatRupiah(item.deposit)}
                            </span>
                          </div>
                          {/* Withdrawal Bar */}
                          <div 
                            style={{ height: witHeight }}
                            title={`Tarik: ${formatRupiah(item.withdrawal)}`}
                            className="w-4 sm:w-6 bg-red-400/80 hover:bg-red-400 rounded-t-md transition-all cursor-pointer relative group"
                          >
                            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-20">
                              {formatRupiah(item.withdrawal)}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-2">{formattedDay}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Informational / Action Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4">Informasi Operasional</h4>
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <h5 className="font-bold text-indigo-800 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Aturan Kas Mini Bank
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Petugas teler hanya dapat memproses transaksi nasabah aktif. Likuiditas dijamin oleh guru pengawas SMKN 46.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-400 font-semibold">TIPS CEPAT DEMO:</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                      <li>Gunakan akun <strong>"sri.teler"</strong> atau <strong>"eko.teler"</strong> untuk mencoba simulasi pencatatan setor tunai.</li>
                      <li>Data tersimpan di browser Anda menggunakan <strong>localStorage</strong> secara otomatis.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between text-xs font-semibold text-slate-400">
                <span>Versi Sistem</span>
                <span className="text-emerald-600">v1.2 (Prod-Build)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KELOLA NASABAH (SISWA) */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar Nasabah Siswa SMKN 46</h3>
              <p className="text-xs text-slate-400">Manajemen pendaftaran siswa dan modifikasi data</p>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
            >
              <UserPlus className="h-4 w-4" /> Daftar Nasabah Baru
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Kelas</option>
                {CLASS_OPTIONS.map(cl => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Students List Table */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">NISN (ID)</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((stud) => (
                      <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">{stud.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{stud.name}</td>
                        <td className="py-3 px-4 text-slate-600">{stud.class}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-800">{formatRupiah(stud.balance)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${stud.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {stud.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Toggle Status */}
                            <button
                              onClick={() => onToggleStudentStatus(stud.id)}
                              title={stud.status === 'active' ? "Nonaktifkan Nasabah" : "Aktifkan Nasabah"}
                              className={`p-1 rounded-lg border transition-all cursor-pointer ${stud.status === 'active' ? 'border-red-100 text-red-600 bg-red-50 hover:bg-red-100' : 'border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                            >
                              {stud.status === 'active' ? 'Nonaktif' : 'Aktifkan'}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingStudent(stud);
                                setShowEditStudentModal(true);
                              }}
                              title="Edit Nasabah"
                              className="p-1 rounded-lg border border-slate-150 text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus nasabah ${stud.name}? Seluruh histori data akan hilang.`)) {
                                  onDeleteStudent(stud.id);
                                }
                              }}
                              title="Hapus Nasabah"
                              className="p-1 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada data nasabah yang sesuai filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. KELOLA PETUGAS (TELER) */}
      {activeTab === 'teler' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar Petugas Teler Mini Bank</h3>
              <p className="text-xs text-slate-400">Petugas resmi yang diperbolehkan menginput transaksi tabungan</p>
            </div>
            <button
              onClick={() => setShowAddTellerModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
            >
              <UserPlus className="h-4 w-4" /> Tambah Petugas Teler
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-w-sm">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={tellerSearch}
                onChange={(e) => setTellerSearch(e.target.value)}
                placeholder="Cari nama atau kode teler..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Teller List Table */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Teler</th>
                  <th className="py-3 px-4">Nama Petugas</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Tanggal Bergabung</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTellers.length > 0 ? (
                  filteredTellers.map((tel) => (
                    <tr key={tel.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{tel.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tel.name}</td>
                      <td className="py-3 px-4 text-slate-500">{tel.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(tel.createdAt)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${tel.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {tel.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onToggleTellerStatus(tel.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${tel.status === 'active' ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'}`}
                          >
                            {tel.status === 'active' ? 'Blokir' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => {
                              setResettingTeller(tel);
                              setNewPasswordValue('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                            title="Reset Kata Sandi Teler"
                          >
                            <Key className="h-3.5 w-3.5" /> Reset Sandi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada petugas teler ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LAPORAN TRANSAKSI */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Laporan Keuangan Bank Mini</h3>
              <p className="text-xs text-slate-400">Histori perputaran kas masuk (setoran) dan keluar (penarikan)</p>
            </div>
            {/* Simulation export buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4" /> Print PDF
              </button>
              <button
                onClick={() => {
                  alert('Laporan berhasil diekspor ke format Excel Spreadsheet (Simulasi)!');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" /> Ekspor Excel
              </button>
            </div>
          </div>

          {/* Filtering Engine */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Nama / NISN / ID..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none"
              >
                <option value="all">Semua Tipe Kas</option>
                <option value="deposit">Setoran (Masuk)</option>
                <option value="withdrawal">Penarikan (Keluar)</option>
              </select>
            </div>

            <div>
              <select
                value={reportClass}
                onChange={(e) => setReportClass(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none"
              >
                <option value="">Semua Kelas</option>
                {CLASS_OPTIONS.map(cl => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={reportTeller}
                onChange={(e) => setReportTeller(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none"
              >
                <option value="">Semua Petugas Teler</option>
                {tellers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID Transaksi</th>
                    <th className="py-3 px-4">Waktu Input</th>
                    <th className="py-3 px-4">Nasabah (Kelas)</th>
                    <th className="py-3 px-4">Petugas</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">{tx.id}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDateTime(tx.date)}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{tx.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{tx.studentId} • {tx.studentClass}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{tx.tellerName}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={tx.notes}>{tx.notes || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {tx.type === 'deposit' ? '+' : '-'} {formatRupiah(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada histori transaksi ditemukan berdasarkan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}
      
      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <UserPlus className="h-4.5 w-4.5" /> Pendaftaran Siswa Baru
              </h4>
              <button onClick={() => setShowAddStudentModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN (ID Nasabah)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 202446008"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas Siswa</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASS_OPTIONS.map(cl => (
                      <option key={cl} value={cl}>{cl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Aditya Wijaya"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP (Opsional)</label>
                  <input
                    type="text"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="08123xxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="siswa@smkn46.sch.id"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block font-bold text-slate-700 mb-1">Setoran Awal (Buku Tabungan)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-slate-400">
                    Rp
                  </div>
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    required
                    value={newStudentInitialDeposit}
                    onChange={(e) => setNewStudentInitialDeposit(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">* Minimum Rp 10.000 untuk pendaftaran baru.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Daftarkan Nasabah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Edit3 className="h-4.5 w-4.5" /> Edit Data Nasabah
              </h4>
              <button onClick={() => { setShowEditStudentModal(false); setEditingStudent(null); }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditStudentSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN (Tidak dapat diubah)</label>
                  <input
                    type="text"
                    disabled
                    value={editingStudent.id}
                    className="w-full px-3 py-2 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas Siswa</label>
                  <select
                    value={editingStudent.class}
                    onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASS_OPTIONS.map(cl => (
                      <option key={cl} value={cl}>{cl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  placeholder="Contoh: Aditya Wijaya"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP</label>
                  <input
                    type="text"
                    value={editingStudent.phoneNumber || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                    placeholder="08123xxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    placeholder="siswa@smkn46.sch.id"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditStudentModal(false); setEditingStudent(null); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TELLER MODAL */}
      {showAddTellerModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <UserPlus className="h-4.5 w-4.5" /> Tambah Petugas Teler Baru
              </h4>
              <button onClick={() => setShowAddTellerModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTellerSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Teler Unik</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TLR4603"
                  value={newTellerCode}
                  onChange={(e) => setNewTellerCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Petugas Teler</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bu Aminah Safitri"
                  value={newTellerName}
                  onChange={(e) => setNewTellerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Petugas</label>
                <input
                  type="email"
                  placeholder="aminah@smkn46.sch.id"
                  value={newTellerEmail}
                  onChange={(e) => setNewTellerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Akun Teler</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: aminah.teler"
                  value={newTellerUsername}
                  onChange={(e) => setNewTellerUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Akun</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi teler"
                  value={newTellerPassword}
                  onChange={(e) => setNewTellerPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTellerModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Daftarkan Teler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingTeller && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <RefreshCw className="h-4.5 w-4.5" /> Reset Sandi Teler
              </h4>
              <button onClick={() => setResettingTeller(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPasswordValue.trim()) return;
              if (onResetTellerPassword) {
                onResetTellerPassword(resettingTeller.id, newPasswordValue.trim());
              }
              alert(`Kata sandi untuk petugas teler ${resettingTeller.name} berhasil diubah secara manual.`);
              setResettingTeller(null);
              setNewPasswordValue('');
            }} className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-slate-500 mb-1 font-medium">Reset sandi untuk petugas:</p>
                <p className="font-bold text-slate-800 text-sm mb-4">{resettingTeller.name} ({resettingTeller.code})</p>
                
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setResettingTeller(null); setNewPasswordValue(''); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
