import React, { useContext } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data, balances, toggleHideBalance } = useContext(DuitinContext);

  const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  let totalIncome = 0;
  let totalExpense = 0;
  let lastMonthExpense = 0;

  data.transactions.forEach(tx => {
    const d = new Date(tx.date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    if (m === currentMonth && y === currentYear) {
      if (tx.type === 'income') totalIncome += Number(tx.amount);
      if (tx.type === 'expense') totalExpense += Number(tx.amount);
    } else if (m === lastMonth && y === lastMonthYear) {
      if (tx.type === 'expense') lastMonthExpense += Number(tx.amount);
    }
  });

  const netCashFlow = totalIncome - totalExpense;

  // Hitung persentase tren pengeluaran dibanding bulan lalu
  let expenseTrendPercent = 0;
  if (lastMonthExpense > 0) {
    expenseTrendPercent = Math.round(((totalExpense - lastMonthExpense) / lastMonthExpense) * 100);
  }

  // Grafik 7 Hari Terakhir
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

  const displayMoney = (val) => {
    return data.settings?.hideBalance ? 'Rp ••••••••' : formatIDR(val);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {data.profile?.avatar ? (
            <img src={data.profile.avatar} alt="Avatar" className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm" />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {(data.profile?.name || 'P')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight">Halo, {data.profile?.name || 'Pengguna'} 👋</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{data.profile?.bio || 'Kelola keuangan harian secara mandiri'}</p>
          </div>
        </div>

        <button 
          onClick={toggleHideBalance} 
          className="p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 hover:text-emerald-500 shadow-sm transition"
          title={data.settings?.hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
        >
          {data.settings?.hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </header>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">Total Saldo Bersih</span>
            <Wallet size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black tracking-tight">{displayMoney(totalBalance)}</div>
          <p className="text-[11px] text-gray-400 mt-1">{data.accounts.length} Dompet aktif</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">Pemasukan Bulan Ini</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{displayMoney(totalIncome)}</div>
          <p className="text-[11px] text-gray-400 mt-1">Bulan {now.toLocaleDateString('id-ID', { month: 'long' })}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">Pengeluaran Bulan Ini</span>
            {lastMonthExpense > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${expenseTrendPercent > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {expenseTrendPercent > 0 ? `+${expenseTrendPercent}%` : `${expenseTrendPercent}%`}
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-red-500 tracking-tight">{displayMoney(totalExpense)}</div>
          <p className="text-[11px] text-gray-400 mt-1">
            {lastMonthExpense > 0 ? `Bln lalu: ${displayMoney(lastMonthExpense)}` : 'Arus kas reguler'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">Arus Kas Bersih</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${netCashFlow >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div className={`text-2xl font-black tracking-tight ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {displayMoney(netCashFlow)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Pemasukan dikurangi pengeluaran</p>
        </div>
      </div>

      {/* Grafik Tren */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-sm font-bold mb-4">Aktivitas Keuangan 7 Hari Terakhir</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip formatter={(value) => formatIDR(value)} />
              <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Bawah: Transaksi Terbaru & Tagihan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-bold mb-4">Transaksi Terkini</h2>
          {data.transactions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-3">
              {data.transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${
                      tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                      tx.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowDownLeft size={16} /> : tx.type === 'expense' ? <ArrowUpRight size={16} /> : <Wallet size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tx.title}</p>
                      <p className="text-[10px] text-gray-400">{tx.date} • {tx.type === 'transfer' ? 'Transfer' : tx.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black ${
                    tx.type === 'income' ? 'text-emerald-500' :
                    tx.type === 'expense' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{displayMoney(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Tagihan Mendatang</h2>
            <span className="text-[11px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
              {unpaidBills.length} Belum Dibayar
            </span>
          </div>
          {unpaidBills.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Semua tagihan telah lunas!</p>
          ) : (
            <div className="space-y-3">
              {unpaidBills.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="flex items-center space-x-3">
                    <AlertCircle size={18} className="text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">{b.name}</p>
                      <p className="text-[10px] text-gray-400">Jatuh tempo: {b.dueDate}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">{displayMoney(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
