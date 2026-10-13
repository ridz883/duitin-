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
  Check 
} from 'lucide-react';

export default function Profile() {
  const { 
    data, 
    updateProfile, 
    addCustomCategory, 
    deleteCategory, 
    exportBackup, 
    importBackup, 
    resetAllData 
  } = useContext(DuitinContext);

  // Form Profil
  const [profileForm, setProfileForm] = useState({
    name: data.profile?.name || '',
    bio: data.profile?.bio || '',
    avatar: data.profile?.avatar || ''
  });

  // Form Custom Kategori
  const [catType, setCatType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  const presetColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];

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
        <h1 className="text-2xl font-black">Akun & Profil</h1>
        <p className="text-xs text-gray-500">Personalisasi akun Anda dan kelola preferensi Duitin.</p>
      </div>

      {/* Bagian 1: Edit Profil & Nama */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm flex items-center space-x-2">
          <User size={18} className="text-emerald-500" />
          <span>Informasi Profil Pengguna</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileForm.avatar ? (
                <img src={profileForm.avatar} alt="Avatar" className="w-16 h-16 rounded-3xl object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {(profileForm.name || 'P')[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-gray-900 dark:bg-gray-800 text-white p-1.5 rounded-xl cursor-pointer hover:bg-emerald-500 transition">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 font-semibold">Nama Tampilan</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Masukkan nama Anda"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-bold outline-none mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold">Bio / Motto Finansial</label>
            <input
              type="text"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Misal: Menabung untuk masa depan cerah"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <Check size={16} />
            <span>Simpan Perubahan Profil</span>
          </button>
        </form>
      </div>

      {/* Bagian 2: Kelola Custom Kategori & Warna */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm">Kategori Transaksi Kustom</h3>
        
        <div className="flex space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
          <button
            onClick={() => setCatType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'expense' ? 'bg-red-500 text-white' : 'text-gray-400'}`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setCatType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catType === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
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
              className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Tambah</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Pilih Warna:</span>
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
            <div key={c.id || c.name} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#10b981' }} />
                <span className="font-semibold">{c.name}</span>
              </div>
              <button onClick={() => deleteCategory(catType, c.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 3: Cadangan Data */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm">Cadangan & Pemulihan (LocalStorage)</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Semua catatan finansial tersimpan aman di peramban Anda. Unduh salinan data secara berkala untuk mencadangkannya.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={exportBackup}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download size={14} />
            <span>Ekspor File JSON</span>
          </button>
          <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition">
            <Upload size={14} />
            <span>Impor File JSON</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Bagian 4: Tentang Aplikasi Duitin */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm flex items-center space-x-2">
          <Info size={16} className="text-emerald-500" />
          <span>Tentang Aplikasi Duitin</span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <strong>Duitin</strong> adalah aplikasi manajemen finansial mandiri modern yang dirancang khusus untuk membantu mencatat transaksi harian, mengendalikan anggaran, memantau utang-piutang, serta merencanakan target tabungan.
        </p>
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Privasi 100% Terjaga:</strong> Seluruh data disimpan secara lokal di browser perangkat Anda tanpa server perantara, tanpa login, dan tanpa database eksternal.
          </span>
        </div>
      </div>

      {/* Bagian 5: Reset Data */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('PERINGATAN: Seluruh transaksi, dompet, dan target akan dibersihkan. Lanjutkan?')) {
              resetAllData();
            }
          }}
          className="text-xs font-semibold text-red-500 hover:underline flex items-center justify-center space-x-1 mx-auto"
        >
          <Trash size={12} />
          <span>Bersihkan Semua Data Lokal</span>
        </button>
      </div>

      {/* Tanda Halus: ridzz */}
      <footer className="text-center pt-6 pb-4">
        <span className="text-[11px] text-gray-300 dark:text-gray-700 tracking-widest uppercase font-semibold">
          crafted with passion by <span className="text-gray-400 dark:text-gray-600 font-bold">ridzz</span>
        </span>
      </footer>
    </div>
  );
}
