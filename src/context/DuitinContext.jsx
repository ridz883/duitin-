import React, { createContext, useState, useEffect } from 'react';

export const DuitinContext = createContext();

const STORAGE_KEY = 'duitin_finora_clean_v6';

// Fungsi Format Titik Ribuan Otomatis (10000 -> 10.000)
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

// Alias kompatibilitas agar file lain tidak pernah error import
export const formatInputDigits = formatNumberWithDots;
export const parseInputDigits = parseNumberFromDots;

export const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value) || 0);
};

// Efek Konfeti Langsung (Tanpa perlu file tambahan)
export const triggerConfetti = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 60 }).map(() => ({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.4,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 1) * 9 - 3,
      angle: Math.random() * 360,
      vAngle: (Math.random() - 0.5) * 10,
      alpha: 1
    }));

    const start = Date.now();
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = Date.now() - start;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.angle += p.vAngle;
        if (elapsed > 1400) p.alpha = Math.max(0, p.alpha - 0.04);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (elapsed < 2200) {
        requestAnimationFrame(animate);
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
    animate();
  } catch (e) {
    console.log(e);
  }
};

const defaultData = {
  profile: {
    name: 'Pengguna Duitin',
    bio: 'Smart Finance. Better Tomorrow.',
    avatar: '',
    tier: 'Personal Account'
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
      { id: 'inc_2', name: 'Uang Saku', color: '#0ea5e9' },
      { id: 'inc_3', name: 'Freelance', color: '#f59e0b' },
      { id: 'inc_4', name: 'Bonus', color: '#8b5cf6' },
      { id: 'inc_5', name: 'Lainnya', color: '#64748b' }
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
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        bills: Array.isArray(parsed.bills) ? parsed.bills : [],
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
      if (outcome === 'accepted') showToast('Aplikasi berhasil dipasang!');
      setDeferredPrompt(null);
    } else {
      alert('Untuk memasang aplikasi di HP Android: Klik ikon titik tiga (⋮) di pojok kanan atas Chrome, lalu pilih "Tambahkan ke Layar Utama" atau "Install App".');
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
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
    setData(prev => ({ ...prev, profile: { ...prev.profile, ...profileData } }));
    showToast('Profil akun berhasil diperbarui');
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
    showToast('Transaksi berhasil disimpan');
  };

  const deleteTransaction = (id) => {
    setData(prev => ({ ...prev, transactions: (prev.transactions || []).filter(t => t.id !== id) }));
    showToast('Transaksi dihapus');
  };

  const addAccount = (acc) => {
    const newAcc = { ...acc, id: 'acc_' + Date.now() };
    setData(prev => ({ ...prev, accounts: [...(prev.accounts || []), newAcc] }));
    showToast('Dompet baru ditambahkan');
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
    triggerConfetti();
    showToast('Progres tabungan bertambah!');
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
    showToast('Catatan tersimpan');
  };

  const deleteDebt = (id) => {
    setData(prev => ({ ...prev, debts: (prev.debts || []).filter(d => d.id !== id) }));
    showToast('Catatan dihapus');
  };

  const payDebt = (debtId, payAmount, accountId) => {
    const target = (data.debts || []).find(d => d.id === debtId);
    if (!target) return;
    const amt = Number(payAmount);
    addTransaction({
      type: target.type === 'debt' ? 'expense' : 'income',
      amount: amt,
      title: target.type === 'debt' ? `Bayar Utang ke ${target.person}` : `Terima Piutang dari ${target.person}`,
      category: 'Lainnya',
      accountId: accountId || data.accounts?.[0]?.id,
      date: new Date().toISOString().split('T')[0],
      note: 'Catatan pelunasan'
    });
    setData(prev => ({
      ...prev,
      debts: (prev.debts || []).map(d => d.id === debtId ? { ...d, remaining: Math.max(0, d.remaining - amt) } : d)
    }));
    showToast('Pelunasan dicatat');
  };

  const addCustomCategory = (type, category) => {
    const newCat = { id: 'cat_' + Date.now(), name: category.name, color: category.color || '#10b981' };
    setData(prev => ({
      ...prev,
      categories: { ...prev.categories, [type]: [...(prev.categories?.[type] || []), newCat] }
    }));
    showToast('Kategori baru ditambahkan');
  };

  const deleteCategory = (type, categoryId) => {
    setData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: (prev.categories?.[type] || []).filter(c => (c.id || c) !== categoryId)
      }
    }));
    showToast('Kategori dihapus');
  };

  const toggleDarkMode = () => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, darkMode: !prev.settings.darkMode } }));
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
    showToast('Semua data berhasil di-reset ke 0');
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
      toast
    }}>
      {children}
    </DuitinContext.Provider>
  );
};
