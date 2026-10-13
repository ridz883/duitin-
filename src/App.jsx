import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  Eye,
  EyeOff,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  CheckCircle2,
  Camera,
  Download,
  Upload,
  Info,
  ShieldCheck,
  Check,
  Send,
  PlusCircle,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from 'recharts';

const STORAGE_KEY = 'duitin_finora_master_v7';

// --- FUNGSI FORMAT MATA UANG INTERAKTIF (10000 -> 10.000) ---
const formatDots = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const digits = val.toString().replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseDots = (val) => {
  if (!val) return 0;
  const digits = val.toString().replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value) || 0);
};

// --- EFEK KONFETI MANDIRI ---
const fireConfetti = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 65 }).map(() => ({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.45,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 1) * 10 - 3,
      angle: Math.random() * 360,
      vAngle: (Math.random() - 0.5) * 10,
      alpha: 1
    }));

    const start = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = Date.now() - start;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.angle += p.vAngle;
        if (elapsed > 1400) p.alpha = Math.max(0, p.alpha - 0.04);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (elapsed < 2200) {
        requestAnimationFrame(render);
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
    render();
  } catch (err) {
    console.log(err);
  }
};

// --- DATA AWAL BERSIH (MULAI DARI RP 0) ---
const defaultData = {
  profile: {
    name: 'Pengguna',
    bio: 'Smart Finance. Better Tomorrow.',
    avatar: '',
    tier: 'Personal Member'
  },
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  bills: [],
  debts: [],
  categories: {
    income: [
      { id: 'inc_1', name: 'Gaji', color: '#10b981' },
      { id: 'inc_2', name: 'Uang Saku', color: '#0ea5e9' },
      { id: 'inc_3', name: 'Freelance', color: '#f59e0b' },
      { id: 'inc_4', name: 'Bonus', color: '#8b5cf6' },
      { id: 'inc_5', name: 'Lainnya', color: '#64748b' }
    ],
    expense: [
      { id: 'exp_1', name: 'Makanan & Minuman', color: '#10b981' },
      { id: 'exp_2', name: 'Transportasi', color: '#0ea5e9' },
      { id: 'exp_3', name: 'Belanja', color: '#ec4899' },
      { id: 'exp_4', name: 'Tagihan', color: '#f59e0b' },
      { id: 'exp_5', name: 'Hiburan', color: '#8b5cf6' },
      { id: 'exp_6', name: 'Lainnya', color: '#64748b' }
    ]
  },
  settings: {
    darkMode: false,
    hideBalance: false
  }
};

export default function App() {
  // State Utama dengan Proteksi Anti-Crash
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultData;
      const parsed = JSON.parse(saved);
      return {
        ...defaultData,
        ...parsed,
        profile: { ...defaultData.profile, ...(parsed.profile || {}) },
        settings: { ...defaultData.settings, ...(parsed.settings || {}) },
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        bills: Array.isArray(parsed.bills) ? parsed.bills : [],
        debts: Array.isArray(parsed.debts) ? parsed.debts : [],
        categories: parsed.categories?.expense ? parsed.categories : defaultData.categories
      };
    } catch {
      return defaultData;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  // Modal States
  const [showTxModal, setShowTxModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [topupModal, setTopupModal] = useState({ open: false, type: '', id: '', title: '', rawAmount: '' });

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Simpan ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  // Mode Gelap
  useEffect(() => {
    if (data.settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings?.darkMode]);

  // Deteksi PWA
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    });
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') showToast('Aplikasi Duitin berhasil dipasang!');
      setDeferredPrompt(null);
    } else {
      setShowPwaGuide(true);
    }
  };

  // --- HITUNG SALDO AKUN ---
  const balances = {};
  (data.accounts || []).forEach((acc) => {
    balances[acc.id] = Number(acc.initialBalance || 0);
  });
  (data.transactions || []).forEach((tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === 'income' && balances[tx.accountId] !== undefined) {
      balances[tx.accountId] += amt;
    } else if (tx.type === 'expense' && balances[tx.accountId] !== undefined) {
      balances[tx.accountId] -= amt;
    } else if (tx.type === 'transfer') {
      if (balances[tx.fromAccountId] !== undefined) balances[tx.fromAccountId] -= amt;
      if (balances[tx.toAccountId] !== undefined) balances[tx.toAccountId] += amt;
    }
  });

  const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

  const displayMoney = (val) => (data.settings?.hideBalance ? 'Rp ••••••••' : formatIDR(val));

  // --- NAVIGASI SWIPE LAYAR (GESER KANAN/KIRI) ---
  const mainTabsOrder = ['dashboard', 'transactions', 'accounts', 'budgets', 'bills', 'profile'];
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
      const idx = mainTabsOrder.indexOf(activeTab);
      if (idx !== -1) {
        if (diffX > 0 && idx < mainTabsOrder.length - 1) setActiveTab(mainTabsOrder[idx + 1]);
        else if (diffX < 0 && idx > 0) setActiveTab(mainTabsOrder[idx - 1]);
      }
    }
  };

  // --- FORM TRANSAKSI MODAL ---
  const [txForm, setTxForm] = useState({
    type: 'expense',
    rawAmount: '',
    title: '',
    category: 'Makanan & Minuman',
    accountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [isListening, setIsListening] = useState(false);

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const amount = parseDots(txForm.rawAmount);
    if (amount <= 0) return alert('Masukkan nominal yang valid!');
    if (data.accounts.length === 0) {
      alert('Buat dompet terlebih dahulu di menu Dompet!');
      setShowTxModal(false);
      setActiveTab('accounts');
      return;
    }
    const accId = txForm.accountId || data.accounts[0]?.id;
    const toAccId = txForm.toAccountId || data.accounts[1]?.id || data.accounts[0]?.id;
    if (txForm.type === 'transfer' && accId === toAccId) {
      return alert('Dompet sumber dan tujuan tidak boleh sama!');
    }

    const newTx = {
      id: 'tx_' + Date.now(),
      type: txForm.type,
      amount,
      title: txForm.title || (txForm.type === 'transfer' ? 'Transfer Antar Dompet' : txForm.category),
      category: txForm.category,
      accountId: accId,
      fromAccountId: accId,
      toAccountId: toAccId,
      date: txForm.date,
      note: txForm.note
    };

    setData((prev) => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
    fireConfetti();
    showToast('Transaksi berhasil disimpan');
    setShowTxModal(false);
    setTxForm({ ...txForm, rawAmount: '', title: '', note: '' });
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Browser tidak mendukung input suara.');
    const rec = new SpeechRecognition();
    rec.lang = 'id-ID';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript.toLowerCase();
      const nums = text.match(/\d+/g);
      setTxForm((prev) => ({
        ...prev,
        rawAmount: nums ? formatDots(nums.join('')) : prev.rawAmount,
        title: text
      }));
    };
    rec.start();
  };

  // --- SUB-HALAMAN KOMPONEN ---

  // 1. DASHBOARD FINORA
  const renderDashboard = () => {
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const lastMonth = curMonth === 1 ? 12 : curMonth - 1;
    const lastMonthYear = curMonth === 1 ? curYear - 1 : curYear;

    let incThisMonth = 0;
    let expThisMonth = 0;
    let expLastMonth = 0;
    const catMap = {};

    (data.transactions || []).forEach((tx) => {
      const d = new Date(tx.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (m === curMonth && y === curYear) {
        if (tx.type === 'income') incThisMonth += Number(tx.amount);
        if (tx.type === 'expense') {
          expThisMonth += Number(tx.amount);
          catMap[tx.category] = (catMap[tx.category] || 0) + Number(tx.amount);
        }
      } else if (m === lastMonth && y === lastMonthYear && tx.type === 'expense') {
        expLastMonth += Number(tx.amount);
      }
    });

    const trendDiff = expLastMonth > 0 ? Math.round(((expThisMonth - expLastMonth) / expLastMonth) * 100) : 0;

    const palette = ['#10b981', '#0ea5e9', '#ec4899', '#f59e0b', '#8b5cf6', '#64748b'];
    const donutData = Object.keys(catMap).map((k, idx) => ({
      name: k,
      value: catMap[k],
      pct: expThisMonth > 0 ? Math.round((catMap[k] / expThisMonth) * 100) : 0,
      color: palette[idx % palette.length]
    }));
    const emptyDonut = [{ name: 'Kosong', value: 1, color: '#e2e8f0' }];

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const barData = monthLabels.map((mName, i) => {
      let total = 0;
      (data.transactions || []).forEach((t) => {
        const d = new Date(t.date);
        if (t.type === 'expense' && d.getMonth() === i && d.getFullYear() === curYear) {
          total += Number(t.amount);
        }
      });
      return { month: mName, amount: total };
    });

    const totalBudget = (data.budgets || []).reduce((a, b) => a + Number(b.limit), 0);
    const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((expThisMonth / totalBudget) * 100)) : 0;
    const unpaidBills = (data.bills || []).filter((b) => !b.isPaid);

    return (
      <div className="p-4 sm:p-6 lg:p-7 max-w-[1380px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Hero Finora Emerald Card (7 Col) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] text-white p-6 sm:p-7 shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>Good Morning, {data.profile?.name || 'Pengguna'}</span>
                    <span>☀️</span>
                  </h2>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    {data.profile?.bio || 'Your financial journey is going great!'}
                  </p>
                </div>
                <span className="bg-emerald-900/60 backdrop-blur-md text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
                  ✓ Healthy
                </span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-200/90 text-xs font-semibold mb-1">
                    <span>Total Balance</span>
                    <button
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, hideBalance: !prev.settings.hideBalance }
                        }))
                      }
                      className="hover:text-white transition"
                    >
                      {data.settings?.hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">
                    {displayMoney(totalBalance)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-bold text-emerald-200">
                    <TrendingUp size={15} />
                    <span>Pemasukan Bulan Ini: {displayMoney(incThisMonth)}</span>
                    {expLastMonth > 0 && (
                      <span className="bg-white/15 px-2 py-0.5 rounded-full text-[10px]">
                        {trendDiff > 0 ? `↑ ${trendDiff}%` : `↓ ${Math.abs(trendDiff)}%`} vs bln lalu
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex items-center justify-center p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <span className="text-3xl">💳</span>
                </div>
              </div>
            </div>

            {/* 5 Quick Actions Finora */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
              {[
                {
                  label: 'Send / Transfer',
                  icon: Send,
                  color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
                  onClick: () => {
                    setTxForm({ ...txForm, type: 'transfer' });
                    setShowTxModal(true);
                  }
                },
                {
                  label: 'Add Money',
                  icon: PlusCircle,
                  color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50',
                  onClick: () => {
                    setTxForm({ ...txForm, type: 'income', category: 'Gaji' });
                    setShowTxModal(true);
                  }
                },
                {
                  label: 'Pay Bills',
                  icon: Receipt,
                  color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
                  onClick: () => setActiveTab('bills')
                },
                {
                  label: 'Wallets',
                  icon: Wallet,
                  color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50',
                  onClick: () => setActiveTab('accounts')
                },
                {
                  label: 'Install PWA',
                  icon: Smartphone,
                  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
                  onClick: handleInstallPwa
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 ${item.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kanan: Spending Overview Donut + Grow Card (5 Col) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Spending Overview</h3>
                <span className="text-[11px] font-bold text-slate-400">This Month</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="w-36 h-36 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData.length > 0 ? donutData : emptyDonut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={62}
                        paddingAngle={3}
                      >
                        {(donutData.length > 0 ? donutData : emptyDonut).map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                    <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">
                      {displayMoney(expThisMonth)}
                    </span>
                    <span className="text-[9px] text-slate-400">Total Spent</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  {donutData.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Belum ada pengeluaran bulan ini.</p>
                  ) : (
                    donutData.slice(0, 4).map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="truncate text-[11px] text-slate-600 dark:text-slate-300">{d.name}</span>
                        </div>
                        <span className="font-bold text-[11px]">{d.pct}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
              <div>
                <div className="text-emerald-700 dark:text-emerald-300 text-xs font-black mb-1">
                  🌱 Grow Your Money
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 max-w-[210px]">
                  Mulai menabung hari ini untuk masa depan finansial yang lebih cerah.
                </p>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="bg-[#0f766e] hover:bg-teal-800 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition"
                >
                  Set Savings Goal →
                </button>
              </div>
              <div className="text-4xl pr-2">📈</div>
            </div>
          </div>
        </div>

        {/* Baris 2: Monthly Spending, Budget Progress, Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Monthly Spending</h3>
              <span className="text-[11px] font-bold text-slate-400">{curYear}</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => formatIDR(val)} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Budget Progress</h3>
              <span onClick={() => setActiveTab('budgets')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">
                View All →
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center shrink-0">
                <span className="text-base font-black">{budgetPct}%</span>
                <span className="text-[9px] text-slate-400">Used</span>
              </div>
              <div className="flex-1 space-y-1 text-xs">
                <p className="text-slate-400 text-[11px]">Batas Anggaran:</p>
                <p className="font-black text-sm">{displayMoney(totalBudget)}</p>
                <p className="text-[10px] text-slate-400">Terpakai: {displayMoney(expThisMonth)}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <span>🏆</span>
              <span>
                {totalBudget === 0
                  ? 'Belum ada anggaran. Atur batas belanja di menu Target.'
                  : `Anda telah memakai ${budgetPct}% dari anggaran bulanan.`}
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Upcoming Bills</h3>
              <span onClick={() => setActiveTab('bills')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">
                View All →
              </span>
            </div>

            {unpaidBills.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Tidak ada tagihan tertunda.</p>
            ) : (
              <div className="space-y-2.5">
                {unpaidBills.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 bg-amber-50 dark:bg-amber-950">
                        <Zap size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{b.name}</p>
                        <p className="text-[10px] text-slate-400">{b.dueDate}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black">{displayMoney(b.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Baris 3: Recent Transactions & Motivational Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Recent Transactions</h3>
              <span onClick={() => setActiveTab('transactions')} className="text-[11px] font-bold text-emerald-600 cursor-pointer">
                View All →
              </span>
            </div>

            {(data.transactions || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Belum ada transaksi. Klik tombol (+) di kanan bawah untuk mencatat transaksi pertama Anda.
              </p>
            ) : (
              <div className="space-y-2">
                {data.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">{tx.title}</h4>
                        <p className="text-[10px] text-slate-400">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'expense' ? '-' : '+'}
                        {displayMoney(tx.amount)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Hapus transaksi ini?')) {
                            setData((prev) => ({
                              ...prev,
                              transactions: prev.transactions.filter((t) => t.id !== tx.id)
                            }));
                            showToast('Transaksi dihapus');
                          }
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-gradient-to-tr from-emerald-100/70 via-teal-50/60 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-2xl">🌱</span>
              <h3 className="text-base font-black leading-snug">"Better money habits, a brighter future."</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tips: Anda dapat menggeser layar (*swipe* kanan/kiri) untuk berpindah halaman dengan cepat.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span>Duitin Finora UI</span>
              <span>by ridzz</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. TRANSAKSI PAGE
  const [txFilter, setTxFilter] = useState('all');
  const renderTransactions = () => {
    const list = (data.transactions || []).filter((t) => txFilter === 'all' || t.type === txFilter);
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black">Riwayat Transaksi</h1>
            <p className="text-xs text-slate-500">Semua catatan pemasukan, pengeluaran, dan transfer.</p>
          </div>
          <div className="flex space-x-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {['all', 'expense', 'income', 'transfer'].map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1.5 rounded-xl capitalize ${
                  txFilter === f ? 'bg-[#0f766e] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'expense' ? 'Keluar' : f === 'income' ? 'Masuk' : 'Transfer'}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 text-xs">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((tx) => (
              <div
                key={tx.id}
                className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">{tx.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {tx.date} • {tx.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-black text-xs sm:text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}
                    {formatIDR(tx.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) {
                        setData((prev) => ({
                          ...prev,
                          transactions: prev.transactions.filter((t) => t.id !== tx.id)
                        }));
                        showToast('Transaksi dihapus');
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 3. DOMPET & REKENING (INPUT SALDO 10.000)
  const [accForm, setAccForm] = useState({ name: '', type: 'cash', rawBalance: '' });
  const renderAccounts = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Dompet & Rekening</h1>
        <p className="text-xs text-slate-500">Tambah sumber dana dengan format nominal titik ribuan otomatis.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!accForm.name.trim()) return;
          const newAcc = {
            id: 'acc_' + Date.now(),
            name: accForm.name.trim(),
            type: accForm.type,
            initialBalance: parseDots(accForm.rawBalance)
          };
          setData((prev) => ({ ...prev, accounts: [...(prev.accounts || []), newAcc] }));
          setAccForm({ name: '', type: 'cash', rawBalance: '' });
          fireConfetti();
          showToast('Dompet baru berhasil dibuat!');
        }}
        className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm"
      >
        <input
          type="text"
          required
          placeholder="Nama Dompet (BCA, GoPay, Tunai)"
          value={accForm.name}
          onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
        />
        <select
          value={accForm.type}
          onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
        >
          <option value="cash">Uang Tunai</option>
          <option value="bank">Rekening Bank</option>
          <option value="ewallet">E-Wallet</option>
        </select>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Saldo Awal (misal: 100.000)"
          value={accForm.rawBalance}
          onChange={(e) => setAccForm({ ...accForm, rawBalance: formatDots(e.target.value) })}
          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none"
        />
        <button type="submit" className="bg-[#0f766e] text-white py-3 rounded-2xl text-xs font-bold hover:bg-teal-800 transition">
          + Tambah Dompet
        </button>
      </form>

      {data.accounts.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 text-xs">
          Belum ada dompet. Silakan buat dompet pertama Anda pada form di atas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative"
            >
              <button
                onClick={() => {
                  if (confirm(`Hapus dompet "${acc.name}"?`)) {
                    setData((prev) => ({
                      ...prev,
                      accounts: prev.accounts.filter((a) => a.id !== acc.id),
                      transactions: prev.transactions.filter((t) => t.accountId !== acc.id)
                    }));
                    showToast('Dompet dihapus');
                  }
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 p-1"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl">
                  {acc.type === 'bank' ? <CreditCard size={20} /> : acc.type === 'cash' ? <Banknote size={20} /> : <Wallet size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{acc.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase">{acc.type}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Saldo Saat Ini</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {displayMoney(balances[acc.id] || 0)}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Saldo Awal: {formatIDR(acc.initialBalance)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 4. ANGGARAN & TARGET TABUNGAN (INPUT 10.000)
  const [bgForm, setBgForm] = useState({ category: 'Makanan & Minuman', rawLimit: '' });
  const [goalForm, setGoalForm] = useState({ name: '', rawTarget: '', targetDate: '' });

  const renderBudgetsAndGoals = () => {
    const curMonth = new Date().getMonth() + 1;
    const curYear = new Date().getFullYear();
    const catExp = {};
    (data.transactions || []).forEach((tx) => {
      const d = new Date(tx.date);
      if (tx.type === 'expense' && d.getMonth() + 1 === curMonth && d.getFullYear() === curYear) {
        catExp[tx.category] = (catExp[tx.category] || 0) + Number(tx.amount);
      }
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Seksi Anggaran */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-black">Anggaran Bulanan</h1>
            <p className="text-xs text-slate-500">Tetapkan batas pengeluaran per kategori.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const limit = parseDots(bgForm.rawLimit);
              if (limit <= 0) return;
              setData((prev) => ({
                ...prev,
                budgets: [...(prev.budgets || []), { id: 'bg_' + Date.now(), category: bgForm.category, limit }]
              }));
              setBgForm({ ...bgForm, rawLimit: '' });
              showToast('Anggaran disimpan');
            }}
            className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 shadow-sm"
          >
            <select
              value={bgForm.category}
              onChange={(e) => setBgForm({ ...bgForm, category: e.target.value })}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none flex-1"
            >
              {(data.categories?.expense || []).map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="Batas Anggaran (misal: 500.000)"
              value={bgForm.rawLimit}
              onChange={(e) => setBgForm({ ...bgForm, rawLimit: formatDots(e.target.value) })}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none flex-1"
            />
            <button type="submit" className="bg-[#0f766e] text-white px-5 py-3 rounded-2xl text-xs font-bold">
              + Buat Anggaran
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.budgets.map((b) => {
              const spent = catExp[b.category] || 0;
              const pct = Math.min(100, Math.round((spent / b.limit) * 100));
              return (
                <div key={b.id} className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 relative">
                  <button
                    onClick={() =>
                      setData((prev) => ({ ...prev, budgets: prev.budgets.filter((x) => x.id !== b.id) }))
                    }
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex justify-between pr-6">
                    <span className="font-bold text-xs">{b.category}</span>
                    <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${spent > b.limit ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Terpakai: {formatIDR(spent)}</span>
                    <span>Batas: {formatIDR(b.limit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seksi Target Tabungan */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black">Target Tabungan (Goals)</h2>
            <p className="text-xs text-slate-500">Wujudkan impian finansial Anda langkah demi langkah.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const targetAmount = parseDots(goalForm.rawTarget);
              if (!goalForm.name || targetAmount <= 0) return;
              setData((prev) => ({
                ...prev,
                goals: [
                  ...(prev.goals || []),
                  {
                    id: 'gl_' + Date.now(),
                    name: goalForm.name,
                    targetAmount,
                    currentAmount: 0,
                    targetDate: goalForm.targetDate || new Date().toISOString().split('T')[0]
                  }
                ]
              }));
              setGoalForm({ name: '', rawTarget: '', targetDate: '' });
              showToast('Target tabungan ditambahkan');
            }}
            className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm"
          >
            <input
              type="text"
              required
              placeholder="Nama Target (Beli Laptop)"
              value={goalForm.name}
              onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="Nominal Target (misal: 5.000.000)"
              value={goalForm.rawTarget}
              onChange={(e) => setGoalForm({ ...goalForm, rawTarget: formatDots(e.target.value) })}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none"
            />
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
            />
            <button type="submit" className="bg-[#0f766e] text-white py-3 rounded-2xl text-xs font-bold">
              + Simpan Target
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 relative">
                  <button
                    onClick={() =>
                      setData((prev) => ({ ...prev, goals: prev.goals.filter((x) => x.id !== g.id) }))
                    }
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex justify-between pr-6">
                    <span className="font-bold text-xs">{g.name}</span>
                    <span className="text-xs font-bold text-emerald-500">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Terkumpul: {formatIDR(g.currentAmount)}</span>
                    <span>Target: {formatIDR(g.targetAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Tenggat: {g.targetDate}</span>
                    <button
                      onClick={() => setTopupModal({ open: true, type: 'goal', id: g.id, title: g.name, rawAmount: '' })}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      + Tambah Simpanan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 5. TAGIHAN & UTANG (INPUT 10.000)
  const [billForm, setBillForm] = useState({ name: '', rawAmount: '', dueDate: '' });
  const [debtForm, setDebtForm] = useState({ person: '', type: 'debt', rawAmount: '' });

  const renderBillsAndDebts = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black">Tagihan Rutin (Bills)</h1>
          <p className="text-xs text-slate-500">Catat jadwal tagihan listrik, internet, dan langganan.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amount = parseDots(billForm.rawAmount);
            if (!billForm.name || amount <= 0) return;
            setData((prev) => ({
              ...prev,
              bills: [
                ...(prev.bills || []),
                {
                  id: 'bl_' + Date.now(),
                  name: billForm.name,
                  amount,
                  dueDate: billForm.dueDate || new Date().toISOString().split('T')[0],
                  isPaid: false
                }
              ]
            }));
            setBillForm({ name: '', rawAmount: '', dueDate: '' });
            showToast('Tagihan ditambahkan');
          }}
          className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm"
        >
          <input
            type="text"
            required
            placeholder="Nama Tagihan (WiFi, Listrik)"
            value={billForm.name}
            onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
          />
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="Nominal (misal: 250.000)"
            value={billForm.rawAmount}
            onChange={(e) => setBillForm({ ...billForm, rawAmount: formatDots(e.target.value) })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none"
          />
          <input
            type="date"
            value={billForm.dueDate}
            onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
          />
          <button type="submit" className="bg-[#0f766e] text-white py-3 rounded-2xl text-xs font-bold">
            + Simpan Tagihan
          </button>
        </form>

        <div className="space-y-2.5">
          {data.bills.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs">{b.name}</h4>
                <p className="text-[10px] text-slate-400">Jatuh Tempo: {b.dueDate}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-black text-xs">{formatIDR(b.amount)}</span>
                {b.isPaid ? (
                  <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Lunas
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        bills: prev.bills.map((x) => (x.id === b.id ? { ...x, isPaid: true } : x)),
                        transactions: [
                          {
                            id: 'tx_' + Date.now(),
                            type: 'expense',
                            amount: b.amount,
                            title: `Bayar Tagihan ${b.name}`,
                            category: 'Tagihan',
                            accountId: prev.accounts?.[0]?.id || '',
                            date: new Date().toISOString().split('T')[0]
                          },
                          ...(prev.transactions || [])
                        ]
                      }));
                      fireConfetti();
                      showToast('Tagihan lunas!');
                    }}
                    className="bg-[#0f766e] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl"
                  >
                    Bayar
                  </button>
                )}
                <button
                  onClick={() =>
                    setData((prev) => ({ ...prev, bills: prev.bills.filter((x) => x.id !== b.id) }))
                  }
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utang & Piutang */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black">Utang & Piutang</h2>
          <p className="text-xs text-slate-500">Catat pinjaman tanpa mencampur laporan konsumsi.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amount = parseDots(debtForm.rawAmount);
            if (!debtForm.person || amount <= 0) return;
            setData((prev) => ({
              ...prev,
              debts: [
                ...(prev.debts || []),
                {
                  id: 'db_' + Date.now(),
                  person: debtForm.person,
                  type: debtForm.type,
                  amount,
                  remaining: amount
                }
              ]
            }));
            setDebtForm({ person: '', type: 'debt', rawAmount: '' });
            showToast('Catatan disimpan');
          }}
          className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-sm"
        >
          <input
            type="text"
            required
            placeholder="Nama Orang"
            value={debtForm.person}
            onChange={(e) => setDebtForm({ ...debtForm, person: e.target.value })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
          />
          <select
            value={debtForm.type}
            onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
          >
            <option value="debt">Utang (Saya Pinjam)</option>
            <option value="receivable">Piutang (Dia Pinjam)</option>
          </select>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="Nominal (misal: 150.000)"
            value={debtForm.rawAmount}
            onChange={(e) => setDebtForm({ ...debtForm, rawAmount: formatDots(e.target.value) })}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none"
          />
          <button type="submit" className="bg-[#0f766e] text-white py-3 rounded-2xl text-xs font-bold">
            + Tambah Catatan
          </button>
        </form>

        <div className="space-y-2.5">
          {data.debts.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs">{d.person}</span>
                <p className="text-[10px] text-slate-400">
                  Sisa: {formatIDR(d.remaining)} dari {formatIDR(d.amount)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {d.remaining === 0 ? (
                  <span className="text-xs font-bold text-emerald-500">Lunas</span>
                ) : (
                  <button
                    onClick={() =>
                      setTopupModal({
                        open: true,
                        type: 'debt',
                        id: d.id,
                        title: `Cicilan ${d.person}`,
                        rawAmount: formatDots(d.remaining)
                      })
                    }
                    className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl"
                  >
                    Catat Pelunasan
                  </button>
                )}
                <button
                  onClick={() =>
                    setData((prev) => ({ ...prev, debts: prev.debts.filter((x) => x.id !== d.id) }))
                  }
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 6. AKUN, PROFIL, PWA, CUSTOM KATEGORI & TENTANG APLIKASI (ridzz)
  const [profForm, setProfForm] = useState({
    name: data.profile?.name || '',
    bio: data.profile?.bio || '',
    avatar: data.profile?.avatar || '',
    tier: data.profile?.tier || 'Personal Member'
  });
  const [catType, setCatType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  const renderProfile = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Akun & Pengaturan</h1>
        <p className="text-xs text-slate-500">Kelola profil pengguna, pasang PWA, kategori, dan cadangan data.</p>
      </div>

      {/* Menu Install PWA */}
      <div className="bg-gradient-to-br from-[#064e3b] to-[#0f766e] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Pasang Aplikasi Duitin (PWA)</h3>
            <p className="text-xs text-emerald-100">
              {isPwaInstalled
                ? 'Aplikasi sudah terpasang di layar utama perangkat Anda.'
                : 'Instal Duitin ke layar utama HP Android untuk akses cepat layar penuh.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleInstallPwa}
          className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shrink-0"
        >
          {isPwaInstalled ? 'Sudah Terpasang ✓' : 'Pasang Aplikasi'}
        </button>
      </div>

      {/* Edit Profil */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Edit Profil Pengguna</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setData((prev) => ({ ...prev, profile: { ...prev.profile, ...profForm } }));
            fireConfetti();
            showToast('Profil berhasil disimpan ke LocalStorage!');
          }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profForm.avatar ? (
                <img src={profForm.avatar} alt="Avatar" className="w-16 h-16 rounded-3xl object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-[#0f766e] text-white font-black text-2xl flex items-center justify-center">
                  {(profForm.name || 'P')[0].toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1.5 rounded-xl cursor-pointer hover:bg-emerald-600">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = (ev) => setProfForm((prev) => ({ ...prev, avatar: ev.target.result }));
                      r.readAsDataURL(f);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-bold">Nama Pengguna</label>
              <input
                type="text"
                required
                value={profForm.name}
                onChange={(e) => setProfForm({ ...profForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-bold">Bio / Tagline</label>
              <input
                type="text"
                value={profForm.bio}
                onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold">Status Member</label>
              <input
                type="text"
                value={profForm.tier}
                onChange={(e) => setProfForm({ ...profForm, tier: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-[#0f766e] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shadow-md">
            <Check size={16} /> Simpan Profil
          </button>
        </form>
      </div>

      {/* Custom Kategori + Color Picker */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Custom Kategori & Warna</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setCatType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setCatType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
          >
            Pemasukan
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCatName.trim()) return;
            const newItem = { id: 'cat_' + Date.now(), name: newCatName.trim(), color: newCatColor };
            setData((prev) => ({
              ...prev,
              categories: { ...prev.categories, [catType]: [...(prev.categories?.[catType] || []), newItem] }
            }));
            setNewCatName('');
            showToast('Kategori baru ditambahkan');
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Kategori Baru..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
            />
            <button type="submit" className="bg-[#0f766e] text-white px-4 py-2.5 rounded-2xl text-xs font-bold">
              + Tambah
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Warna:</span>
            {['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewCatColor(c)}
                className={`w-6 h-6 rounded-full ${newCatColor === c ? 'scale-125 ring-2 ring-emerald-500' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {(data.categories?.[catType] || []).map((c) => (
            <div key={c.id || c.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color || '#10b981' }} />
                <span className="font-semibold truncate">{c.name}</span>
              </div>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    categories: {
                      ...prev.categories,
                      [catType]: prev.categories[catType].filter((x) => (x.id || x.name) !== (c.id || c.name))
                    }
                  }))
                }
                className="text-slate-400 hover:text-rose-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Cadangan Data (Backup & Restore)</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Duitin_Backup_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              showToast('Backup diunduh');
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0f766e] text-white py-2.5 rounded-2xl text-xs font-bold"
          >
            <Download size={14} /> Ekspor Data (.JSON)
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-2.5 rounded-2xl text-xs font-bold cursor-pointer">
            <Upload size={14} /> Impor Data (.JSON)
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = (ev) => {
                  try {
                    setData(JSON.parse(ev.target.result));
                    showToast('Data berhasil dipulihkan!');
                  } catch {
                    alert('File tidak valid');
                  }
                };
                r.readAsText(f);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Tentang Aplikasi */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm flex items-center space-x-2">
          <Info size={16} className="text-emerald-500" />
          <span>Tentang Aplikasi Duitin</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Duitin</strong> adalah aplikasi web manajemen keuangan pribadi modern yang berfungsi untuk mencatat pemasukan dan pengeluaran harian, mengelola berbagai dompet dan rekening, menyusun batas anggaran belanja, memantau target tabungan impian, serta mencatat tagihan dan utang-piutang secara akurat.
        </p>
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>100% Lokal & Privat:</strong> Seluruh data Anda disimpan langsung di memori browser perangkat (LocalStorage) tanpa login dan tanpa server eksternal.
          </span>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('Hapus dan reset seluruh data kembali ke Rp 0?')) {
              setData(defaultData);
              localStorage.removeItem(STORAGE_KEY);
              showToast('Semua data di-reset ke 0');
            }
          }}
          className="text-xs font-bold text-rose-500 hover:underline"
        >
          Reset Semua Data ke 0
        </button>
      </div>

      {/* Tulisan Halus ridzz */}
      <footer className="text-center pt-6 pb-4">
        <span className="text-[11px] text-slate-300 dark:text-slate-700 tracking-widest uppercase font-semibold">
          crafted with passion by <span className="text-slate-400 dark:text-slate-500 font-bold">ridzz</span>
        </span>
      </footer>
    </div>
  );

  // Navigasi Menu
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transaksi', icon: ArrowLeftRight },
    { id: 'accounts', name: 'Dompet', icon: Wallet },
    { id: 'budgets', name: 'Target', icon: Target },
    { id: 'bills', name: 'Tagihan', icon: Receipt },
    { id: 'profile', name: 'Akun', icon: User }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const matchedTx = searchQuery.trim()
    ? (data.transactions || []).filter((t) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen overflow-hidden bg-[#f4f7f6] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 font-sans select-none"
    >
      {/* Toast Notifikasi */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0f766e] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
          ✨ {toast}
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
            onClick={handleInstallPwa}
            className="w-full flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 transition"
          >
            <span className="flex items-center space-x-2">
              <Smartphone size={15} />
              <span>{isPwaInstalled ? 'PWA Terpasang ✓' : 'Pasang Aplikasi PWA'}</span>
            </span>
            <span className="bg-[#0f766e] text-white text-[9px] px-2 py-0.5 rounded-full">App</span>
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0f766e] text-white shadow-md shadow-teal-700/20 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-800/40 text-center space-y-2">
          <div className="text-xl">🌱</div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Small steps build big wealth</h4>
          <p className="text-[10px] text-slate-500">Track. Save. Grow.</p>
          <button
            onClick={() => setActiveTab('budgets')}
            className="w-full bg-[#0f766e] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-teal-800 transition"
          >
            Set a Goal →
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setShowSearchModal(true)}
              placeholder="Search transactions, categories, or anything..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-full pl-9 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4 pl-3">
            <button
              onClick={handleInstallPwa}
              className="lg:hidden p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600"
              title="Install PWA"
            >
              <Smartphone size={17} />
            </button>

            <button
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, darkMode: !prev.settings.darkMode }
                }))
              }
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              {data.settings?.darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Bell size={17} />
              {(data.bills || []).filter((b) => !b.isPaid).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {(data.bills || []).filter((b) => !b.isPaid).length}
                </span>
              )}
            </button>

            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
            >
              {data.profile?.avatar ? (
                <img src={data.profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white font-bold text-xs flex items-center justify-center">
                  {(data.profile?.name || 'P')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{data.profile?.name || 'Pengguna'}</p>
                <p className="text-[10px] text-slate-400">{data.profile?.tier || 'Personal Member'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'accounts' && renderAccounts()}
          {activeTab === 'budgets' && renderBudgetsAndGoals()}
          {activeTab === 'bills' && renderBillsAndDebts()}
          {activeTab === 'profile' && renderProfile()}
        </main>
      </div>

      {/* Floating Action Button (+) */}
      <button
        onClick={() => setShowTxModal(true)}
        className="fixed right-4 bottom-20 lg:bottom-8 z-40 bg-[#0f766e] hover:bg-teal-800 text-white p-4 rounded-full shadow-xl shadow-teal-700/40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Mobile (Tetap ada beserta ikonnya + bisa digeser layar) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-around items-center py-2 px-1 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-all ${
                isActive ? 'text-[#0f766e] scale-105 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="mt-1">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Modal Input Transaksi (Otomatis Format Titik Ribuan 10.000) */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black">Catat Transaksi</h2>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 text-xs font-bold">
              {['expense', 'income', 'transfer'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTxForm({
                      ...txForm,
                      type: t,
                      category: t === 'income' ? 'Gaji' : 'Makanan & Minuman'
                    })
                  }
                  className={`py-2 rounded-xl transition ${
                    txForm.type === t ? 'bg-white dark:bg-slate-700 text-[#0f766e] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold">Nominal (Rp)</label>
                <div className="relative flex items-center border-b-2 border-slate-200 dark:border-slate-700 focus-within:border-[#0f766e]">
                  <span className="text-xl font-black text-slate-400 mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="10.000"
                    value={txForm.rawAmount}
                    onChange={(e) => setTxForm({ ...txForm, rawAmount: formatDots(e.target.value) })}
                    className="w-full text-2xl font-black bg-transparent outline-none py-2"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400'}`}
                  >
                    <Mic size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold">Keterangan</label>
                <input
                  type="text"
                  placeholder="Misal: Makan Siang, Kopi, Gaji"
                  value={txForm.title}
                  onChange={(e) => setTxForm({ ...txForm, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                />
              </div>

              {txForm.type !== 'transfer' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Dompet</label>
                    <select
                      value={txForm.accountId}
                      onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.length === 0 && <option value="">Buat dompet dulu</option>}
                      {data.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Kategori</label>
                    <select
                      value={txForm.category}
                      onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {(data.categories?.[txForm.type] || []).map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Dari Dompet</label>
                    <select
                      value={txForm.accountId}
                      onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Ke Dompet</label>
                    <select
                      value={txForm.toAccountId}
                      onChange={(e) => setTxForm({ ...txForm, toAccountId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
                    >
                      {data.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 font-bold">Tanggal</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
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

      {/* Modal Tambah Simpanan / Bayar Cicilan dengan Format 10.000 */}
      {topupModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm">{topupModal.title}</h3>
              <button onClick={() => setTopupModal({ open: false, type: '', id: '', title: '', rawAmount: '' })}>
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold">Masukkan Nominal (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="50.000"
                value={topupModal.rawAmount}
                onChange={(e) => setTopupModal({ ...topupModal, rawAmount: formatDots(e.target.value) })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-lg font-black outline-none mt-1"
              />
            </div>
            <button
              onClick={() => {
                const amt = parseDots(topupModal.rawAmount);
                if (amt <= 0) return;
                if (topupModal.type === 'goal') {
                  setData((prev) => ({
                    ...prev,
                    goals: prev.goals.map((g) =>
                      g.id === topupModal.id ? { ...g, currentAmount: g.currentAmount + amt } : g
                    )
                  }));
                } else if (topupModal.type === 'debt') {
                  setData((prev) => ({
                    ...prev,
                    debts: prev.debts.map((d) =>
                      d.id === topupModal.id ? { ...d, remaining: Math.max(0, d.remaining - amt) } : d
                    )
                  }));
                }
                fireConfetti();
                showToast('Berhasil disimpan!');
                setTopupModal({ open: false, type: '', id: '', title: '', rawAmount: '' });
              }}
              className="w-full bg-[#0f766e] text-white py-3 rounded-2xl text-xs font-bold"
            >
              Konfirmasi Simpan
            </button>
          </div>
        </div>
      )}

      {/* Modal Panduan Install PWA */}
      {showPwaGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Smartphone size={24} />
            </div>
            <h3 className="font-black text-base">Pasang Aplikasi Duitin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Untuk memasang aplikasi di HP Android Anda:
              <br />
              1. Ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.
              <br />
              2. Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.
            </p>
            <button
              onClick={() => setShowPwaGuide(false)}
              className="w-full bg-[#0f766e] text-white py-2.5 rounded-2xl text-xs font-bold"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal Pencarian */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari nama transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {matchedTx.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">Tidak ada transaksi ditemukan.</p>
              ) : (
                matchedTx.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between text-xs">
                    <div>
                      <p className="font-bold">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.date}</p>
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
