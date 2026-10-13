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
    tier: data.profile?.tier || 'Personal Account'
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
        <h1 className="text-2xl font-black">Akun & Pengaturan</h1>
        <p className="text-xs text-slate-500">Edit profil, pasang aplikasi PWA, dan kelola penyimpanan lokal.</p>
      </div>

      {/* Menu Install PWA */}
      <div className="bg-gradient-to-br from-[#064e3b] to-[#0f766e] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Aplikasi Mobile Duitin (PWA)</h3>
            <p className="text-xs text-emerald-100">
              {isPwaInstalled 
                ? 'Aplikasi sudah terpasang di layar utama HP Anda.' 
                : 'Pasang Duitin ke layar utama HP agar bisa dibuka penuh tanpa browser.'}
            </p>
          </div>
        </div>
        <button
          onClick={installPwa}
          className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shrink-0"
        >
          {isPwaInstalled ? 'Aplikasi Aktif ✓' : 'Pasang Aplikasi'}
        </button>
      </div>

      {/* Form Edit Profil */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <User size={16} className="text-emerald-500" />
          <span>Edit Profil Pengguna</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileForm.avatar ? (
                <img src={profileForm.avatar} alt="Avatar" className="w-16 h-16 rounded-3xl object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-[#0f766e] text-white font-black text-2xl flex items-center justify-center">
                  {(profileForm.name || 'P')[0].toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1.5 rounded-xl cursor-pointer hover:bg-emerald-600 transition">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-bold">Nama Pengguna</label>
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
              <label className="text-xs text-slate-400 font-bold">Bio / Motto</label>
              <input
                type="text"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold">Label Status</label>
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
            className="w-full py-3 bg-[#0f766e] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md"
          >
            <Check size={16} />
            <span>Simpan Profil ke LocalStorage</span>
          </button>
        </form>
      </div>

      {/* Kategori Kustom */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Custom Kategori & Warna</h3>
        
        <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setCatType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
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
              placeholder="Nama Kategori Baru..."
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
            <span className="text-xs text-slate-400">Warna:</span>
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
          {(data.categories?.[catType] || []).map(c => {
            const cName = typeof c === 'string' ? c : c.name;
            const cColor = typeof c === 'string' ? '#10b981' : (c.color || '#10b981');
            const cId = typeof c === 'string' ? c : c.id;
            return (
              <div key={cId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cColor }} />
                  <span className="font-semibold truncate">{cName}</span>
                </div>
                <button onClick={() => deleteCategory(catType, cId)} className="text-slate-400 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Cadangan Data (Backup & Restore)</h3>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={exportBackup}
            className="flex-1 flex items-center justify-center space-x-2 bg-[#0f766e] text-white py-2.5 rounded-2xl text-xs font-bold"
          >
            <Download size={14} />
            <span>Unduh Backup (.JSON)</span>
          </button>
          <label className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 py-2.5 rounded-2xl text-xs font-bold cursor-pointer">
            <Upload size={14} />
            <span>Pulihkan Data (.JSON)</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
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
          <strong>Duitin</strong> adalah aplikasi web manajemen keuangan pribadi untuk mencatat pemasukan, pengeluaran, mengelola dompet, menyusun anggaran bulanan, menabung untuk target impian, serta memantau tagihan dan utang-piutang secara mandiri.
        </p>
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            Seluruh data disimpan 100% secara lokal di browser perangkat Anda (LocalStorage) tanpa memerlukan login maupun server eksternal.
          </span>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('Reset seluruh data kembali ke 0?')) resetAllData();
          }}
          className="text-xs font-semibold text-rose-500 hover:underline flex items-center justify-center space-x-1 mx-auto"
        >
          <Trash size={12} />
          <span>Hapus & Reset Semua Data</span>
        </button>
      </div>

      {/* Credit ridzz */}
      <footer className="text-center pt-6 pb-4">
        <span className="text-[11px] text-slate-300 dark:text-slate-700 tracking-widest uppercase font-semibold">
          crafted with passion by <span className="text-slate-400 dark:text-slate-500 font-bold">ridzz</span>
        </span>
      </footer>
    </div>
  );
}
