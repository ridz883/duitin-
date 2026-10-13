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
  BarChart3,
  Calendar,
  Bot,
  Moon,
  Sun
} from 'lucide-react';
import { 
  DuitinContext, 
  formatIDR, 
  formatNumberWithDots, 
  parseNumberFromDots, 
  triggerConfetti 
} from '../context/DuitinContext';

export default function Layout() {
  const { data, addTransaction, toggleDarkMode, installPwa, isPwaInstalled, toast } = useContext(DuitinContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Navigasi Geser Layar (Swipe Kanan/Kiri)
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
    if (Math.abs(diffX) > 70 && Math.abs(diffY) < 45) {
      const idx = navTabs.indexOf(location.pathname);
      if (idx !== -1) {
        if (diffX > 0 && idx < navTabs.length - 1) navigate(navTabs[idx + 1]);
        else if (diffX < 0 && idx > 0) navigate(navTabs[idx - 1]);
      }
    }
  };

  const getFirstCatName = (type) => {
    const list = data.categories?.[type] || [];
    if (list.length === 0) return 'Lainnya';
    return typeof list[0] === 'string' ? list[0] : list[0].name;
  };

  const [form, setForm] = useState({
    type: 'expense',
    rawAmount: '',
    title: '',
    category: getFirstCatName('expense'),
    accountId: data.accounts?.[0]?.id || '',
    toAccountId: data.accounts?.[1]?.id || '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseNumberFromDots(form.rawAmount);
    if (numericAmount <= 0) return alert('Masukkan nominal transaksi yang valid!');
    if (data.accounts.length === 0) {
      alert('Silakan buat Dompet terlebih dahulu di menu Dompet.');
      setShowModal(false);
      navigate('/accounts');
      return;
    }
    const targetAccId = form.accountId || data.accounts[0]?.id;
    if (form.type === 'transfer' && targetAccId === form.toAccountId) {
      return alert('Dompet asal dan tujuan tidak boleh sama!');
    }

    addTransaction({
      type: form.type,
      amount: numericAmount,
      title: form.title || (form.type === 'transfer' ? 'Transfer Saldo' : form.category),
      category: form.category,
      accountId: targetAccId,
      fromAccountId: targetAccId,
      toAccountId: form.toAccountId,
      date: form.date,
      note: form.note
    });

    triggerConfetti();
    setShowModal(false);
    setForm({
      ...form,
      rawAmount: '',
      title: '',
      note: ''
    });
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Browser Anda belum mendukung fitur suara.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      const numbers = text.match(/\d+/g);
      const detected = numbers ? numbers.join('') : '';
      setForm(prev => ({
        ...prev,
        rawAmount: formatNumberWithDots(detected),
        title: text
      }));
    };
    recognition.start();
  };

  const sidebarMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Anggaran & Target', path: '/budgets-goals', icon: Target },
    { name: 'Dompet & Kartu', path: '/accounts', icon: Wallet },
    { name: 'Tagihan & Utang', path: '/bills-debts', icon: Receipt },
    { name: 'Kalender', path: '/calendar', icon: Calendar },
    { name: 'Laporan', path: '/reports', icon: BarChart3 },
    { name: 'Asisten Duitin', path: '/assistant', icon: Bot },
    { name: 'Akun & Profil', path: '/profile', icon: User },
  ];

  const mobileBottomMenu = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Dompet', path: '/accounts', icon: Wallet },
    { name: 'Target', path: '/budgets-goals', icon: Target },
    { name: 'Tagihan', path: '/bills-debts', icon: Receipt },
    { name: 'Akun', path: '/profile', icon: User },
  ];

  const matchedTx = searchQuery.trim()
    ? (data.transactions || []).filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen overflow-hidden bg-[#f4f7f6] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 font-sans"
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0f766e] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
          ✨ {toast.message}
        </div>
      )}

      {/* Sidebar Desktop Finora */}
      <aside className="hidden lg:flex flex-col w-[250px] bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 p-5 justify-between shrink-0">
        <div className="space-y-5">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#064e3b] to-[#10b981] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
              D
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Duitin</span>
              <p className="text-[10px] text-slate-400 font-medium">Smart Finance. Better Tomorrow.</p>
            </div>
          </div>

          <button
            onClick={installPwa}
            className="w-full flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 transition"
          >
            <span className="flex items-center space-x-2">
              <Smartphone size={15} />
              <span>{isPwaInstalled ? 'PWA Terpasang ✓' : 'Install Aplikasi PWA'}</span>
            </span>
            <span className="bg-[#0f766e] text-white text-[9px] px-2 py-0.5 rounded-full">App</span>
          </button>

          <nav className="space-y-1">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#0f766e] text-white shadow-md shadow-teal-700/20 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-800/40 text-center space-y-2">
          <div className="text-xl">🌱</div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            Small steps build big wealth
          </h4>
          <p className="text-[10px] text-slate-500">Track. Save. Grow.</p>
          <button 
            onClick={() => navigate('/budgets-goals')}
            className="w-full bg-[#0f766e] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-teal-800 transition"
          >
            Set a Goal →
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar Finora */}
        <header className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setShowSearch(true)}
              placeholder="Cari transaksi, kategori, atau catatan..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-full pl-9 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4 pl-3">
            <button
              onClick={installPwa}
              className="lg:hidden p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600"
              title="Install Aplikasi PWA"
            >
              <Smartphone size={17} />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              {data.settings?.darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button 
              onClick={() => navigate('/bills-debts')} 
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Bell size={17} />
              {(data.bills || []).filter(b => !b.isPaid).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {(data.bills || []).filter(b => !b.isPaid).length}
                </span>
              )}
            </button>

            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
            >
              {data.profile?.avatar ? (
                <img src={data.profile.avatar} alt="Profil" className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white font-bold text-xs flex items-center justify-center">
                  {(data.profile?.name || 'P')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{data.profile?.name || 'Pengguna'}</p>
                <p className="text-[10px] text-slate-400">{data.profile?.tier || 'Personal Account'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Tombol Tambah Transaksi (+) */}
      <button 
        onClick={() => setShowModal(true)} 
        className="fixed right-4 bottom-20 lg:bottom-8 z-40 bg-[#0f766e] hover:bg-teal-800 text-white p-4 rounded-full shadow-xl shadow-teal-700/40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Mobile (Tetap ada beserta ikonnya + bisa digeser layar) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-around items-center py-2 px-1 pb-safe z-30">
        {mobileBottomMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-all ${
                  isActive ? 'text-[#0f766e] scale-105 font-bold' : 'text-slate-400'
                }`
              }
            >
              <Icon size={18} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Modal Catat Transaksi dengan Format Titik Ribuan Otomatis (10.000) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black">Catat Transaksi Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 text-xs font-bold">
              {['expense', 'income', 'transfer'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t, category: getFirstCatName(t === 'income' ? 'income' : 'expense') })}
                  className={`py-2 rounded-xl transition ${
                    form.type === t 
                      ? 'bg-white dark:bg-slate-700 text-[#0f766e] dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold">Nominal (Otomatis Titik Ribuan)</label>
                <div className="relative flex items-center border-b-2 border-slate-200 dark:border-slate-700 focus-within:border-[#0f766e]">
                  <span className="text-xl font-black text-slate-400 mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="10.000"
                    value={form.rawAmount}
                    onChange={(e) => setForm({ ...form, rawAmount: formatNumberWithDots(e.target.value) })}
                    className="w-full text-2xl font-black bg-transparent outline-none py-2"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400'}`}
                  >
                    <Mic size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold">Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Makan Siang, Gaji, Kopi"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                />
              </div>

              {form.type !== 'transfer' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Dompet</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.length === 0 && <option value="">Buat dompet dulu</option>}
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {(data.categories?.[form.type] || []).map(cat => {
                        const name = typeof cat === 'string' ? cat : cat.name;
                        return <option key={name} value={name}>{name}</option>;
                      })}
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
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Ke Dompet</label>
                    <select
                      value={form.toAccountId}
                      onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 font-bold">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f766e] hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl transition shadow-lg"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pencarian Global */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik nama transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
              <button onClick={() => setShowSearch(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {matchedTx.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">Tidak ada hasil ditemukan.</p>
              ) : (
                matchedTx.map(t => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between text-xs">
                    <div>
                      <p className="font-bold">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.date} • {t.category}</p>
                    </div>
                    <span className="font-bold">{formatIDR(t.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
