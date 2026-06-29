import React, { useState, useMemo } from 'react';
import { Student, Transaction, SavingGoal } from '../types';
import { formatRupiah, formatDate, formatDateTime, generateId } from '../utils/format';
import { 
  Wallet, BookOpen, Award, GraduationCap, Laptop, HelpCircle, Star,
  Plus, Calendar, Trash2, CheckCircle, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, X
} from 'lucide-react';

interface StudentPanelProps {
  currentStudent: Student;
  transactions: Transaction[];
  goals: SavingGoal[];
  onAddGoal: (goal: SavingGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export default function StudentPanel({
  currentStudent,
  transactions,
  goals,
  onAddGoal,
  onDeleteGoal
}: StudentPanelProps) {
  // Goals State
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState<number | ''>('');
  const [goalCategory, setGoalCategory] = useState<'pendidikan' | 'wisuda' | 'buku' | 'laptop' | 'lainnya'>('pendidikan');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Personal transactions filtered
  const myTransactions = useMemo(() => {
    return transactions.filter(tx => tx.studentId === currentStudent.id);
  }, [transactions, currentStudent]);

  // Personal saving goals filtered
  const myGoals = useMemo(() => {
    return goals.filter(g => g.studentId === currentStudent.id);
  }, [goals, currentStudent]);

  // Total deposits & withdrawals for stats
  const summaryStats = useMemo(() => {
    let depositSum = 0;
    let withdrawalSum = 0;

    myTransactions.forEach(tx => {
      if (tx.type === 'deposit') {
        depositSum += tx.amount;
      } else {
        withdrawalSum += tx.amount;
      }
    });

    return {
      depositSum,
      withdrawalSum
    };
  }, [myTransactions]);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetAmount || goalTargetAmount <= 0) return;

    const newGoal: SavingGoal = {
      id: generateId('GL'),
      studentId: currentStudent.id,
      title: goalTitle,
      targetAmount: Number(goalTargetAmount),
      category: goalCategory,
      deadline: goalDeadline || new Date().toISOString().split('T')[0]
    };

    onAddGoal(newGoal);
    
    // Reset Form
    setGoalTitle('');
    setGoalTargetAmount('');
    setGoalCategory('pendidikan');
    setGoalDeadline('');
    setShowAddGoalModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pendidikan': return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'wisuda': return <GraduationCap className="h-5 w-5 text-amber-500" />;
      case 'buku': return <Award className="h-5 w-5 text-teal-500" />;
      case 'laptop': return <Laptop className="h-5 w-5 text-rose-500" />;
      default: return <Star className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Card with Balance */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Wallet className="h-44 w-44" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/10">
              Buku Tabungan Pelajar (SIMPEL)
            </span>
            <p className="text-white/80 text-xs font-semibold mt-4">Nama Lengkap Pemilik Rekening</p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{currentStudent.name}</h2>
            <p className="text-emerald-100 text-xs font-semibold mt-1">NISN: {currentStudent.id} • Kelas: {currentStudent.class}</p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-white/80 text-xs font-semibold">Total Saldo Tersedia</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              {formatRupiah(currentStudent.balance)}
            </h1>
            <p className="text-emerald-100/80 text-[10px] font-semibold mt-2">
              Status Tabungan: <span className="bg-white text-emerald-800 px-2 py-0.5 rounded-full font-bold">AKTIFF</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Micro Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Akumulasi Menabung</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{formatRupiah(summaryStats.depositSum)}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Total uang yang pernah disetor</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dana Penarikan</p>
            <h3 className="text-xl font-extrabold text-red-500 mt-1">{formatRupiah(summaryStats.withdrawalSum)}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Akumulasi pengeluaran keperluan sekolah</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Columns: Celengan Impian vs Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Saving Goals Target Dashboard (Celengan Impian) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tabungan Impian Saya (Goals)</h3>
              <p className="text-xs text-slate-400">Atur target keuangan sekolah untuk memotivasi menyisihkan jajan</p>
            </div>
            
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="flex items-center gap-1 py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Buat Target
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myGoals.length > 0 ? (
              myGoals.map(goal => {
                // Percentage based on current balance
                // If student has enough total savings, goal status shows progress
                const progressPercentage = Math.min(
                  Math.round((currentStudent.balance / goal.targetAmount) * 100),
                  100
                );

                return (
                  <div key={goal.id} className="p-4 rounded-xl border border-slate-150 relative bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                          {getCategoryIcon(goal.category)}
                        </div>
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          title="Hapus Target"
                          className="p-1 hover:text-red-500 rounded-lg text-slate-400 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-3">{goal.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">Kategori: {goal.category}</p>

                      <div className="flex justify-between items-end text-[10px] font-semibold text-slate-500 mt-4">
                        <span>Target: {formatRupiah(goal.targetAmount)}</span>
                        <span>{progressPercentage}%</span>
                      </div>

                      {/* Custom Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          style={{ width: `${progressPercentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-emerald-500/75'}`}
                        />
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Batas: {goal.deadline}
                      </span>
                      {progressPercentage === 100 ? (
                        <span className="font-extrabold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Tercapai
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-500">
                          Butuh {formatRupiah(Math.max(goal.targetAmount - currentStudent.balance, 0))} lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs font-medium">
                Belum ada target impian dibuat. Mulai buat celengan target pertamamu sekarang!
              </div>
            )}
          </div>
        </div>

        {/* Recent Student Ledger Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Riwayat Rekening</h3>
            <p className="text-xs text-slate-400">Mutasi transaksi tabungan Anda</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {myTransactions.length > 0 ? (
              myTransactions.map((tx) => (
                <div key={tx.id} className="pt-4 first:pt-0 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {tx.type === 'deposit' ? 'Setor Tunai' : 'Penarikan Kas'}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-none mt-1">No. Ref: {tx.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </p>
                      <p className="text-[9px] text-slate-400 leading-none mt-1">Oleh {tx.tellerName}</p>
                    </div>
                  </div>
                  
                  {tx.notes && (
                    <p className="text-[10px] text-slate-500 leading-tight italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      "{tx.notes}"
                    </p>
                  )}
                  
                  <span className="text-[9px] text-slate-400 font-semibold font-mono">
                    {formatDateTime(tx.date)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada transaksi di rekening Anda.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- CREATE SAVING GOAL MODAL --- */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5" /> Buat Target Tabungan Impian
              </h4>
              <button onClick={() => setShowAddGoalModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddGoalSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Impian / Keperluan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran Buku Ujian, Studi Banding..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Impian</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pendidikan">Biaya Pendidikan / Sekolah</option>
                  <option value="wisuda">Uang Kelulusan & Wisuda</option>
                  <option value="buku">Buku Paket & ATK</option>
                  <option value="laptop">Komputer / Laptop Belajar</option>
                  <option value="lainnya">Lain-lain / Keperluan Pribadi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Target Tabungan (Rupiah)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-slate-400">
                    Rp
                  </div>
                  <input
                    type="number"
                    min={5000}
                    step={1000}
                    required
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 1000000"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batas Waktu Target (Deadline)</label>
                <input
                  type="date"
                  required
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
