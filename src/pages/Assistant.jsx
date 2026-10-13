import React, { useContext, useState } from 'react';
import { DuitinContext, formatIDR } from '../context/DuitinContext';
import { Bot, Send } from 'lucide-react';

export default function Assistant() {
  const { data, balances } = useContext(DuitinContext);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Halo! Saya Asisten Duitin. Saya menganalisis data keuangan lokal Anda langsung di browser. Ada yang ingin Anda ketahui?'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (query) => {
    const q = (query || input).toLowerCase();
    if (!q) return;

    const userMsg = { sender: 'user', text: query || input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let botReply = '';

      if (q.includes('pengeluaran') && (q.includes('bulan ini') || q.includes('berapa'))) {
        const curMonth = new Date().getMonth() + 1;
        const total = data.transactions
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() + 1 === curMonth)
          .reduce((a, b) => a + b.amount, 0);
        botReply = `Total pengeluaran Anda pada bulan ini tercatat sebesar ${formatIDR(total)}.`;
      } else if (q.includes('terbesar') || q.includes('banyak')) {
        const cats = {};
        data.transactions.filter(t => t.type === 'expense').forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        const highest = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
        botReply = highest 
          ? `Kategori yang paling banyak menghabiskan uang adalah "${highest[0]}" dengan total pengeluaran ${formatIDR(highest[1])}.`
          : 'Belum ada catatan pengeluaran.';
      } else if (q.includes('saldo') || q.includes('uang')) {
        const total = Object.values(balances).reduce((a, b) => a + b, 0);
        botReply = `Total seluruh saldo bersih di semua dompet aktif Anda adalah ${formatIDR(total)}.`;
      } else if (q.includes('simulasi')) {
        botReply = 'Simulasi tabungan: Menyisihkan Rp20.000 setiap hari selama 30 hari menghasilkan total Rp600.000.';
      } else {
        botReply = 'Saya dapat membantu menjawab: "Berapa pengeluaran bulan ini?", "Kategori pengeluaran terbesar", "Berapa total saldo saya", atau "Simulasi tabungan".';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Asisten Duitin</h1>
        <p className="text-sm text-gray-500">Analisis cepat berbasis aturan Javascript lokal tanpa API eksternal.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm ${
              m.sender === 'user' 
                ? 'bg-emerald-500 text-white rounded-br-none' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Pertanyaan Rekomendasi */}
      <div className="flex flex-wrap gap-2 py-3">
        {['Berapa pengeluaran bulan ini?', 'Kategori pengeluaran terbesar?', 'Berapa saldo saya?', 'Simulasi tabungan'].map((btnText) => (
          <button
            key={btnText}
            onClick={() => handleSend(btnText)}
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg transition"
          >
            {btnText}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          placeholder="Tanyakan hal tentang keuangan Anda..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-emerald-500"
        />
        <button type="submit" className="bg-emerald-500 text-white px-5 rounded-xl hover:bg-emerald-600 transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
