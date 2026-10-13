import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { Search, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';

export default function Transactions() {
  const { data, deleteTransaction } = useContext(DuitinContext);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = data.transactions.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        (t.note && t.note.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catatan Transaksi</h1>
          <p className="text-sm text-gray-500">Kelola dan telusuri seluruh riwayat keuangan Anda.</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
          {['all', 'expense', 'income', 'transfer'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg capitalize ${filterType === t ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-500' : 'text-gray-500'}`}
            >
              {t === 'all' ? 'Semua' : t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
            </button>
          ))}
        </div>
      </div>

      {/* List Transaksi */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center text-gray-400 border border-gray-100 dark:border-gray-800">
            Tidak ada transaksi yang cocok.
          </div>
        ) : (
          filtered.map(tx => (
            <div key={tx.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${
                  tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                  tx.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                }`}>
                  {tx.type === 'income' ? <ArrowDownLeft size={18} /> : tx.type === 'expense' ? <ArrowUpRight size={18} /> : <ArrowLeftRight size={18} />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{tx.title}</h4>
                  <p className="text-xs text-gray-400">{tx.date} • {tx.type === 'transfer' ? 'Transfer Antar Dompet' : tx.category}</p>
                  {tx.note && <p className="text-xs text-gray-500 italic mt-0.5">{tx.note}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`font-bold text-sm ${
                  tx.type === 'income' ? 'text-emerald-500' :
                  tx.type === 'expense' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatIDR(tx.amount)}
                </span>
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus transaksi ini?')) deleteTransaction(tx.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
