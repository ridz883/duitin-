import React, { useState, useContext } from 'react';
import { DuitinContext } from '../context/DuitinContext';
import { Camera, Upload, X, Check } from 'lucide-react';

export default function ReceiptScanner({ isOpen, onClose }) {
  const { data, addTransaction } = useContext(DuitinContext);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    title: 'Belanja Struk',
    amount: '',
    category: 'Belanja',
    accountId: data.accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return alert('Masukkan nominal yang terbaca pada struk');

    addTransaction({
      type: 'expense',
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      accountId: form.accountId,
      date: form.date,
      note: 'Dicatat melalui Pemindai Struk'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base flex items-center space-x-2">
            <Camera size={18} className="text-emerald-500" />
            <span>Pemindai Struk</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Ambil foto atau pilih struk. Verifikasi nominal sebelum menyimpannya ke pengeluaran.
        </p>

        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border h-40 bg-gray-100 flex items-center justify-center">
            <img src={imagePreview} alt="Struk" className="h-full object-contain" />
            <button 
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs"
            >
              Ganti
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-xs font-semibold text-gray-500">Pilih Foto atau Buka Kamera</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
          </label>
        )}

        <form onSubmit={handleSave} className="space-y-3 pt-2">
          <div>
            <label className="text-[11px] text-gray-400">Total Nominal di Struk (Rp)</label>
            <input
              type="number"
              required
              placeholder="Contoh: 45000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-400">Keterangan</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400">Dompet Pembayar</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none"
              >
                {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition flex items-center justify-center space-x-1"
          >
            <Check size={16} />
            <span>Simpan Transaksi Struk</span>
          </button>
        </form>
      </div>
    </div>
  );
}
