export type UserRole = 'admin' | 'teller' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  studentId?: string; // Links to Student record if role is 'student'
  tellerId?: string;  // Links to Teller record if role is 'teller'
  password?: string;  // Optional manual account password
}

export interface Student {
  id: string; // Used as NISN (Nomor Induk Siswa Nasional)
  name: string;
  class: string; // Class name, e.g. "XI RPL 1", "X AKL 2"
  balance: number;
  status: 'active' | 'inactive';
  phoneNumber?: string;
  email?: string;
  createdAt: string;
}

export interface Teller {
  id: string; // Unique teller ID
  name: string;
  code: string; // NIP/Code, e.g. "TLR-001"
  status: 'active' | 'inactive';
  email?: string;
  createdAt: string;
}

export interface Transaction {
  id: string; // TX-XXXXXX
  studentId: string;
  studentName: string;
  studentClass: string;
  type: 'deposit' | 'withdrawal'; // 'deposit' = setor, 'withdrawal' = tarik
  amount: number;
  tellerId: string;
  tellerName: string;
  date: string; // ISO string
  notes?: string;
}

export interface SavingGoal {
  id: string;
  studentId: string;
  title: string;
  targetAmount: number;
  category: 'pendidikan' | 'wisuda' | 'buku' | 'laptop' | 'lainnya';
  deadline: string;
}

export interface BankStats {
  totalSavings: number;
  totalTransactionsCount: number;
  totalStudents: number;
  totalTellers: number;
  totalDeposits: number;
  totalWithdrawals: number;
}
