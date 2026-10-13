import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function CalendarView() {
  const { data } = useContext(DuitinContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Ambil aktivitas untuk tanggal terpilih
  const dayTransactions = data.transactions.filter(t => t.date === selectedDate);
  const dayBills = data.bills.filter(b => b.dueDate === selectedDate);
  const dayDebts = data.debts.filter(d => d.dueDate === selectedDate);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kalender Keuangan</h1>
        <p className="text-sm text-gray-500">Pantau arus kas dan jadwal jatuh tempo berdasarkan tanggal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalender Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center space-x-2">
              <CalendarIcon size={18} className="text-emerald-500" />
              <span>{monthNames[month]} {year}</span>
            </h2>
            <div className="flex space-x-1">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-16" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              
              const hasIncome = data.transactions.some(t => t.date === dateStr && t.type === 'income');
              const hasExpense = data.transactions.some(t => t.date === dateStr && t.type === 'expense');
              const hasBill = data.bills.some(b => b.dueDate === dateStr && !b.isPaid);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-12 sm:h-16 p-1 rounded-xl border flex flex-col items-center justify-between transition-all ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' 
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {dayNum}
                  </span>
                  <div className="flex space-x-1">
                    {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {hasBill && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Detail Aktivitas pada Tanggal Terpilih */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
            Aktivitas: {selectedDate}
          </h3>

          <div className="space-y-3">
            {dayBills.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-amber-500">Jatuh Tempo Tagihan</p>
                {dayBills.map(b => (
                  <div key={b.id} className="p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-xs flex justify-between items-center">
                    <span>{b.name}</span>
                    <span className="font-bold text-amber-600">{formatIDR(b.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {dayDebts.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-blue-500">Jatuh Tempo Utang/Piutang</p>
                {dayDebts.map(d => (
                  <div key={d.id} className="p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-xs flex justify-between items-center">
                    <span>{d.person} ({d.type === 'debt' ? 'Utang' : 'Piutang'})</span>
                    <span className="font-bold">{formatIDR(d.remaining)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-400">Transaksi Tercatat</p>
              {dayTransactions.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">Tidak ada transaksi di tanggal ini.</p>
              ) : (
                dayTransactions.map(tx => (
                  <div key={tx.id} className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tx.title}</p>
                      <p className="text-[10px] text-gray-400">{tx.category}</p>
                    </div>
                    <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatIDR(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
