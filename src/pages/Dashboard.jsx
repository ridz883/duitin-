import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { 
  Send, 
  PlusCircle, 
  Receipt, 
  ArrowLeftRight, 
  ScanLine, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Zap, 
  Wifi, 
  Smartphone, 
  Film, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coffee, 
  Car, 
  ShoppingBag, 
  Briefcase 
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
  const { data, balances, toggleHideBalance } = useContext(DuitinContext);
  const navigate = useNavigate();

  const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let totalExpenseThisMonth = 0;
  const categoryTotals = {};

  data.transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && tx.type === 'expense') {
      totalExpenseThisMonth += Number(tx.amount);
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
    }
  });

  // Data Donut Chart Spending Overview
  const donutColors = ['#10b981', '#0ea5e9', '#ec4899', '#f59e0b', '#8b5cf6', '#64748b'];
  const spendingData = Object.keys(categoryTotals).map((cat, i) => ({
    name: cat,
    value: categoryTotals[cat],
    percentage: totalExpenseThisMonth > 0 ? Math.round((categoryTotals[cat] / totalExpenseThisMonth) * 100) : 0,
    color: donutColors[i % donutColors.length]
  }));

  const fallbackSpendingData = [
    { name: 'Food & Dining', value: 396000, percentage: 32, color: '#10b981' },
    { name: 'Transport', value: 223000, percentage: 18, color: '#0ea5e9' },
    { name: 'Shopping', value: 198000, percentage: 16, color: '#ec4899' },
    { name: 'Health & Fitness', value: 111000, percentage: 9, color: '#f59e0b' },
    { name: 'Entertainment', value: 99000, percentage: 8, color: '#8b5cf6' },
    { name: 'Others', value: 210000, percentage: 17, color: '#64748b' }
  ];

  const activeDonutData = spendingData.length > 0 ? spendingData : fallbackSpendingData;
  const displayTotalSpent = totalExpenseThisMonth > 0 ? totalExpenseThisMonth : 1240600;

  // Data Bar Chart 12 Bulan (Monthly Spending)
  const monthlyBarData = [
    { month: 'Jan', amount: 1500000 },
    { month: 'Feb', amount: 1800000 },
    { month: 'Mar', amount: 2100000 },
    { month: 'Apr', amount: 2800000, active: true },
    { month: 'May', amount: 1400000 },
    { month: 'Jun', amount: 1900000 },
    { month: 'Jul', amount: 2300000 },
    { month: 'Aug', amount: 2100000 },
    { month: 'Sep', amount: 1700000 },
    { month: 'Oct', amount: 2500000 },
    { month: 'Nov', amount: 2000000 },
    { month: 'Dec', amount: 1600000 },
  ];

  // Budget Progress Ratio
  const totalBudgetLimit = data.budgets.reduce((acc, b) => acc + Number(b.limit), 0) || 3000000;
  const budgetPercent = Math.min(100, Math.round((totalExpenseThisMonth / totalBudgetLimit) * 100)) || 68;

  const displayMoney = (val) => {
    return data.settings?.hideBalance ? 'Rp ••••••••' : formatIDR(val);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1400px] mx-auto space-y-6">
      {/* BARIS 1: Hero Card, Spending Overview Donut, dan Widget Grow Your Money */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Kolom Kiri: Hero Green Finora Card + Quick Actions (7 Col) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] text-white p-6 sm:p-7 shadow-xl shadow-emerald-900/10">
            {/* Header Card */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>Good Morning, {data.profile?.name?.split(' ')[0] || 'Ayesha'}</span>
                  <span>☀️</span>
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Your financial journey is going great! Here's what's happening with your money today.
                </p>
              </div>
              <span className="bg-emerald-900/60 backdrop-blur-md text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Healthy
              </span>
            </div>

            {/* Saldo Finora */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-emerald-200/80 text-xs font-semibold mb-1">
                  <span>Total Balance</span>
                  <button onClick={toggleHideBalance} className="hover:text-white transition">
                    {data.settings?.hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  {displayMoney(totalBalance)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-300">
                  <TrendingUp size={15} />
                  <span>↑ 12.5% vs. last month</span>
                </div>
              </div>

              {/* Ilustrasi Finora Wallet */}
              <div className="hidden sm:flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="text-3xl">💳</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Identik Finora) */}
          <div className="grid grid-cols-5 gap-2.5 sm:gap-4 pt-1">
            {[
              { label: 'Send Money', icon: Send, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', path: '/transactions' },
              { label: 'Add Money', icon: PlusCircle, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40', path: '/transactions' },
              { label: 'Pay Bills', icon: Receipt, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', path: '/bills-debts' },
              { label: 'Transfer', icon: ArrowLeftRight, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', path: '/accounts' },
              { label: 'Scan & Pay', icon: ScanLine, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', path: '/transactions' }
            ].map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(btn.path)}
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition active:scale-95"
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-1.5 ${btn.color}`}>
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

        {/* Kolom Kanan: Spending Overview Donut Chart & Grow Card (5 Col) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Spending Overview Donut */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Spending Overview</h3>
              <span className="text-[11px] font-bold text-slate-400">This Month ▾</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Donut dengan angka tengah */}
              <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeDonutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {activeDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {formatIDR(displayTotalSpent)}
                  </span>
                  <span className="text-[9px] text-slate-400">Total Spent</span>
                </div>
              </div>

              {/* Rincian Kategori di Samping */}
              <div className="flex-1 space-y-1.5 text-[11px]">
                {activeDonutData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold shrink-0">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Grow Your Money */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-300 text-xs font-black mb-1">
                <span>🌱 Grow Your Money</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 max-w-[200px]">
                Start investing today for a brighter future.
              </p>
              <button 
                onClick={() => navigate('/budgets-goals')}
                className="bg-[#0f766e] hover:bg-teal-800 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition shadow-sm"
              >
                Explore Investments →
              </button>
            </div>
            <div className="text-4xl pr-2">📈</div>
          </div>
        </div>
      </div>

      {/* BARIS 2: Monthly Spending Bar Chart, Budget Progress, Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Spending Bar Chart (5 Col) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Monthly Spending</h3>
            <span className="text-[11px] font-bold text-slate-400">April 2026 ▾</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => formatIDR(val)} />
                <Bar 
                  dataKey="amount" 
                  radius={[6, 6, 0, 0]} 
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Progress (4 Col) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Budget Progress</h3>
            <span onClick={() => navigate('/budgets-goals')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">View All →</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-t-emerald-200 dark:border-t-slate-700 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-black text-slate-800 dark:text-white">{budgetPercent}%</span>
              <span className="text-[9px] text-slate-400">Progress</span>
            </div>

            <div className="flex-1 space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Food & Dining</span>
                  <span className="font-bold">32%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[32%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Transport</span>
                  <span className="font-bold">18%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[18%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Banner Finora Achievement */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
            <span className="text-sm">🏆</span>
            <div>
              <p className="font-bold">You're on track!</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">You've spent {budgetPercent}% of your monthly budget. Keep it up!</p>
            </div>
          </div>
        </div>

        {/* Upcoming Bills (3 Col) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Upcoming Bills</h3>
            <span onClick={() => navigate('/bills-debts')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">View All →</span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Electricity', due: 'Due in 3 days', amount: 245000, icon: Zap, color: 'text-amber-500 bg-amber-50' },
              { name: 'Internet Fiber', due: 'Due in 5 days', amount: 350000, icon: Wifi, color: 'text-sky-500 bg-sky-50' },
              { name: 'Mobile Data', due: 'Due in 7 days', amount: 110000, icon: Smartphone, color: 'text-purple-500 bg-purple-50' },
              { name: 'Netflix', due: 'Due in 10 days', amount: 186000, icon: Film, color: 'text-red-500 bg-red-50' }
            ].map((bill, i) => {
              const BillIcon = bill.icon;
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bill.color}`}>
                      <BillIcon size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{bill.name}</p>
                      <p className="text-[10px] text-slate-400">{bill.due}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black">{formatIDR(bill.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BARIS 3: Recent Transactions Table & Motivasi Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recent Transactions List (8 Col) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Recent Transactions</h3>
            <span onClick={() => navigate('/transactions')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">View All →</span>
          </div>

          <div className="space-y-2">
            {data.transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 transition">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {tx.category === 'Makanan & Minuman' ? <Coffee size={16} /> :
                     tx.category === 'Transportasi' ? <Car size={16} /> :
                     tx.category === 'Belanja' ? <ShoppingBag size={16} /> : <Briefcase size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{tx.title}</h4>
                    <p className="text-[10px] text-slate-400">{tx.category} • {tx.date}</p>
                  </div>
                </div>

                <div className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{displayMoney(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Card Footer (4 Col) */}
        <div className="lg:col-span-4 bg-gradient-to-tr from-emerald-100/60 via-teal-50/60 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-2xl">🌱</span>
            <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">
              "Better money habits, a brighter future."
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Setiap rupiah yang dicatat membantumu melangkah menuju kebebasan finansial yang terukur dan mandiri.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>Duitin Finance</span>
            <span>2026 Edition</span>
          </div>
        </div>
      </div>
    </div>
  );
}
