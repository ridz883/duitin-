import React, { useContext } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data, balances } = useContext(DuitinContext);

  const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  let totalIncome = 0;
  let totalExpense = 0;

  data.transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      if (tx.type === 'income') totalIncome += Number(tx.amount);
      if (tx.type === 'expense') totalExpense += Number(tx.amount);
    }
  });

  const netCashFlow = totalIncome - totalExpense;

  // Tren 7 hari terakhir
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    let inc = 0;
    let exp = 0;
    data.transactions.filter(t => t.date === dateStr).forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });

    return {
      day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      Pemasukan: inc,
      Pengeluaran: exp
    };
  });

  const unpaidBills = data.bills.filter(b => !b.isPaid);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {data.settings?.userName || 'Pengguna'} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan kondisi keuangan pribadi Anda hari ini.</p>
        </div>
      </header>

      {/* Ringkasan Saldo & Arus Kas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Total Saldo Bersih</span>
            <Wallet size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{formatIDR(totalBalance)}</div>
          <p className="text-[11px] text-gray-400 mt-1">{data.accounts.length} Dompet aktif</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Pemasukan Bulan Ini</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(totalIncome)}</div>
          <p className="text-[11px] text-gray-400 mt-1">Bulan {new Date().toLocaleDateString('id-ID', { month: 'long' })}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Pengeluaran Bulan Ini</span>
            <TrendingDown size={18} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatIDR(totalExpense)}</div>
          <p className="text-[11px] text-gray-400 mt-1">Tidak termasuk transfer</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Arus Kas Bersih</span>
            <span className={`text-xs font-semibold ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatIDR(netCashFlow)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Pemasukan - Pengeluaran</p>
        </div>
      </div>

      {/* Grafik Tren 7 Hari Terakhir */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-base font-bold mb-4">Tren Keuangan 7 Hari Terakhir</h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip formatter={(value) => formatIDR(value)} />
              <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Terakhir */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-base font-bold mb-4">Transaksi Terbaru</h2>
          <div className="space-y-3">
            {data.transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                    tx.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft size={16} /> : tx.type === 'expense' ? <ArrowUpRight size={16} /> : <Wallet size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.title}</p>
                    <p className="text-xs text-gray-400">{tx.date} • {tx.type === 'transfer' ? 'Transfer' : tx.category}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${
                  tx.type === 'income' ? 'text-emerald-500' :
                  tx.type === 'expense' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatIDR(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tagihan Jatuh Tempo */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Tagihan Mendatang</h2>
            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
              {unpaidBills.length} Belum Dibayar
            </span>
          </div>
          {unpaidBills.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Semua tagihan lunas!</p>
          ) : (
            <div className="space-y-3">
              {unpaidBills.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center space-x-3">
                    <AlertCircle size={18} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-gray-400">Jatuh tempo: {b.dueDate}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatIDR(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
