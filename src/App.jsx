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
                    className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition active:scale-
