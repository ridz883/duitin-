import React, { useState, useContext, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Target, 
  Receipt, 
  User, 
  Search, 
  Bell, 
  Plus, 
  X, 
  Mic, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Bot
} from 'lucide-react';
import { DuitinContext, formatNumberWithDots, parseNumberFromDots } from '../context/DuitinContext';
import { triggerConfetti } from '../utils/confetti';
import GlobalSearch from './GlobalSearch';
import ReceiptScanner from './ReceiptScanner';

export default function Layout() {
  const { data, addTransaction, installPwa, isPwaInstalled, toast } = useContext(DuitinContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Gesture Swipe Layar Antar-Halaman
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

    if (Math.abs(diffX) > 65 && Math.abs(diffY) < 45) {
      const currentIndex = navTabs.indexOf(location.pathname);
      if (currentIndex !== -1) {
        if (diffX > 0 && currentIndex < navTabs.length - 1) {
          navigate(navTabs[currentIndex + 1]);
        } else if (diffX < 0 && currentIndex > 0) {
          navigate(navTabs[currentIndex - 1]);
        }
      }
    }
  };

  // Form State dengan Format Ribuan Interaktif (10.000)
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
    const formatted = formatNumberWithDots(e.target.value);
    setForm(prev => ({ ...prev, rawAmount: formatted }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseNumberFromDots(form.rawAmount);
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
        rawAmount: formatNumberWithDots(detected),
        title: text,
        note: `Input suara: "${text}"`
      }));
    };
    recognition.start();
  };

  const sidebarMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets-goals', icon: Target },
    { name: 'Wallets & Cards', path: '/accounts', icon: Wallet },
    { name: 'Upcoming Bills', path: '/bills-debts', icon: Receipt },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Assistant', path: '/assistant', icon: Bot },
    { name: 'Account & Settings', path: '/profile', icon: User },
  ];

  const mobileBottomMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Dompet', path: '/accounts', icon: Wallet },
    { name: 'Target', path: '/budgets-goals', icon: Target },
    { name: 'Akun', path: '/profile', icon: User },
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white dark:bg-emerald-500 px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <Sparkles size={16} className="text-emerald-400 dark:text-white" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Desktop Bergaya Finora */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800/80 p-5 justify-between">
        <div className="space-y-6">
          {/* Logo Finora Style */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 2 1.5 3.5 3.5 3.5c1.8 0 3.2-1 4.5-2.5C14 10 17 8 17 8z"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Duitin</span>
              <p className="text-[10px] text-slate-400 font-medium">Smart Finance. Better Tomorrow.</p>
            </div>
          </div>

          {/* Tombol Install PWA di Sidebar */}
          <button
            onClick={installPwa}
            className="w-full flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 transition shadow-sm"
          >
            <span className="flex items-center space-x-2">
              <Smartphone size={16} />
              <span>{isPwaInstalled ? 'Aplikasi Terpasang ✓' : 'Pasang Aplikasi PWA'}</span>
            </span>
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Free</span>
          </button>

          {/* Menu Navigasi Finora */}
          <nav className="space-y-1">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#0f766e] text-white shadow-md shadow-teal-700/20 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
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

        {/* Card Motivasi Bawah Sidebar (Identik Finora) */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border border-emerald-100/60 dark:border-emerald-800/40 text-center space-y-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            🌱
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">
            Small steps build big wealth
          </h4>
          <p className="text-[10px] text-slate-500">Track. Save. Grow.</p>
          <button 
            onClick={() => navigate('/budgets-goals')}
            className="w-full bg-[#0f766e] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-teal-800 transition shadow-sm"
          >
            Set a Goal →
          </button>
        </div>
      </aside>

      {/* Konten Halaman & Top Bar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Finora */}
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
          {/* Search Bar Tengah */}
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setShowSearch(true)}
              placeholder="Search transactions, categories, or anything..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-full pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-emerald-500 transition"
            />
          </div>

          {/* Sisi Kanan: Notifikasi & Profil Finora */}
          <div className="flex items-center space-x-4 pl-4">
            <button 
              onClick={() => navigate('/bills-debts')} 
              className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {data.bills.filter(b => !b.isPaid).length || 1}
              </span>
            </button>

            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition"
            >
              <img 
                src={data.profile?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/50" 
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">{data.profile?.name || 'Ayesha Khan'}</p>
                <p className="text-[10px] text-slate-400">{data.profile?.tier || 'Premium Member'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Area Scroll Halaman */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button Mobile */}
      <button 
        onClick={() => setShowModal(true)} 
        className="lg:hidden fixed right-4 bottom-20 z-40 bg-[#0f766e] text-white p-4 rounded-full shadow-xl shadow-teal-700/40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-around items-center py-2 px-1 pb-safe z-30">
        {mobileBottomMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 text-[10px] font-semibold transition-all ${
                  isActive ? 'text-[#0f766e] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={19} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Modal Input Transaksi dengan Format 10.000 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Catat Transaksi</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 text-xs font-semibold">
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'expense' })} 
                className={`py-2 rounded-xl transition ${form.type === 'expense' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
              >
                Pengeluaran
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'income' })} 
                className={`py-2 rounded-xl transition ${form.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
              >
                Pemasukan
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, type: 'transfer' })} 
                className={`py-2 rounded-xl transition ${form.type === 'transfer' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500'}`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nominal Otomatis Format Titik Ribuan (10.000) */}
              <div>
                <label className="text-xs text-slate-400 font-bold">Nominal (Rp)</label>
                <div className="relative flex items-center border-b-2 border-slate-200 dark:border-slate-700 focus-within:border-teal-600">
                  <span className="text-xl font-black text-slate-400 mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="10.000"
                    value={form.rawAmount}
                    onChange={handleAmountChange}
                    className="w-full text-2xl font-black bg-transparent outline-none py-2 text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-600'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold">Keterangan Transaksi</label>
                <input
                  type="text"
                  placeholder="Misal: Starbucks Coffee, Belanja Sayur"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                />
              </div>

              {form.type !== 'transfer' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
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
                    <label className="text-xs text-slate-400 font-bold">Dari Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Ke Dompet</label>
                    <select
                      value={form.toAccountId}
                      onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold">Tanggal</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold">Catatan</label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f766e] hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-teal-700/20 active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <ReceiptScanner isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
