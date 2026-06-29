import React, { useState, useEffect } from 'react';
import { Student, Teller, Transaction, SavingGoal, User } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TELLERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_GOALS,
  PRESET_USERS
} from './data/seedData';
import { generateId } from './utils/format';

// Component Imports
import LoginScreen from './components/LoginScreen';
import DashboardLayout from './components/DashboardLayout';
import AdminPanel from './components/AdminPanel';
import TellerPanel from './components/TellerPanel';
import StudentPanel from './components/StudentPanel';

export default function App() {
  // --- CORE STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('simpel46_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('simpel46_users');
    return saved ? JSON.parse(saved) : PRESET_USERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('simpel46_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [tellers, setTellers] = useState<Teller[]>(() => {
    const saved = localStorage.getItem('simpel46_tellers');
    return saved ? JSON.parse(saved) : INITIAL_TELLERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('simpel46_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<SavingGoal[]>(() => {
    const saved = localStorage.getItem('simpel46_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // --- PERSISTENCE EFFECT WRITERS ---
  useEffect(() => {
    localStorage.setItem('simpel46_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('simpel46_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('simpel46_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('simpel46_tellers', JSON.stringify(tellers));
  }, [tellers]);

  useEffect(() => {
    localStorage.setItem('simpel46_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('simpel46_goals', JSON.stringify(goals));
  }, [goals]);

  // --- BUSINESS LOGIC HANDLERS ---

  // Add Transaction (Deposit / Withdrawal)
  const handleAddTransaction = (
    studentId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    notes: string,
    tellerId: string,
    tellerName: string
  ): Transaction | null => {
    const targetStudentIndex = students.findIndex(s => s.id === studentId);
    if (targetStudentIndex === -1) return null;

    const student = students[targetStudentIndex];

    // Double check status and balance boundaries
    if (student.status !== 'active') return null;
    if (type === 'withdrawal' && student.balance < amount) return null;

    // 1. Calculate new balance
    const updatedBalance = type === 'deposit' 
      ? student.balance + amount 
      : student.balance - amount;

    // 2. Clone and update student
    const updatedStudents = [...students];
    updatedStudents[targetStudentIndex] = {
      ...student,
      balance: updatedBalance
    };
    setStudents(updatedStudents);

    // 3. Create new transaction log
    const newTx: Transaction = {
      id: generateId('TX'),
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      type,
      amount,
      tellerId,
      tellerName,
      date: new Date().toISOString(),
      notes: notes.trim() || undefined
    };

    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  // Cancel / Rollback Transaction (Undo action for Tellers)
  const handleCancelTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    const studentIndex = students.findIndex(s => s.id === tx.studentId);
    if (studentIndex === -1) return;

    const student = students[studentIndex];

    // Determine balance adjustment to roll back
    // If original was deposit (added balance), rollback subtracts
    // If original was withdrawal (subtracted balance), rollback adds back
    let adjustedBalance = student.balance;
    if (tx.type === 'deposit') {
      adjustedBalance = student.balance - tx.amount;
    } else {
      adjustedBalance = student.balance + tx.amount;
    }

    // Update students list
    const updatedStudents = [...students];
    updatedStudents[studentIndex] = {
      ...student,
      balance: Math.max(adjustedBalance, 0)
    };
    setStudents(updatedStudents);

    // Filter out the cancelled transaction
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  // Admin Actions - Student Management
  const handleAddStudent = (
    newStudent: Student,
    initialDeposit: number,
    tellerId: string,
    tellerName: string
  ) => {
    // 1. Save student
    setStudents(prev => [...prev, newStudent]);

    // 2. Record initial deposit transaction if amount > 0
    if (initialDeposit > 0) {
      setTimeout(() => {
        handleAddTransaction(
          newStudent.id,
          'deposit',
          initialDeposit,
          'Setoran Awal Buku Tabungan',
          tellerId,
          tellerName
        );
      }, 50);
    }
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    
    // Also cascade class changes inside transaction history to keep logs accurate!
    setTransactions(prev => prev.map(tx => {
      if (tx.studentId === updatedStudent.id) {
        return {
          ...tx,
          studentName: updatedStudent.name,
          studentClass: updatedStudent.class
        };
      }
      return tx;
    }));
  };

  const handleToggleStudentStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: s.status === 'active' ? 'inactive' : 'active'
        };
      }
      return s;
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    // Remove student
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Cascade delete saving goals to avoid leaking orphans
    setGoals(prev => prev.filter(g => g.studentId !== studentId));
    // Do NOT delete financial transaction logs, to keep audit trail completely intact as real financial rules demand!
  };

  // Admin Actions - Teller Management
  const handleAddTeller = (newTeller: Teller, username?: string, password?: string) => {
    setTellers(prev => [...prev, newTeller]);
    if (username && password) {
      const newUser: User = {
        id: generateId('USR'),
        username: username.trim(),
        name: newTeller.name,
        role: 'teller',
        email: newTeller.email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        tellerId: newTeller.id,
        password: password.trim()
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const handleResetTellerPassword = (tellerId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => {
      if (u.tellerId === tellerId) {
        return {
          ...u,
          password: newPassword.trim()
        };
      }
      return u;
    }));
  };

  const handleToggleTellerStatus = (tellerId: string) => {
    setTellers(prev => prev.map(t => {
      if (t.id === tellerId) {
        return {
          ...t,
          status: t.status === 'active' ? 'inactive' : 'active'
        };
      }
      return t;
    }));
  };

  // Student Actions - Saving Goals
  const handleAddGoal = (newGoal: SavingGoal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Authentication switching
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Render Panel content based on role
  const renderPanel = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'admin':
        return (
          <AdminPanel
            students={students}
            tellers={tellers}
            transactions={transactions}
            users={users}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onAddTeller={handleAddTeller}
            onToggleTellerStatus={handleToggleTellerStatus}
            onToggleStudentStatus={handleToggleStudentStatus}
            onDeleteStudent={handleDeleteStudent}
            onResetTellerPassword={handleResetTellerPassword}
          />
        );
      
      case 'teller':
        return (
          <TellerPanel
            students={students}
            currentTellerUser={currentUser}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onCancelTransaction={handleCancelTransaction}
          />
        );

      case 'student':
        // Find corresponding student database profile
        const activeStudent = students.find(s => s.id === currentUser.studentId);
        
        if (!activeStudent) {
          return (
            <div className="bg-white p-8 rounded-2xl shadow-md border text-center">
              <p className="text-red-500 font-bold">Error: Profil Nasabah Siswa Tidak Ditemukan</p>
              <p className="text-xs text-slate-500 mt-2">Profil Anda mungkin telah dihapus oleh Admin. Hubungi pihak administrasi sekolah.</p>
              <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900">
                Keluar Aplikasi
              </button>
            </div>
          );
        }

        return (
          <StudentPanel
            currentStudent={activeStudent}
            transactions={transactions}
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );

      default:
        return <p className="text-center text-red-500">Akses Ditolak: Peran tidak dikenali</p>;
    }
  };

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout 
      user={currentUser} 
      onLogout={handleLogout} 
    >
      {renderPanel()}
    </DashboardLayout>
  );
}
