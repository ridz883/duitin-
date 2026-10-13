import React, { createContext, useState, useEffect } from 'react';

export const DuitinContext = createContext();

const STORAGE_KEY = 'duitin_master_data_v1';

const defaultData = {
  accounts: [
    { id: 'acc_1', name: 'Dompet Tunai', type: 'cash', initialBalance: 150000, color: '#10b981' },
    { id: 'acc_2', name: 'Rekening Bank', type: 'bank', initialBalance: 2500000, color: '#3b82f6' },
    { id: 'acc_3', name: 'E-Wallet', type: 'ewallet', initialBalance: 350000, color: '#f59e0b' }
  ],
  transactions: [
    { id: 'tx_1', type: 'income', amount: 3500000, title: 'Gaji Bulanan', category: 'Gaji', accountId: 'acc_2', date: new Date().toISOString().split('T')[0], note: 'Gaji pokok' },
    { id: 'tx_2', type: 'expense', amount: 35000, title: 'Makan Siang', category: 'Makanan & Minuman', accountId: 'acc_1', date: new Date().toISOString().split('T')[0], note: 'Nasi padang' }
  ],
  budgets: [
    { id: 'bg_1', category: 'Makanan & Minuman', limit: 1200000, period: 'monthly' },
    { id: 'bg_2', category: 'Transportasi', limit: 400000, period: 'monthly' }
  ],
  goals: [
    { id: 'gl_1', name: 'Dana Darurat', targetAmount: 10000000, currentAmount: 2500000, targetDate: '2026-12-31' },
    { id: 'gl_2', name: 'Beli Laptop', targetAmount: 8000000, currentAmount: 1800000, targetDate: '2026-11-30' }
  ],
  bills: [
    { id: 'bl_1', name: 'Langganan WiFi & Listrik', amount: 450000, dueDate: '2026-11-05', isPaid: false, category: 'Tagihan' }
  ],
  debts: [
    { id: 'db_1', person: 'Budi Santoso', type: 'receivable', amount: 150000, remaining: 150000, dueDate: '2026-10-30', note: 'Pinjam makan' }
  ],
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

  const addTransaction = (tx) => {
    const newTx = { ...tx, id: 'tx_' + Date.now() };
    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
    showToast('Transaksi berhasil disimpan');
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
    showToast('Transaksi dihapus');
  };

  const addAccount = (acc) => {
    const newAcc = { ...acc, id: 'acc_' + Date.now() };
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newAcc] }));
    showToast('Dompet baru ditambahkan');
  };

  const addBudget = (budget) => {
    setData(prev => ({ ...prev, budgets: [...prev.budgets, { ...budget, id: 'bg_' + Date.now() }] }));
    showToast('Anggaran berhasil dibuat');
  };

  const addGoal = (goal) => {
    setData(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: 'gl_' + Date.now() }] }));
    showToast('Target tabungan disimpan');
  };

  const updateGoalProgress = (id, amount) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + Number(amount) } : g)
    }));
    showToast('Progres tabungan diperbarui');
  };

  const addBill = (bill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, { ...bill, id: 'bl_' + Date.now() }] }));
    showToast('Tagihan ditambahkan');
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
      note: 'Pelunasan tagihan terjadwal'
    });

    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === billId ? { ...b, isPaid: true } : b)
    }));
    showToast('Tagihan berhasil dilunasi');
  };

  const addDebt = (debt) => {
    setData(prev => ({ ...prev, debts: [...prev.debts, { ...debt, id: 'db_' + Date.now() }] }));
    showToast('Catatan utang/piutang disimpan');
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
      if (!parsed.accounts || !parsed.transactions) throw new Error('Format tidak valid');
      setData(parsed);
      showToast('Data berhasil dipulihkan');
      return true;
    } catch {
      showToast('File backup rusak atau tidak valid', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    setData(defaultData);
    showToast('Data dikembalikan ke pengaturan awal');
  };

  return (
    <DuitinContext.Provider value={{
      data,
      balances: getBalances(),
      addTransaction,
      deleteTransaction,
      addAccount,
      addBudget,
      addGoal,
      updateGoalProgress,
      addBill,
      markBillPaid,
      addDebt,
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
