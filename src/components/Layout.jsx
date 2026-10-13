import React, { useState, useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Target, 
  Receipt, 
  BarChart3, 
  Bot, 
  Settings, 
  Plus, 
  X,
  Mic,
  Moon,
  Sun
} from 'lucide-react';
import { DuitinContext } from '../context/DuitinContext';

export default function Layout() {
  const { data, addTransaction, toggleDarkMode, toast } = useContext(DuitinContext);
  const [showModal, setShowModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    title: '',
    category: 'Makanan & Minuman',
    accountId: data.accounts[0]?.id || '',
    toAccountId: data.accounts[1]?.id || '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const menu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Dompet', path: '/accounts', icon: Wallet },
    { name: 'Target', path: '/budgets-goals', icon: Target },
    { name: 'Tagihan & Utang', path: '/bills-debts', icon: Receipt },
    { name: 'Laporan', path: '/reports', icon: BarChart3 },
    { name: 'Asisten', path: '/assistant', icon: Bot },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      let type = 'expense';
      if (text.includes('pemasukan') || text.includes('gaji') || text.includes('dapat')) {
        type = 'income';
      }

      const numbers = text.match(/\d+/g);
      let detectedAmount = numbers ? numbers.join('') : '';

      setForm(prev => ({
        ...prev,
        type,
        amount: detectedAmount || prev.amount,
        title: text,
        note: `Input suara: "${text}"`
      }));
    };

    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    if (form.type === 'transfer' && form.accountId === form.toAccountId) {
      alert('Dompet sumber dan dompet tujuan tidak boleh sama.');
      return;
    }

    addTransaction({
      ...form,
      amount: Number(form.amount),
      title: form.title || (form.type === 'transfer' ? 'Transfer Saldo' : form.category)
    });

    setForm({
      type: 'expense',
      amount: '',
      title: '',
      category: 'Makanan & Minuman',
      accountId: data.accounts[0]?.id || '',
      toAccountId: data.accounts[1]?.id || '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setShowModal(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-xl shadow-lg text-sm font-medium animate-bounce">
          {toast.message}
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Duitin.</span>
            </div>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              title="Ganti Tema"
            >
              {data.settings?.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus size={18} />
            <span>Catat Transaksi</span>
          </button>

          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
          Duitin Standalone v1.0
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Floating Action Button Mobile */}
      <button 
        onClick={() => setShowModal(true)} 
        className="lg:hidden fixed right-4 bottom-20 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-500/40"
        aria-label="Tambah Transaksi"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 px-1 pb-safe z-30">
        {menu.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1 text-[11px] font-medium ${
                  isActive ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon size={20} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Modal Input Transaksi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Catat Transaksi</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'expense' })} 
                className={`py-2 rounded-lg ${form.type === 'expense' ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm' : 'text-gray-500'}`}
              >
                Pengeluaran
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'income' })} 
                className={`py-2 rounded-lg ${form.type === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-500'}`}
              >
                Pemasukan
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'transfer' })} 
                className={`py-2 rounded-lg ${form.type === 'transfer' ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm' : 'text-gray-500'}`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Nominal (Rp)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full text-2xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-emerald-500 outline-none py-2"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-emerald-500'}`}
                    title="Bicara untuk mengisi nominal"
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">Keterangan</label>
                <input
                  type="text"
                  placeholder="Misal: Makan Siang, Beli Bensin"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none border border-transparent focus:border-emerald-500"
                />
              </div>

              {form.type !== 'transfer' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Dompet</label>
                      <select
                        value={form.accountId}
                        onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                      >
                        {data.accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Kategori</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                      >
                        {data.categories[form.type]?.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Dari Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                    >
                      {data.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Ke Dompet</label>
                    <select
                      value={form.toAccountId}
                      onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                    >
                      {data.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Tanggal</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Catatan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
