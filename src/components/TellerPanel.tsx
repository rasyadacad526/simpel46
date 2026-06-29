import React, { useState, useMemo } from 'react';
import { Student, Teller, Transaction, User } from '../types';
import { formatRupiah, formatDate, formatDateTime, generateId } from '../utils/format';
import { 
  Search, ArrowDownLeft, ArrowUpRight, Banknote, HelpCircle, 
  CheckCircle2, X, Receipt, FileText, Printer, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';

interface TellerPanelProps {
  students: Student[];
  currentTellerUser: User;
  transactions: Transaction[];
  onAddTransaction: (studentId: string, type: 'deposit' | 'withdrawal', amount: number, notes: string, tellerId: string, tellerName: string) => Transaction | null;
  onCancelTransaction: (transactionId: string) => void;
}

export default function TellerPanel({
  students,
  currentTellerUser,
  transactions,
  onAddTransaction,
  onCancelTransaction
}: TellerPanelProps) {
  // Select Student Search
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Transaction Fields
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Quick Amount Shortcuts
  const SHORTCUT_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

  // Search filtered active students
  const searchedStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return [];
    const query = studentSearchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.id.includes(query) ||
      s.class.toLowerCase().includes(query)
    );
  }, [students, studentSearchQuery]);

  // Teller history (Recent logs submitted by this teller)
  const tellerTransactions = useMemo(() => {
    const tellerName = currentTellerUser.name;
    return transactions.filter(tx => tx.tellerName === tellerName);
  }, [transactions, currentTellerUser]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearchQuery(''); // clear query list
  };

  const handleApplyShortcut = (amt: number) => {
    setAmount(amt);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || amount <= 0) return;

    if (selectedStudent.status !== 'active') {
      alert('Siswa berstatus Nonaktif tidak dapat melakukan transaksi.');
      return;
    }

    // Minimum limit
    if (amount < 5000) {
      alert('Batas transaksi minimal adalah Rp 5.000.');
      return;
    }

    // Checking balance for withdrawals
    if (transactionType === 'withdrawal' && selectedStudent.balance < amount) {
      alert(`Saldo tidak mencukupi. Saldo saat ini: ${formatRupiah(selectedStudent.balance)}`);
      return;
    }

    const tellerId = currentTellerUser.tellerId || 'SYSTEM';
    const tellerName = currentTellerUser.name;

    // Process
    const processedTx = onAddTransaction(
      selectedStudent.id,
      transactionType,
      amount,
      notes,
      tellerId,
      tellerName
    );

    if (processedTx) {
      // Set Receipt Info and Open Receipt Modal
      setActiveReceipt(processedTx);
      setShowReceipt(true);

      // Re-fetch / Update the local view for Selected Student balance state
      const updatedStudent = students.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }

      // Reset Fields
      setAmount('');
      setNotes('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER: Input Transaction Workspace */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step 1: Select Student */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">1. Temukan Rekening Siswa</h3>
            <p className="text-xs text-slate-400">Ketik nama lengkap siswa, NISN, atau kelas untuk memulai pencatatan</p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder="Cari siswa (Contoh: Aditya, Siti, 202446...)"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 transition-all"
            />

            {/* Floating Autocomplete Dropdown */}
            {searchedStudents.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-250 shadow-xl overflow-hidden z-20 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {searchedStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full flex justify-between items-center px-4 py-2.5 text-left text-xs hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <p className="text-[10px] text-slate-400">NISN: {student.id} • {student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">{formatRupiah(student.balance)}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${student.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current selected student display card */}
          {selectedStudent ? (
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Nasabah Terpilih
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{selectedStudent.name}</h4>
                <p className="text-xs text-slate-500 font-medium">NISN: {selectedStudent.id} • Kelas: {selectedStudent.class}</p>
                {selectedStudent.status !== 'active' && (
                  <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Rekening terkunci (Status Nonaktif)
                  </div>
                )}
              </div>
              
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saldo Tabungan</p>
                <p className="text-xl font-extrabold text-emerald-600 leading-tight">
                  {formatRupiah(selectedStudent.balance)}
                </p>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-[10px] text-red-500 font-bold hover:underline mt-2 cursor-pointer"
                >
                  Ganti Nasabah
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 font-medium text-xs">
              Silakan cari dan pilih siswa di atas terlebih dahulu untuk memulai transaksi.
            </div>
          )}
        </div>

        {/* Step 2: Input Transaction Fields */}
        {selectedStudent && (
          <form onSubmit={handleTransactionSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Input Data Keuangan</h3>
              <p className="text-xs text-slate-400">Pilih jenis transaksi dan masukkan nominal tabungan</p>
            </div>

            {/* Tab Type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('deposit')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${transactionType === 'deposit' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <ArrowDownLeft className="h-4 w-4" /> Setoran Tunai (Kredit)
              </button>
              
              <button
                type="button"
                onClick={() => setTransactionType('withdrawal')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${transactionType === 'withdrawal' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <ArrowUpRight className="h-4 w-4" /> Tarik Tunai (Debet)
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Transaksi (Rupiah)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-slate-400 text-sm">
                  Rp
                </div>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 50000"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-300"
                />
              </div>
            </div>

            {/* Quick amount shortcuts */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Cepat Nominal</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SHORTCUT_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleApplyShortcut(amt)}
                    className="py-1 px-2 border border-slate-150 hover:bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg transition-all cursor-pointer text-center"
                  >
                    {formatRupiah(amt).replace(',00', '').replace('Rp', '').trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Berita/Keterangan Acara</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tabungan beasiswa, sisa jajan mingguan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Process Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={selectedStudent.status !== 'active'}
                className={`w-full flex justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${selectedStudent.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                Proses & Cetak Struk ({transactionType === 'deposit' ? 'Setor' : 'Tarik'})
              </button>
            </div>
          </form>
        )}
      </div>

      {/* RIGHT SIDEBAR: Teller History Log for today */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Aktivitas Saya Hari Ini</h3>
            <p className="text-[11px] text-slate-400">Daftar transaksi yang Anda catat hari ini</p>
          </div>

          <div className="space-y-3.5 divide-y divide-slate-100">
            {tellerTransactions.length > 0 ? (
              tellerTransactions.map((tx, i) => (
                <div key={tx.id} className={`pt-3.5 first:pt-0 flex flex-col justify-between gap-1`}>
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-slate-800 text-xs truncate">{tx.studentName}</p>
                      <p className="text-[10px] text-slate-400">NISN: {tx.studentId} • {tx.studentClass}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xs ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono font-medium">{tx.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>{formatDateTime(tx.date).replace(' WIB', '')}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setActiveReceipt(tx);
                          setShowReceipt(true);
                        }}
                        className="text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        Struk
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin membatalkan transaksi ${tx.id}? Saldo siswa akan disesuaikan kembali.`)) {
                            onCancelTransaction(tx.id);
                          }
                        }}
                        className="text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada transaksi dicatatkan hari ini.</p>
            )}
          </div>
        </div>

        {/* Teller Profile Info widget */}
        <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Banknote className="h-24 w-24" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900">
            STASIUN TELER RESMI
          </span>
          <h4 className="text-white font-bold text-sm mt-3">{currentTellerUser.name}</h4>
          <p className="text-xs text-slate-400 mt-1">Kode Otoritas: {currentTellerUser.tellerId || 'TLR-01'}</p>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            Gunakan stasiun teler ini untuk membantu siswa mencatat setoran tabungan harian mereka. Selalu konfirmasi uang tunai fisik yang diserahkan sebelum menyimpan data!
          </p>
        </div>
      </div>

      {/* --- STRUK / TRANSACTION RECEIPT MODAL --- */}
      {showReceipt && activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal header */}
            <div className="bg-emerald-600 text-white px-5 py-3.5 flex justify-between items-center">
              <h4 className="text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                <Receipt className="h-4 w-4" /> Bukti Transaksi Sukses
              </h4>
              <button 
                onClick={() => { setShowReceipt(false); setActiveReceipt(null); }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thermal Struk Mockup Container */}
            <div className="p-6 bg-slate-50 font-mono text-xs text-slate-700 leading-normal" id="printable-receipt">
              <div className="text-center border-b border-dashed border-slate-300 pb-4">
                <h2 className="text-sm font-black text-slate-900">BANK MINI SMKN 46</h2>
                <p className="text-[10px] text-slate-500">Jl. Cipinang Muara III, Jakarta Timur</p>
                <p className="text-[10px] text-slate-400">Telepon: (021) 8195127</p>
              </div>

              <div className="py-4 space-y-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>No. Trans:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{formatDateTime(activeReceipt.date).replace(' WIB', '')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Teler:</span>
                  <span className="truncate max-w-[150px]">{activeReceipt.tellerName}</span>
                </div>
              </div>

              <div className="py-4 space-y-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>Nasabah:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>NISN/ID:</span>
                  <span>{activeReceipt.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kelas:</span>
                  <span>{activeReceipt.studentClass}</span>
                </div>
              </div>

              <div className="py-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {activeReceipt.type === 'deposit' ? 'SETORAN TABUNGAN' : 'PENARIKAN TABUNGAN'}
                </p>
                <h3 className="text-xl font-black text-emerald-600 mt-1">
                  {activeReceipt.type === 'deposit' ? '+' : '-'} {formatRupiah(activeReceipt.amount)}
                </h3>
                {activeReceipt.notes && (
                  <p className="text-[10px] text-slate-500 italic mt-2">Keterangan: "{activeReceipt.notes}"</p>
                )}
              </div>

              <div className="pt-4 border-t border-dashed border-slate-300 text-center space-y-1 text-[9px] text-slate-400">
                <p>Simpan tanda terima ini sebagai bukti sah.</p>
                <p className="font-bold">TERIMA KASIH TELAH MENABUNG</p>
                <p>SIMPEL46 - Cerdas Berinvestasi Sejak Dini</p>
              </div>
            </div>

            {/* Receipt Modal footer actions */}
            <div className="bg-slate-50 px-5 py-4 flex gap-2.5 border-t border-slate-200">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 flex justify-center items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Cetak Struk
              </button>
              
              <button
                onClick={() => { setShowReceipt(false); setActiveReceipt(null); }}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
