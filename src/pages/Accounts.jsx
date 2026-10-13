import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { Wallet, Plus, CreditCard, Banknote } from 'lucide-react';

export default function Accounts() {
  const { data, balances, addAccount } = useContext(DuitinContext);
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'cash', initialBalance: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAcc.name) return;
    addAccount({
      name: newAcc.name,
      type: newAcc.type,
      initialBalance: Number(newAcc.initialBalance || 0),
      color: '#10b981'
    });
    setNewAcc({ name: '', type: 'cash', initialBalance: '' });
    setShowAdd(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dompet & Rekening</h1>
          <p className="text-sm text-gray-500">Kelola sumber uang dan saldo aktif.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition"
        >
          <Plus size={16} />
          <span>Tambah Dompet</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
          <h3 className="font-bold text-sm">Tambah Dompet Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Nama Dompet (misal: Bank Mandiri)"
              value={newAcc.name}
              onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            />
            <select
              value={newAcc.type}
              onChange={(e) => setNewAcc({ ...newAcc, type: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            >
              <option value="cash">Uang Tunai</option>
              <option value="bank">Rekening Bank</option>
              <option value="ewallet">Dompet Digital</option>
            </select>
            <input
              type="number"
              placeholder="Saldo Awal (Rp)"
              value={newAcc.initialBalance}
              onChange={(e) => setNewAcc({ ...newAcc, initialBalance: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-500">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.accounts.map(acc => {
          const currentBal = balances[acc.id] || 0;
          return (
            <div key={acc.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
                  {acc.type === 'bank' ? <CreditCard size={20} /> : acc.type === 'cash' ? <Banknote size={20} /> : <Wallet size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{acc.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Saldo Saat Ini</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{formatIDR(currentBal)}</p>
              <p className="text-[11px] text-gray-400 mt-2">Saldo Awal: {formatIDR(acc.initialBalance)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
