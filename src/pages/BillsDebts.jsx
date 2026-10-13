import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { CheckCircle2, Trash2 } from 'lucide-react';

export default function BillsDebts() {
  const { data, markBillPaid, addBill, deleteBill, addDebt, deleteDebt, payDebt } = useContext(DuitinContext);
  const [tab, setTab] = useState('bills');

  const [billForm, setBillForm] = useState({ name: '', amount: '', dueDate: '' });
  const [debtForm, setDebtForm] = useState({ person: '', type: 'debt', amount: '', dueDate: '', note: '' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tagihan & Kewajiban</h1>
          <p className="text-sm text-gray-500">Monitor tagihan bulanan dan catatan utang-piutang tanpa dobel catat.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setTab('bills')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'bills' ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
        >
          Tagihan Berulang
        </button>
        <button
          onClick={() => setTab('debts')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'debts' ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
        >
          Utang & Piutang
        </button>
      </div>

      {tab === 'bills' ? (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!billForm.name || !billForm.amount) return;
              addBill({
                name: billForm.name,
                amount: Number(billForm.amount),
                dueDate: billForm.dueDate || new Date().toISOString().split('T')[0],
                isPaid: false,
                category: 'Tagihan'
              });
              setBillForm({ name: '', amount: '', dueDate: '' });
            }}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              placeholder="Nama Tagihan (WiFi, Listrik)"
              value={billForm.name}
              onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <input
              type="number"
              placeholder="Nominal (Rp)"
              value={billForm.amount}
              onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <input
              type="date"
              value={billForm.dueDate}
              onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            />
            <button type="submit" className="bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm">
              Simpan Tagihan
            </button>
          </form>

          {data.bills.length === 0 ? (
            <p className="text-center text-gray-400 py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
              Belum ada catatan tagihan.
            </p>
          ) : (
            <div className="space-y-3">
              {data.bills.map(b => (
                <div key={b.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-semibold text-sm">{b.name}</h4>
                    <p className="text-xs text-gray-400">Jatuh Tempo: {b.dueDate}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm">{formatIDR(b.amount)}</span>
                    {b.isPaid ? (
                      <span className="flex items-center space-x-1 text-xs text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={14} />
                        <span>Lunas</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => markBillPaid(b.id, data.accounts[0]?.id)}
                        className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg"
                      >
                        Bayar Sekarang
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tagihan "${b.name}"?`)) deleteBill(b.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Hapus Tagihan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!debtForm.person || !debtForm.amount) return;
              addDebt({
                person: debtForm.person,
                type: debtForm.type,
                amount: Number(debtForm.amount),
                remaining: Number(debtForm.amount),
                dueDate: debtForm.dueDate || new Date().toISOString().split('T')[0],
                note: debtForm.note
              });
              setDebtForm({ person: '', type: 'debt', amount: '', dueDate: '', note: '' });
            }}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              placeholder="Nama Orang / Pihak"
              value={debtForm.person}
              onChange={(e) => setDebtForm({ ...debtForm, person: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <select
              value={debtForm.type}
              onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
            >
              <option value="debt">Utang (Saya Pinjam)</option>
              <option value="receivable">Piutang (Dia Pinjam)</option>
            </select>
            <input
              type="number"
              placeholder="Nominal (Rp)"
              value={debtForm.amount}
              onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
              required
            />
            <button type="submit" className="bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm">
              Tambah Catatan
            </button>
          </form>

          {data.debts.length === 0 ? (
            <p className="text-center text-gray-400 py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
              Belum ada catatan utang atau piutang.
            </p>
          ) : (
            <div className="space-y-3">
              {data.debts.map(d => (
                <div key={d.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm">{d.person}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.type === 'debt' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {d.type === 'debt' ? 'Utang Saya' : 'Piutang Saya'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Sisa: {formatIDR(d.remaining)} dari {formatIDR(d.amount)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {d.remaining === 0 ? (
                      <span className="text-xs text-emerald-500 font-bold">Lunas</span>
                    ) : (
                      <button
                        onClick={() => {
                          const amt = prompt('Nominal cicilan/pelunasan (Rp):', d.remaining);
                          if (amt && Number(amt) > 0) payDebt(d.id, amt, data.accounts[0]?.id);
                        }}
                        className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
                      >
                        Catat Pelunasan
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan atas nama "${d.person}"?`)) deleteDebt(d.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Hapus Catatan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
