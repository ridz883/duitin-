import React, { useState, useContext } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { Search, X, ArrowRight } from 'lucide-react';

export default function GlobalSearch({ isOpen, onClose }) {
  const { data } = useContext(DuitinContext);
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTransactions = q ? data.transactions.filter(t => 
    t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q))
  ) : [];

  const matchedAccounts = q ? data.accounts.filter(a => 
    a.name.toLowerCase().includes(q)
  ) : [];

  const matchedBills = q ? data.bills.filter(b => 
    b.name.toLowerCase().includes(q)
  ) : [];

  const matchedDebts = q ? data.debts.filter(d => 
    d.person.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[75vh]">
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            autoFocus
            placeholder="Ketik untuk mencari transaksi, dompet, tagihan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!q && (
            <p className="text-xs text-gray-400 text-center py-6">Ketik nama transaksi, orang, atau rekening.</p>
          )}

          {matchedAccounts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dompet & Rekening</p>
              <div className="space-y-1">
                {matchedAccounts.map(a => (
                  <div key={a.id} className="p-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-gray-400 capitalize">{a.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedTransactions.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Transaksi</p>
              <div className="space-y-1">
                {matchedTransactions.slice(0, 5).map(t => (
                  <div key={t.id} className="p-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{t.date}</p>
                    </div>
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatIDR(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedBills.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tagihan</p>
              <div className="space-y-1">
                {matchedBills.map(b => (
                  <div key={b.id} className="p-2 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/20 flex justify-between">
                    <span>{b.name} (Jatuh tempo: {b.dueDate})</span>
                    <span className="font-bold text-amber-600">{formatIDR(b.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedDebts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Utang & Piutang</p>
              <div className="space-y-1">
                {matchedDebts.map(d => (
                  <div key={d.id} className="p-2 text-xs rounded-lg bg-blue-50 dark:bg-blue-950/20 flex justify-between">
                    <span>{d.person} ({d.type})</span>
                    <span className="font-bold">{formatIDR(d.remaining)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
