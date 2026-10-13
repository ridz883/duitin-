import React, { useContext, useState } from 'react';
import { DuitinContext } from '../context/DuitinContext';
import { 
  User, 
  Camera, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Info, 
  Download, 
  Upload, 
  Trash, 
  Check, 
  Smartphone 
} from 'lucide-react';

export default function Profile() {
  const { 
    data, 
    updateProfile, 
    addCustomCategory, 
    deleteCategory, 
    exportBackup, 
    importBackup, 
    resetAllData,
    installPwa,
    isPwaInstalled
  } = useContext(DuitinContext);

  const [profileForm, setProfileForm] = useState({
    name: data.profile?.name || '',
    bio: data.profile?.bio || '',
    avatar: data.profile?.avatar || '',
    tier: data.profile?.tier || 'Premium Member'
  });

  const [catType, setCatType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  const presetColors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileForm(prev => ({ ...prev, avatar: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCustomCategory(catType, { name: newCatName.trim(), color: newCatColor });
    setNewCatName('');
  };

  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => importBackup(event.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Account & Settings</h1>
        <p className="text-xs text-slate-500">Personalisasi profil akun Finora Anda dan kelola aplikasi PWA.</p>
      </div>

      {/* Bagian PWA Install Card Khusus */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl shadow-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Pasang Aplikasi Duitin (PWA)</h3>
            <p className="text-xs text-emerald-100">
              {isPwaInstalled 
                ? 'Aplikasi sudah terpasang di perangkat Anda.' 
                : 'Jalankan Duitin layaknya aplikasi native di Android tanpa membuka browser.'}
            </p>
          </div>
        </div>
        <button
          onClick={installPwa}
          className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shrink-0"
        >
          {isPwaInstalled ? 'Buka Aplikasi' : 'Pasang Sekarang'}
        </button>
      </div>

      {/* Profil Pengguna */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <User size={16} className="text-emerald-500" />
          <span>Informasi Profil</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={profileForm.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"} 
                alt="Avatar" 
                className="w-16 h-16 rounded-3xl object-cover border-2 border-emerald-500" 
              />
              <label className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1.5 rounded-xl cursor-pointer hover:bg-emerald-600 transition">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-bold">Nama Lengkap</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-bold">Motto Finansial</label>
              <input
                type="text"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold">Status Member</label>
              <input
                type="text"
                value={profileForm.tier}
                onChange={(e) => setProfileForm({ ...profileForm, tier: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0f766e] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md shadow-teal-700/20"
          >
            <Check size={16} />
            <span>Simpan Perubahan Profil</span>
          </button>
        </form>
      </div>

      {/* Kategori Kustom */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kategori Transaksi Kustom</h3>
        
        <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setCatType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setCatType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            Pemasukan
          </button>
        </div>

        <form onSubmit={handleAddCategory} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Kategori..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none"
            />
            <button
              type="submit"
              className="bg-[#0f766e] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Tambah</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Pilih Warna:</span>
            {presetColors.map(color => (
              <button
                type="button"
                key={color}
                onClick={() => setNewCatColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${newCatColor === color ? 'scale-125 ring-2 ring-emerald-500' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {data.categories[catType]?.map(c => (
            <div key={c.id || c.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#10b981' }} />
                <span className="font-semibold">{c.name}</span>
              </div>
              <button onClick={() => deleteCategory(catType, c.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cadangan Data */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Cadangan & Pemulihan (LocalStorage)</h3>
        <p className="text-xs text-slate-400">
          Seluruh data tersimpan secara aman di peramban perangkat Anda tanpa server perantara.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={exportBackup}
            className="flex-1 flex items-center justify-center space-x-2 bg-[#0f766e] hover:bg-teal-800 text-white py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            <Download size={14} />
            <span>Ekspor File JSON</span>
          </button>
          <label className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition">
            <Upload size={14} />
            <span>Impor File JSON</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tentang Duitin */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm flex items-center space-x-2">
          <Info size={16} className="text-emerald-500" />
          <span>Tentang Duitin Finora</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Duitin</strong> dirancang untuk membantu Anda memantau keuangan harian, membatasi pengeluaran melalui sistem anggaran, mengelola target tabungan, dan menjadwalkan pelunasan tagihan.
        </p>
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>100% Client-Side:</strong> Tidak ada server atau database pihak ketiga. Akses tetap berfungsi penuh tanpa koneksi internet.
          </span>
        </div>
      </div>

      {/* Reset */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('PERINGATAN: Seluruh catatan transaksi dan dompet akan di-reset ke kondisi awal. Lanjutkan?')) {
              resetAllData();
            }
          }}
          className="text-xs font-semibold text-rose-500 hover:underline flex items-center justify-center space-x-1 mx-auto"
        >
          <Trash size={12} />
          <span>Bersihkan Semua Data Lokal</span>
        </button>
      </div>

      {/* Signature ridzz */}
      <footer className="text-center pt-6 pb-4">
        <span className="text-[11px] text-slate-300 dark:text-slate-700 tracking-widest uppercase font-semibold">
          crafted with passion by <span className="text-slate-400 dark:text-slate-500 font-bold">ridzz</span>
        </span>
      </footer>
    </div>
  );
}
