import { Student, Teller, Transaction, SavingGoal, User } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "202446001",
    name: "Aditya Pratama",
    class: "XII RPL 1",
    balance: 1250000,
    status: 'active',
    phoneNumber: "081234567890",
    email: "aditya@smkn46.sch.id",
    createdAt: "2024-07-15T08:00:00Z"
  },
  {
    id: "202446002",
    name: "Siti Rahmawati",
    class: "XII AKL 2",
    balance: 3400000,
    status: 'active',
    phoneNumber: "082345678901",
    email: "siti.rahma@smkn46.sch.id",
    createdAt: "2024-07-16T09:15:00Z"
  },
  {
    id: "202446003",
    name: "Muhammad Rizky",
    class: "XI RPL 2",
    balance: 750000,
    status: 'active',
    phoneNumber: "083456789012",
    email: "rizky.m@smkn46.sch.id",
    createdAt: "2024-07-20T10:30:00Z"
  },
  {
    id: "202446004",
    name: "Larasati Putri",
    class: "XI OTKP 1",
    balance: 550000,
    status: 'active',
    phoneNumber: "084567890123",
    email: "larasati@smkn46.sch.id",
    createdAt: "2024-08-01T08:45:00Z"
  },
  {
    id: "202446005",
    name: "Farhan Alamsyah",
    class: "X BDP 2",
    balance: 200000,
    status: 'active',
    phoneNumber: "085678901234",
    email: "farhan.a@smkn46.sch.id",
    createdAt: "2025-01-05T11:00:00Z"
  },
  {
    id: "202446006",
    name: "Dewi Lestari",
    class: "XII AKL 1",
    balance: 4850000,
    status: 'active',
    phoneNumber: "086789012345",
    email: "dewi.l@smkn46.sch.id",
    createdAt: "2024-07-15T08:10:00Z"
  },
  {
    id: "202446007",
    name: "Bagus Wicaksono",
    class: "XI BDP 1",
    balance: 150000,
    status: 'inactive',
    phoneNumber: "087890123456",
    email: "bagus.w@smkn46.sch.id",
    createdAt: "2024-08-10T14:20:00Z"
  }
];

export const INITIAL_TELLERS: Teller[] = [
  {
    id: "TLR-01",
    name: "Bu Sri Wahyuni",
    code: "TLR4601",
    status: 'active',
    email: "sri.wahyuni@smkn46.sch.id",
    createdAt: "2024-06-01T07:30:00Z"
  },
  {
    id: "TLR-02",
    name: "Pak Eko Prasetyo",
    code: "TLR4602",
    status: 'active',
    email: "eko.prasetyo@smkn46.sch.id",
    createdAt: "2024-06-01T07:30:00Z"
  }
];

// Helper to get relative dates in June/July 2026 based on current metadata (June 28, 2026)
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-987101",
    studentId: "202446002",
    studentName: "Siti Rahmawati",
    studentClass: "XII AKL 2",
    type: "deposit",
    amount: 500000,
    tellerId: "TLR-01",
    tellerName: "Bu Sri Wahyuni",
    date: "2026-06-25T08:30:00Z",
    notes: "Setoran rutin mingguan"
  },
  {
    id: "TX-987102",
    studentId: "202446001",
    studentName: "Aditya Pratama",
    studentClass: "XII RPL 1",
    type: "deposit",
    amount: 200000,
    tellerId: "TLR-01",
    tellerName: "Bu Sri Wahyuni",
    date: "2026-06-26T09:45:00Z",
    notes: "Menabung sisa uang jajan"
  },
  {
    id: "TX-987103",
    studentId: "202446006",
    studentName: "Dewi Lestari",
    studentClass: "XII AKL 1",
    type: "deposit",
    amount: 1000000,
    tellerId: "TLR-02",
    tellerName: "Pak Eko Prasetyo",
    date: "2026-06-26T10:15:00Z",
    notes: "Setoran tabungan magang"
  },
  {
    id: "TX-987104",
    studentId: "202446003",
    studentName: "Muhammad Rizky",
    studentClass: "XI RPL 2",
    type: "withdrawal",
    amount: 150000,
    tellerId: "TLR-01",
    tellerName: "Bu Sri Wahyuni",
    date: "2026-06-27T08:15:00Z",
    notes: "Tarik tunai keperluan buku"
  },
  {
    id: "TX-987105",
    studentId: "202446004",
    studentName: "Larasati Putri",
    studentClass: "XI OTKP 1",
    type: "deposit",
    amount: 150000,
    tellerId: "TLR-02",
    tellerName: "Pak Eko Prasetyo",
    date: "2026-06-27T11:30:00Z",
    notes: "Tabungan rutin"
  },
  {
    id: "TX-987106",
    studentId: "202446002",
    studentName: "Siti Rahmawati",
    studentClass: "XII AKL 2",
    type: "withdrawal",
    amount: 200000,
    tellerId: "TLR-01",
    tellerName: "Bu Sri Wahyuni",
    date: "2026-06-28T09:00:00Z",
    notes: "Kebutuhan ujian sertifikasi"
  },
  {
    id: "TX-987107",
    studentId: "202446005",
    studentName: "Farhan Alamsyah",
    studentClass: "X BDP 2",
    type: "deposit",
    amount: 100000,
    tellerId: "TLR-02",
    tellerName: "Pak Eko Prasetyo",
    date: "2026-06-28T14:00:00Z",
    notes: "Setoran awal pendaftaran"
  }
];

export const INITIAL_GOALS: SavingGoal[] = [
  {
    id: "GL-01",
    studentId: "202446001",
    title: "Sertifikasi Kompetensi RPL",
    targetAmount: 2000000,
    category: "pendidikan",
    deadline: "2026-09-30"
  },
  {
    id: "GL-02",
    studentId: "202446001",
    title: "Upgrade Laptop Coding",
    targetAmount: 5000000,
    category: "laptop",
    deadline: "2026-12-31"
  },
  {
    id: "GL-03",
    studentId: "202446002",
    title: "Uang Wisuda & Kebaya",
    targetAmount: 4000000,
    category: "wisuda",
    deadline: "2026-10-15"
  },
  {
    id: "GL-04",
    studentId: "202446003",
    title: "Buku Panduan UTBK",
    targetAmount: 1000000,
    category: "buku",
    deadline: "2026-08-31"
  }
];

export const PRESET_USERS: User[] = [
  {
    id: "USR-01",
    username: "admin",
    name: "Drs. Bambang Hariyono, M.Pd.",
    role: "admin",
    email: "bambang.h@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "USR-02",
    username: "sri.teler",
    name: "Bu Sri Wahyuni",
    role: "teller",
    email: "sri.wahyuni@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    tellerId: "TLR-01"
  },
  {
    id: "USR-03",
    username: "eko.teler",
    name: "Pak Eko Prasetyo",
    role: "teller",
    email: "eko.prasetyo@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    tellerId: "TLR-02"
  },
  {
    id: "USR-04",
    username: "aditya",
    name: "Aditya Pratama",
    role: "student",
    email: "aditya@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    studentId: "202446001"
  },
  {
    id: "USR-05",
    username: "siti",
    name: "Siti Rahmawati",
    role: "student",
    email: "siti.rahma@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    studentId: "202446002"
  },
  {
    id: "USR-06",
    username: "dewi",
    name: "Dewi Lestari",
    role: "student",
    email: "dewi.l@smkn46.sch.id",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    studentId: "202446006"
  }
];
