import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { 
  Send, 
  PlusCircle, 
  Receipt, 
  ArrowLeftRight, 
  Smartphone, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip 
} from 'recharts';

export default function Dashboard() {
  const { data, balances, toggleHideBalance, installPwa } = useContext(DuitinContext);
  const navigate = useNavigate();

  const totalBalance = Object.values(balances || {}).reduce((a, b) => a + b, 0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;
  const categoryTotals = {};

  (data.transactions || []).forEach(tx => {
    const d = new Date(tx.date);
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      if (tx.type === 'income') totalIncomeThisMonth += Number(tx.amount);
      if (tx.type === 'expense') {
        totalExpenseThisMonth += Number(tx.amount);
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
      }
    }
  });

  const donutColors = ['#10b981', '#0ea5e9', '#ec4899', '#f59e0b', '#8b5cf6', '#64748b'];
  const spendingData = Object.keys(categoryTotals).map((cat, i) => ({
    name: cat,
    value: categoryTotals[cat],
    percentage: totalExpenseThisMonth > 0 ? Math.round((categoryTotals[cat] / totalExpenseThisMonth) * 100) : 0,
    color: donutColors[i % donutColors.length]
  }));

  const emptyDonut = [{ name: 'Belum Ada Pengeluaran', value: 1, color: '#e2e8f0' }];

  // Data Bar Chart Bulanan Berdasarkan Transaksi Asli
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyBarData = monthNames.map((mName, idx) => {
    let spent = 0;
    (data.transactions || []).forEach(tx => {
      const d = new Date(tx.date);
      if (tx.type === 'expense' && d.getMonth() === idx && d.getFullYear() === currentYear) {
        spent += Number(tx.amount);
      }
    });
    return { month: mName, Pengeluaran: spent };
  });

  const totalBudgetLimit = (data.budgets || []).reduce((acc, b) => acc + Number(b.limit), 0);
  const budgetPercent = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalExpenseThisMonth / totalBudgetLimit) * 100)) : 0;

  const displayMoney = (val) => {
    return data.settings?.hideBalance ? 'Rp ••••••••' : formatIDR(val);
  };

  const unpaidBills = (data.bills || []).filter(b => !b.isPaid);

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1380px] mx-auto space-y-6">
      {/* BARIS 1: Hero Finora Card & Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Kiri: Hero Emerald Card + 5 Quick Actions (7 Col) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] text-white p-6 sm:p-7 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>Halo, {data.profile?.name || 'Pengguna'}</span>
                  <span>☀️</span>
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  {data.profile?.bio || 'Perjalanan finansial Anda tercatat rapi hari ini.'}
                </p>
              </div>
              <span className="bg-emerald-900/60 backdrop-blur-md text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
                ✓ Healthy
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-emerald-200/90 text-xs font-semibold mb-1">
                  <span>Total Saldo Bersih</span>
                  <button onClick={toggleHideBalance} className="hover:text-white transition">
                    {data.settings?.hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  {displayMoney(totalBalance)}
                </div>
                <div className="flex items-center gap-2 mt-2.5 text-xs font-bold text-emerald-200">
                  <TrendingUp size={15} />
                  <span>Pemasukan Bulan Ini: {displayMoney(totalIncomeThisMonth)}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="text-3xl">💳</span>
              </div>
            </div>
          </div>

          {/* 5 Tombol Aksi Cepat Finora */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
            {[
              { label: 'Catat', icon: PlusCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', action: () => navigate('/transactions') },
              { label: 'Dompet', icon: Send, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50', action: () => navigate('/accounts') },
              { label: 'Tagihan', icon: Receipt, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50', action: () => navigate('/bills-debts') },
              { label: 'Target', icon: ArrowLeftRight, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50', action: () => navigate('/budgets-goals') },
              { label: 'Install PWA', icon: Smartphone, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', action: installPwa }
            ].map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <button
                  key={idx}
                  onClick={btn.action}
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 ${btn.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center">
                    {btn.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kanan: Spending Overview Donut + Grow Card (5 Col) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Spending Overview</h3>
              <span className="text-[11px] font-bold text-slate-400">Bulan Ini</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="w-36 h-36 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData.length > 0 ? spendingData : emptyDonut}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {(spendingData.length > 0 ? spendingData : emptyDonut).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">
                    {displayMoney(totalExpenseThisMonth)}
                  </span>
                  <span className="text-[9px] text-slate-400">Total Keluar</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                {spendingData.length === 0 ? (
                  <p className="text-[11px] text-slate-400">Belum ada pengeluaran bulan ini.</p>
                ) : (
                  spendingData.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-[11px] text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-bold text-[11px]">{item.percentage}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
            <div>
              <div className="text-emerald-700 dark:text-emerald-300 text-xs font-black mb-1">
                🌱 Grow Your Money
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 max-w-[210px]">
                Susun target tabungan dan dana darurat untuk masa depan.
              </p>
              <button 
                onClick={() => navigate('/budgets-goals')}
                className="bg-[#0f766e] hover:bg-teal-800 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition"
              >
                Kelola Target →
              </button>
            </div>
            <div className="text-4xl pr-2">📈</div>
          </div>
        </div>
      </div>

      {/* BARIS 2: Monthly Spending Bar Chart, Budget Progress, Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">Monthly Spending ({currentYear})</h3>
            <span className="text-[11px] font-bold text-slate-400">Tahunan</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => formatIDR(val)} />
                <Bar dataKey="Pengeluaran" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">Budget Progress</h3>
            <span onClick={() => navigate('/budgets-goals')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">Kelola →</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-base font-black">{budgetPercent}%</span>
              <span className="text-[9px] text-slate-400">Terpakai</span>
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <p className="text-slate-500 text-[11px]">Total Anggaran:</p>
              <p className="font-black text-sm">{displayMoney(totalBudgetLimit)}</p>
              <p className="text-[10px] text-slate-400">Terpakai: {displayMoney(totalExpenseThisMonth)}</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <span>🏆</span>
            <span>{totalBudgetLimit === 0 ? 'Buat batas anggaran di menu Target.' : `Anda menggunakan ${budgetPercent}% anggaran bulan ini.`}</span>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">Upcoming Bills</h3>
            <span onClick={() => navigate('/bills-debts')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">Semua →</span>
          </div>

          {unpaidBills.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">Tidak ada tagihan tertunda.</p>
          ) : (
            <div className="space-y-2.5">
              {unpaidBills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 bg-amber-50 dark:bg-amber-950">
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{bill.name}</p>
                      <p className="text-[10px] text-slate-400">{bill.dueDate}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black">{displayMoney(bill.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BARIS 3: Recent Transactions & Card Motivasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">Recent Transactions</h3>
            <span onClick={() => navigate('/transactions')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">Lihat Semua →</span>
          </div>

          {(data.transactions || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Belum ada transaksi tercatat. Tekan tombol (+) untuk mulai mencatat.</p>
          ) : (
            <div className="space-y-2">
              {data.transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{tx.title}</h4>
                      <p className="text-[10px] text-slate-400">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}{displayMoney(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-gradient-to-tr from-emerald-100/70 via-teal-50/60 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-2xl">🌱</span>
            <h3 className="text-base font-black leading-snug">
              "Better money habits, a brighter future."
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Geser layar ke kiri atau kanan untuk berpindah antar-halaman dengan cepat.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>Duitin Smart Finance</span>
            <span>LocalStorage Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
