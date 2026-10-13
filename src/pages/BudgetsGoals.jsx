import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { Target, PieChart, Trash2 } from 'lucide-react';

export default function BudgetsGoals() {
  const { data, addBudget, deleteBudget, addGoal, deleteGoal, updateGoalProgress } = useContext(DuitinContext);
  const [tab, setTab] = useState('budgets');
  
  const [newBudget, setNewBudget] = useState({ category: 'Makanan & Minuman', limit: '' });
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', targetDate: '' });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const categoryExpenses = {};

  data.transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (tx.type === 'expense' && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    }
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Anggaran & Tabungan</h1>
          <p className="text-sm text-gray-500">Kendalikan batas belanja dan pantau progres impian Anda.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setTab('budgets')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'budgets' ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
        >
          <PieChart size={16} />
          <span>Anggaran Kategori</span>
        </button>
        <button
          onClick={() => setTab('goals')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'goals' ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
        >
          <Target size={16} />
          <span>Target Tabungan</span>
        </button>
      </div>

      {tab === 'budgets' ? (
        <div className="space-y-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newBudget.limit) return;
              addBudget({ category: newBudget.category, limit: Number(newBudget.limit), period: 'monthly' });
              setNewBudget({ category: 'Makanan & Minuman', limit: '' });
            }}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3"
          >
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none flex-1"
            >
              {data.categories.expense.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="number"
              placeholder="Batas Anggaran Bulanan (Rp)"
              value={newBudget.limit}
              onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none flex-1"
              required
            />
            <button type="submit" className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
              Buat Anggaran
            </button>
          </form>

          {data.budgets.length === 0 ? (
            <p className="text-center text-gray-400 py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
              Belum ada anggaran yang dibuat.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.budgets.map(bg => {
                const spent = categoryExpenses[bg.category] || 0;
                const percentage = Math.min(100, Math.round((spent / bg.limit) * 100));
                const isOver = spent > bg.limit;

                return (
                  <div key={bg.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-center pr-8">
                      <h3 className="font-bold text-sm">{bg.category}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${percentage >= 100 ? 'bg-red-100 text-red-600' : percentage >= 80 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {percentage}%
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus anggaran "${bg.category}"?`)) deleteBudget(bg.id);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                      title="Hapus Anggaran"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOver ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Terpakai: {formatIDR(spent)}</span>
                      <span>Batas: {formatIDR(bg.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newGoal.name || !newGoal.targetAmount) return;
              addGoal({
                name: newGoal.name,
                targetAmount: Number(newGoal.targetAmount),
                currentAmount: 0,
                targetDate: newGoal.targetDate || new Date().toISOString().split('T')[0]
              });
              setNewGoal({ name: '', targetAmount: '', targetDate: '' });
            }}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              placeholder="Nama Target (misal: Beli Laptop)"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <input
              type="number"
              placeholder="Nominal Target (Rp)"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <input
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            />
            <button type="submit" className="bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm">
              Tambah Target
            </button>
          </form>

          {data.goals.length === 0 ? (
            <p className="text-center text-gray-400 py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
              Belum ada target tabungan.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.goals.map(g => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 relative">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus target "${g.name}"?`)) deleteGoal(g.id);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                      title="Hapus Target"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex justify-between items-center pr-8">
                      <h3 className="font-bold text-sm">{g.name}</h3>
                      <span className="text-xs text-emerald-500 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Terkumpul: {formatIDR(g.currentAmount)}</span>
                      <span>Target: {formatIDR(g.targetAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="text-[11px] text-gray-400">Tenggat: {g.targetDate}</span>
                      <button
                        onClick={() => {
                          const amt = prompt('Nominal tabungan yang ingin ditambahkan (Rp):');
                          if (amt && Number(amt) > 0) updateGoalProgress(g.id, amt);
                        }}
                        className="text-xs font-semibold text-emerald-500 hover:underline"
                      >
                        + Tambah Simpanan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
