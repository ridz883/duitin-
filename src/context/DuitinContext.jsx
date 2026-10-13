import React, { createContext, useState, useEffect } from 'react';

export const DuitinContext = createContext();

const STORAGE_KEY = 'duitin_master_data_v3';

const defaultData = {
  profile: {
    name: 'Pengguna',
    bio: 'Menuju kebebasan finansial',
    avatar: ''
  },
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  bills: [],
  debts: [],
  categories: {
    income: [
      { id: 'inc_1', name: 'Gaji', color: '#10b981' },
      { id: 'inc_2', name: 'Uang Saku', color: '#3b82f6' },
      { id: 'inc_3', name: 'Freelance', color: '#f59e0b' },
      { id: 'inc_4', name: 'Bonus', color: '#8b5cf6' },
      { id: 'inc_5', name: 'Lainnya', color: '#6b7280' }
    ],
    expense: [
      { id: 'exp_1', name: 'Makanan & Minuman', color: '#ef4444' },
      { id: 'exp_2', name: 'Transportasi', color: '#f97316' },
      { id: 'exp_3', name: 'Belanja', color: '#ec4899' },
      { id: 'exp_4', name: 'Tagihan', color: '#8b5cf6' },
      { id: 'exp_5', name: 'Pendidikan', color: '#06b6d4' },
      { id: 'exp_6', name: 'Hiburan', color: '#10b981' },
      { id: 'exp_7', name: 'Lainnya', color: '#6b7280' }
    ]
  },
  settings: {
    currency: 'IDR',
    darkMode: false,
    hideBalance: false
  }
};

export const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0);
};

export const formatInputDigits = (raw) => {
  if (!raw) return '';
  const num = raw.toString().replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseInputDigits = (formatted) => {
  if (!formatted) return 0;
  return Number(formatted.toString().replace(/\D/g, '')) || 0;
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
      console.error('Storage full', e);
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

  // --- PROFIL AKUN ---
  const updateProfile = (profileData) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileData }
    }));
    showToast('Profil akun berhasil disimpan');
  };

  // --- SENSOR SALDO ---
  const toggleHideBalance = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, hideBalance: !prev.settings.hideBalance }
    }));
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

  // --- CUSTOM KATEGORI ---
  const addCustomCategory = (type, category) => {
    const newCat = {
      id: 'cat_' + Date.now(),
      name: category.name,
      color: category.color || '#10b981'
    };
    setData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: [...prev.categories[type], newCat]
      }
    }));
    showToast('Kategori baru berhasil ditambahkan');
  };

  const deleteCategory = (type, categoryId) => {
    setData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: prev.categories[type].filter(c => c.id !== categoryId)
      }
    }));
    showToast('Kategori dihapus');
  };

  // --- DOMPET ---
  const addAccount = (acc) => {
    const newAcc = { ...acc, id: 'acc_' + Date.now() };
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newAcc] }));
    showToast('Dompet berhasil dibuat');
  };

  const deleteAccount = (id) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id),
      transactions: prev.transactions.filter(t => t.accountId !== id && t.fromAccountId !== id && t.toAccountId !== id)
    }));
    showToast('Dompet dihapus');
  };

  // --- ANGGARAN & TARGET ---
  const addBudget = (budget) => {
    setData(prev => ({ ...prev, budgets: [...prev.budgets, { ...budget, id: 'bg_' + Date.now() }] }));
    showToast('Anggaran disimpan');
  };

  const deleteBudget = (id) => {
    setData(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
    showToast('Anggaran dihapus');
  };

  const addGoal = (goal) => {
    setData(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: 'gl_' + Date.now() }] }));
    showToast('Target tabungan disimpan');
  };

  const deleteGoal = (id) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    showToast('Target dihapus');
  };

  const updateGoalProgress = (id, amount) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + Number(amount) } : g)
    }));
    showToast('Tabungan bertambah');
  };

  // --- TAGIHAN ---
  const addBill = (bill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, { ...bill, id: 'bl_' + Date.now() }] }));
    showToast('Tagihan ditambahkan');
  };

  const deleteBill = (id) => {
    setData(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== id) }));
    showToast('Tagihan dihapus');
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
    showToast('Catatan tersimpan');
  };

  const deleteDebt = (id) => {
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
    showToast('Catatan dihapus');
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
    showToast('Pelunasan berhasil');
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
      showToast('File backup tidak valid', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Semua data dibersihkan');
  };

  return (
    <DuitinContext.Provider value={{
      data,
      balances: getBalances(),
      updateProfile,
      toggleHideBalance,
      addTransaction,
      deleteTransaction,
      addCustomCategory,
      deleteCategory,
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
