import React, { useState, useContext, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Target, 
  Receipt, 
  User,
  Plus, 
  X,
  Mic,
  Moon,
  Sun,
  Search,
  Camera,
  Calendar,
  BarChart3,
  Bot
} from 'lucide-react';
import { DuitinContext, formatInputDigits, parseInputDigits } from '../context/DuitinContext';
import { triggerConfetti } from '../utils/confetti';
import GlobalSearch from './GlobalSearch';
import ReceiptScanner from './ReceiptScanner';

export default function Layout() {
  const { data, addTransaction, toggleDarkMode, toast } = useContext(DuitinContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Navigasi gesture swipe
  const navTabs = ['/', '/transactions', '/accounts', '/budgets-goals', '/bills-debts', '/profile'];
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Pastikan gestur adalah geser horizontal nyata, bukan scroll vertikal
    if (Math.abs(diffX) > 65 && Math.abs(diffY) < 45) {
      const currentIndex = navTabs.indexOf(location.pathname);
      if (currentIndex !== -1) {
        if (diffX > 0 && currentIndex < navTabs.length - 1) {
          // Geser ke kiri -> Halaman berikutnya
          navigate(navTabs[currentIndex + 1]);
        } else if (diffX < 0 && currentIndex > 0) {
          // Geser ke kanan -> Halaman sebelumnya
          navigate(navTabs[currentIndex - 1]);
        }
      }
    }
  };

  // State form dengan format ribuan interaktif
  const [form, setForm] = useState({
    type: 'expense',
    rawAmount: '',
    title: '',
    category: data.categories.expense[0]?.name || 'Makanan & Minuman',
    accountId: data.accounts[0]?.id || '',
    toAccountId: data.accounts[1]?.id || '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleAmountChange = (e) => {
    const formatted = formatInputDigits(e.target.value);
    setForm(prev => ({ ...prev, rawAmount: formatted }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseInputDigits(form.rawAmount);
    if (numericAmount <= 0) return alert('Masukkan nominal yang valid');
    if (form.type === 'transfer' && form.accountId === form.toAccountId) {
      return alert('Dompet sumber dan tujuan tidak boleh sama');
    }

    addTransaction({
      type: form.type,
      amount: numericAmount,
      title: form.title || (form.type === 'transfer' ? 'Transfer Saldo' : form.category),
      category: form.category,
      accountId: form.accountId || data.accounts[0]?.id,
      toAccountId: form.toAccountId,
      date: form.date,
      note: form.note
    });

    triggerConfetti();
    setShowModal(false);
    setForm({
      type: 'expense',
      rawAmount: '',
      title: '',
      category: data.categories.expense[0]?.name || 'Makanan & Minuman',
      accountId: data.accounts[0]?.id || '',
      toAccountId: data.accounts[1]?.id || '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Browser tidak mendukung input suara.');

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      let type = 'expense';
      if (text.includes('pemasukan') || text.includes('gaji') || text.includes('dapat')) type = 'income';

      const numbers = text.match(/\d+/g);
      let detected = numbers ? numbers.join('') : '';

      setForm(prev => ({
        ...prev,
        type,
        rawAmount: formatInputDigits(detected),
        title: text,
        note: `Input suara: "${text}"`
      }));
    };
    recognition.start();
  };

  const desktopMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Dompet', path: '/accounts', icon: Wallet },
    { name: 'Target', path: '/budgets-goals', icon: Target },
    { name: 'Tagihan', path: '/bills-debts', icon: Receipt },
    { name: 'Kalender', path: '/calendar', icon: Calendar },
    { name: 'Laporan', path: '/reports', icon: BarChart3 },
    { name: 'Asisten', path: '/assistant', icon: Bot },
    { name: 'Akun & Profil', path: '/profile', icon: User },
  ];

  const mobileMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Dompet', path: '/accounts', icon: Wallet },
    { name: 'Target', path: '/budgets-goals', icon: Target },
    { name: 'Tagihan', path: '/bills-debts', icon: Receipt },
    { name: 'Akun', path: '/profile', icon: User },
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 select-none"
    >
      {/* Toast Notifikasi */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white dark:bg-emerald-500 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-bounce flex items-center space-x-2">
          <span>✨</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Duitin.</span>
            </div>
            <button onClick={toggleDarkMode} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl">
              {data.settings?.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={() => setShowSearch(true)} 
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold transition"
            >
              <Search size={14} />
              <span>Cari</span>
            </button>
            <button 
              onClick={() => setShowScanner(true)} 
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold transition"
              title="Pindai Struk"
            >
              <Camera size={16} />
            </button>
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Catat Transaksi</span>
          </button>

          <nav className="space-y-1">
            {desktopMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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

        <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <span>Duitin Mobile-Ready</span>
          <span className="font-semibold text-emerald-500">v3.0</span>
        </div>
      </aside>

      {/* Konten Halaman */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Floating Action Button (FAB) Mobile */}
      <button 
        onClick={() => setShowModal(true)} 
        className="lg:hidden fixed right-4 bottom-20 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 px-1 pb-safe z-30">
        {mobileMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-all ${
                  isActive ? 'text-emerald-500 scale-105' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon size={19} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Modal Catat Transaksi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Catat Transaksi</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'expense' })} 
                className={`py-2 rounded-lg transition ${form.type === 'expense' ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm' : 'text-gray-500'}`}
              >
                Pengeluaran
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'income' })} 
                className={`py-2 rounded-lg transition ${form.type === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-500'}`}
              >
                Pemasukan
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'transfer' })} 
                className={`py-2 rounded-lg transition ${form.type === 'transfer' ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm' : 'text-gray-500'}`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold">Nominal (Rp)</label>
                <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700 focus-within:border-emerald-500">
                  <span className="text-lg font-bold text-gray-400 mr-2">Rp</span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={form.rawAmount}
                    onChange={handleAmountChange}
                    className="w-full text-2xl font-black bg-transparent outline-none py-2"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-emerald-500'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold">Keterangan</label>
                <input
                  type="text"
                  placeholder="Misal: Sarapan Pagi, Beli Bensin"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none"
                />
              </div>

              {form.type !== 'transfer' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold">Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                    >
                      {data.categories[form.type]?.map(cat => (
                        <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold">Dari Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold">Ke Dompet</label>
                    <select
                      value={form.toAccountId}
                      onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-semibold">Tanggal</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold">Catatan</label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pencarian & Pemindai */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <ReceiptScanner isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
