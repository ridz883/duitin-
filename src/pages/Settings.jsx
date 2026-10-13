import React, { useContext } from 'react';
import { DuitinContext } from '../context/DuitinContext';
import { Download, Upload, Trash2, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const { exportBackup, importBackup, resetAllData } = useContext(DuitinContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importBackup(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan & Cadangan</h1>
        <p className="text-sm text-gray-500">Kelola cadangan data lokal dan preferensi sistem.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <h3 className="font-bold text-base">Cadangan Data (Backup & Restore)</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Semua catatan finansial Anda tersimpan di peramban web perangkat ini. Unduh berkas cadangan secara rutin agar data tetap aman saat membersihkan riwayat peramban atau berpindah perangkat.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={exportBackup}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Download size={16} />
            <span>Ekspor Semua Data (.JSON)</span>
          </button>

          <label className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition">
            <Upload size={16} />
            <span>Pulihkan Data (.JSON)</span>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-950/40 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-red-500">
          <ShieldAlert size={20} />
          <h3 className="font-bold text-base">Zona Berbahaya</h3>
        </div>
        <p className="text-xs text-gray-500">
          Tindakan ini akan mengembalikan seluruh data dompet, transaksi, target, dan tagihan ke setelan awal pabrik.
        </p>
        <button
          onClick={() => {
            if (confirm('PERINGATAN: Seluruh data lokal akan dihapus permanen. Lanjutkan?')) {
              resetAllData();
            }
          }}
          className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
        >
          <Trash2 size={16} />
          <span>Hapus & Reset Semua Data</span>
        </button>
      </div>
    </div>
  );
}
