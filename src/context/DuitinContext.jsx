import React, { createContext, useState, useEffect } from 'react';

export const DuitinContext = createContext();

const STORAGE_KEY = 'duitin_master_data_v5';

// Helper format titik ribuan (contoh: 10000 -> 10.000)
export const formatNumberWithDots = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const digits = val.toString().replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumberFromDots = (val) => {
  if (!val) return 0;
  const digits = val.toString().replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const defaultData = {
  profile: {
    name: 'Ayesha Khan',
    bio: 'Menuju kebebasan finansial cerdas',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tier: 'Premium Member'
  },
  accounts: [
    { id: 'acc_1', name: 'Dompet Utama', type: 'cash', initialBalance: 1250000, color: '#10b981' },
    { id: 'acc_2', name: 'Rekening Bank', type: 'bank', initialBalance: 3500000, color: '#0ea5e9' }
  ],
  transactions: [
    { id: 'tx_1', type: 'income', amount: 5000000, title: 'Salary Credited', category: 'Gaji', accountId: 'acc_2', date: new Date().toISOString().split('T')[0], note: 'Gaji Bulanan' },
    { id: 'tx_2', type: 'expense', amount: 45000, title: 'Starbucks Coffee', category: 'Makanan & Minuman', accountId: 'acc_1', date: new Date().toISOString().split('T')[0], note: 'Kopi pagi' }
  ],
  budgets: [
    { id: 'bg_1', category: 'Makanan & Minuman', limit: 1500000, period: 'monthly' },
    { id: 'bg_2', category: 'Transportasi', limit: 600000, period: 'monthly' }
  ],
  goals: [
    { id: 'gl_1', name: 'Dana Darurat', targetAmount: 10000000, currentAmount: 4200000, targetDate: '2026-12-31' }
  ],
  bills: [
    { id: 'bl_1', name: 'Electricity Bill', amount: 250000, dueDate: '2026-11-05', isPaid: false, category: 'Tagihan' },
    { id: 'bl_2', name: 'Internet Fiber', amount: 350000, dueDate: '2026-11-10', isPaid: false, category: 'Tagihan' }
  ],
  debts: [],
  categories: {
    income: [
      { id: 'inc_1', name: 'Gaji', color: '#10b981' },
      { id: 'inc_2', name: 'Freelance', color: '#0ea5e9' },
      { id: 'inc_3', name: 'Investasi', color: '#8b5cf6' },
      { id: 'inc_4', name: 'Lainnya', color: '#64748b' }
    ],
    expense: [
      { id: 'exp_1', name: 'Makanan & Minuman', color: '#10b981' },
      { id: 'exp_2', name: 'Transportasi', color: '#0ea5e9' },
      { id: 'exp_3', name: 'Belanja', color: '#ec4899' },
      { id: 'exp_4', name: 'Tagihan', color: '#f59e0b' },
      { id: 'exp_5', name: 'Hiburan', color: '#8b5cf6' },
      { id: 'exp_6', name: 'Lainnya', color: '#64748b' }
    ]
  },
  settings: {
    currency: 'IDR',
    darkMode: false,
    hideBalance: false
  }
};

export const DuitinProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultData;
      const parsed = JSON.parse(saved);
      return {
        ...defaultData,
        ...parsed,
        profile: { ...defaultData.profile, ...(parsed.profile || {}) },
        settings: { ...defaultData.settings, ...(parsed.settings || {}) },
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : defaultData.accounts,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaultData.transactions,
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : defaultData.budgets,
        goals: Array.isArray(parsed.goals) ? parsed.goals : defaultData.goals,
        bills: Array.isArray(parsed.bills) ? parsed.bills : defaultData.bills,
        debts: Array.isArray(parsed.debts) ? parsed.debts : [],
        categories: parsed.categories?.expense ? parsed.categories : defaultData.categories
      };
    } catch {
      return defaultData;
    }
  });

  const [toast, setToast] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Tangkap event PWA install
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Aplikasi Duitin berhasil dipasang!');
      }
      setDeferredPrompt(null);
    } else {
      alert('Untuk memasang di HP Android: Tekan tombol titik tiga (⋮) di peramban Chrome, lalu pilih "Tambahkan ke Layar Utama" atau "Pasang Aplikasi".');
    }
  };

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
    (data.accounts || []).forEach(acc => {
      balances[acc.id] = Number(acc.initialBalance || 0);
    });

    (data.transactions || []).forEach(tx => {
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

  const updateProfile = (profileData) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileData }
    }));
    showToast('Profil akun tersimpan');
  };

  const toggleHideBalance = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, hideBalance: !prev.settings.hideBalance }
    }));
  };

  const addTransaction = (tx) => {
    const newTx = { ...tx, id: 'tx_' + Date.now() };
    setData(prev => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
    showToast('Transaksi berhasil dicatat');
  };

  const deleteTransaction = (id) => {
    setData(prev => ({ ...prev, transactions: (prev.transactions || []).filter(t => t.id !== id) }));
    showToast('Transaksi dihapus');
  };

  const addAccount = (acc) => {
    const newAcc = { ...acc, id: 'acc_' + Date.now() };
    setData(prev => ({ ...prev, accounts: [...(prev.accounts || []), newAcc] }));
    showToast('Dompet berhasil dibuat');
  };

  const deleteAccount = (id) => {
    setData(prev => ({
      ...prev,
      accounts: (prev.accounts || []).filter(a => a.id !== id),
      transactions: (prev.transactions || []).filter(t => t.accountId !== id && t.fromAccountId !== id && t.toAccountId !== id)
    }));
    showToast('Dompet dihapus');
  };

  const addBudget = (budget) => {
    setData(prev => ({ ...prev, budgets: [...(prev.budgets || []), { ...budget, id: 'bg_' + Date.now() }] }));
    showToast('Anggaran disimpan');
  };

  const deleteBudget = (id) => {
    setData(prev => ({ ...prev, budgets: (prev.budgets || []).filter(b => b.id !== id) }));
    showToast('Anggaran dihapus');
  };

  const addGoal = (goal) => {
    setData(prev => ({ ...prev, goals: [...(prev.goals || []), { ...goal, id: 'gl_' + Date.now() }] }));
    showToast('Target tabungan disimpan');
  };

  const deleteGoal = (id) => {
    setData(prev => ({ ...prev, goals: (prev.goals || []).filter(g => g.id !== id) }));
    showToast('Target dihapus');
  };

  const updateGoalProgress = (id, amount) => {
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + Number(amount) } : g)
    }));
    showToast('Tabungan bertambah');
  };

  const addBill = (bill) => {
    setData(prev => ({ ...prev, bills: [...(prev.bills || []), { ...bill, id: 'bl_' + Date.now() }] }));
    showToast('Tagihan ditambahkan');
  };

  const deleteBill = (id) => {
    setData(prev => ({ ...prev, bills: (prev.bills || []).filter(b => b.id !== id) }));
    showToast('Tagihan dihapus');
  };

  const markBillPaid = (billId, accountId) => {
    const bill = (data.bills || []).find(b => b.id === billId);
    if (!bill) return;

    addTransaction({
      type: 'expense',
      amount: bill.amount,
      title: `Pembayaran ${bill.name}`,
      category: bill.category || 'Tagihan',
      accountId: accountId || data.accounts?.[0]?.id,
      date: new Date().toISOString().split('T')[0],
      note: 'Pelunasan tagihan'
    });

    setData(prev => ({
      ...prev,
      bills: (prev.bills || []).map(b => b.id === billId ? { ...b, isPaid: true } : b)
    }));
    showToast('Tagihan lunas');
  };

  const addDebt = (debt) => {
    setData(prev => ({ ...prev, debts: [...(prev.debts || []), { ...debt, id: 'db_' + Date.now() }] }));
    showToast('Catatan utang/piutang tersimpan');
  };

  const deleteDebt = (id) => {
    setData(prev => ({ ...prev, debts: (prev.debts || []).filter(d => d.id !== id) }));
    showToast('Catatan dihapus');
  };

  const payDebt = (debtId, payAmount, accountId) => {
    const target = (data.debts || []).find(d => d.id === debtId);
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
      debts: (prev.debts || []).map(d => {
        if (d.id === debtId) {
          const nextRemaining = Math.max(0, d.remaining - amt);
          return { ...d, remaining: nextRemaining };
        }
        return d;
      })
    }));
    showToast('Pelunasan berhasil');
  };

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
        [type]: [...(prev.categories?.[type] || []), newCat]
      }
    }));
    showToast('Kategori baru ditambahkan');
  };

  const deleteCategory = (type, categoryId) => {
    setData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: (prev.categories?.[type] || []).filter(c => c.id !== categoryId)
      }
    }));
    showToast('Kategori dihapus');
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
      addCustomCategory,
      deleteCategory,
      toggleDarkMode,
      exportBackup,
      importBackup,
      resetAllData,
      installPwa,
      isPwaInstalled,
      hasInstallPrompt: !!deferredPrompt,
      toast
    }}>
      {children}
    </DuitinContext.Provider>
  );
};
