import React, { createContext, useState, useEffect } from 'react';

export const DuitinContext = createContext();

// Menggunakan key v2 agar data dummy lama di browser langsung terhapus bersih
const STORAGE_KEY = 'duitin_master_data_v2';

const defaultData = {
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  bills: [],
  debts: [],
  categories: {
    income: ['Gaji', 'Uang Saku', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'],
    expense: ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Pendidikan', 'Hiburan', 'Kesehatan', 'Lainnya']
  },
  settings: {
    userName: 'Pengguna',
    currency: 'IDR',
    darkMode: false
  }
};

export const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0);
};

export const DuitinProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Penyimpanan lokal penuh', e);
    }
  }, [data]);

  useEffect(() => {
    if (data.settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings?.darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getBalances = () => {
    const balances = {};
    data.accounts.forEach(acc => {
      balances[acc.id] = Number(acc.initialBalance || 0);
    });

    data.transactions.forEach(tx => {
      const amt = Number(tx.amount || 0);
      if (tx.type === 'income' && balances[tx.accountId] !== undefined) {
        balances[tx.accountId] += amt;
      } else if (tx.type === 'expense' && balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= amt;
      } else if (tx.type === 'transfer') {
        if (balances[tx.fromAccountId] !== undefined) balances[tx.fromAccountId] -= amt;
        if (balances[tx.toAccountId] !== undefined) balances[tx.toAccountId] += amt;
      }
    });

    return balances;
  };

  // --- TRANSAKSI ---
  const addTransaction = (tx) => {
    const newTx = { ...tx, id: 'tx_' + Date.now() };
    setData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    showToast('Transaksi berhasil dicatat');
  };

  const deleteTransaction = (id) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    showToast('Transaksi dihapus');
  };

  // --- DOMPET / AKUN ---
  const addAccount = (acc) => {
    const newAcc = { ...acc, id: 'acc_' + Date.now() };
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newAcc] }));
    showToast('Dompet baru ditambahkan');
  };

  const deleteAccount = (id) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id),
      // Bersihkan transaksi yang terkait dengan akun ini
      transactions: prev.transactions.filter(t => t.accountId !== id && t.fromAccountId !== id && t.toAccountId !== id)
    }));
    showToast('Dompet dan riwayatnya berhasil dihapus');
  };

  // --- ANGGARAN & TARGET TABUNGAN ---
  const addBudget = (budget) => {
    setData(prev => ({ ...prev, budgets: [...prev.budgets, { ...budget, id: 'bg_' + Date.now() }] }));
    showToast('Anggaran berhasil dibuat');
  };

  const deleteBudget = (id) => {
    setData(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
    showToast('Anggaran berhasil dihapus');
  };

  const addGoal = (goal) => {
    setData(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: 'gl_' + Date.now() }] }));
    showToast('Target tabungan disimpan');
  };

  const deleteGoal = (id) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    showToast('Target tabungan dihapus');
  };

  const updateGoalProgress = (id, amount) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + Number(amount) } : g)
    }));
    showToast('Progres tabungan diperbarui');
  };

  // --- TAGIHAN ---
  const addBill = (bill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, { ...bill, id: 'bl_' + Date.now() }] }));
    showToast('Tagihan ditambahkan');
  };

  const deleteBill = (id) => {
    setData(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== id) }));
    showToast('Tagihan berhasil dihapus');
  };

  const markBillPaid = (billId, accountId) => {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;

    addTransaction({
      type: 'expense',
      amount: bill.amount,
      title: `Pembayaran ${bill.name}`,
      category: bill.category || 'Tagihan',
      accountId: accountId || data.accounts[0]?.id,
      date: new Date().toISOString().split('T')[0],
      note: 'Pelunasan tagihan'
    });

    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === billId ? { ...b, isPaid: true } : b)
    }));
    showToast('Tagihan lunas');
  };

  // --- UTANG & PIUTANG ---
  const addDebt = (debt) => {
    setData(prev => ({ ...prev, debts: [...prev.debts, { ...debt, id: 'db_' + Date.now() }] }));
    showToast('Catatan utang/piutang disimpan');
  };

  const deleteDebt = (id) => {
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
    showToast('Catatan utang/piutang dihapus');
  };

  const payDebt = (debtId, payAmount, accountId) => {
    const target = data.debts.find(d => d.id === debtId);
    if (!target) return;
    const amt = Number(payAmount);

    if (target.type === 'debt') {
      addTransaction({
        type: 'expense',
        amount: amt,
        title: `Bayar Utang ke ${target.person}`,
        category: 'Lainnya',
        accountId: accountId,
        date: new Date().toISOString().split('T')[0],
        note: 'Pembayaran utang'
      });
    } else {
      addTransaction({
        type: 'income',
        amount: amt,
        title: `Terima Piutang dari ${target.person}`,
        category: 'Lainnya',
        accountId: accountId,
        date: new Date().toISOString().split('T')[0],
        note: 'Penerimaan piutang'
      });
    }

    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => {
        if (d.id === debtId) {
          const nextRemaining = Math.max(0, d.remaining - amt);
          return { ...d, remaining: nextRemaining };
        }
        return d;
      })
    }));
    showToast('Pelunasan berhasil diproses');
  };

  const toggleDarkMode = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode }
    }));
  };

  const exportBackup = () => {
    const backupJson = JSON.stringify(data, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Duitin_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup berhasil diunduh');
  };

  const importBackup = (fileContent) => {
    try {
      const parsed = JSON.parse(fileContent);
      setData(parsed);
      showToast('Data berhasil dipulihkan');
      return true;
    } catch {
      showToast('File backup rusak', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Semua data berhasil dibersihkan');
  };

  return (
    <DuitinContext.Provider value={{
      data,
      balances: getBalances(),
      addTransaction,
      deleteTransaction,
      addAccount,
      deleteAccount,
      addBudget,
      deleteBudget,
      addGoal,
      deleteGoal,
      updateGoalProgress,
      addBill,
      deleteBill,
      markBillPaid,
      addDebt,
      deleteDebt,
      payDebt,
      toggleDarkMode,
      exportBackup,
      importBackup,
      resetAllData,
      toast
    }}>
      {children}
    </DuitinContext.Provider>
  );
};
