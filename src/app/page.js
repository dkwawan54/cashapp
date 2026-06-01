'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Download, Upload, FileText, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');

  // Load data dari LocalStorage saat app dibuka
  useEffect(() => {
    const savedData = localStorage.getItem('cashflow_data');
    if (savedData) setTransactions(JSON.parse(savedData));
    
    // Register Service Worker untuk PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed: ', err));
      });
    }
  }, []);

  // Simpan data ke LocalStorage setiap ada perubahan
  const saveToLocal = (data) => {
    setTransactions(data);
    localStorage.setItem('cashflow_data', JSON.stringify(data));
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newTransaction = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString('id-ID'),
    };

    const updated = [newTransaction, ...transactions];
    saveToLocal(updated);
    setTitle('');
    setAmount('');
  };

  const handleDelete = (id) => {
    const filtered = transactions.filter((t) => t.id !== id);
    saveToLocal(filtered);
  };

  // Hitung Total Finansial
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Fitur 1: Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('LAPORAN CATATAN KEUANGAN (CASHFLOW)', 14, 15);
    doc.text(`Total Saldo: Rp ${balance.toLocaleString('id-ID')}`, 14, 23);
    
    const tableRows = transactions.map(t => [t.date, t.title, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', `Rp ${t.amount.toLocaleString('id-ID')}`]);
    
    doc.autoTable({
      startY: 30,
      head: [['Tanggal', 'Keterangan', 'Jenis', 'Jumlah']],
      body: tableRows,
    });
    
    doc.save('Laporan_Cashflow.pdf');
  };

  // Fitur 2: Backup Data ke File JSON
  const backupData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cashflow_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Fitur 3: Restore Data dari File JSON
  const restoreData = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          saveToLocal(parsed);
          alert('Data berhasil di-restore!');
        } else {
          alert('Format file tidak valid.');
        }
      } catch (error) {
        alert('Gagal membaca file.');
      }
    };
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header & SEO optimization title */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-emerald-400" /> Cashflow PWA App
          </h1>
          <p className="text-xs text-slate-400 mt-1">Aplikasi Catatan Keuangan Pribadi Ringan & Aman</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button onClick={exportToPDF} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg font-medium transition">
            <FileText size={16} /> PDF
          </button>
          <button onClick={backupData} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-medium transition">
            <Download size={16} /> Backup
          </button>
          <label className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg font-medium transition cursor-pointer">
            <Upload size={16} /> Restore
            <input type="file" accept=".json" onChange={restoreData} className="hidden" />
          </label>
        </div>
      </header>

      {/* Dashboard Ringkasan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Saldo</p>
          <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            Rp {balance.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pemasukan</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">Rp {totalIncome.toLocaleString('id-ID')}</p>
          </div>
          <ArrowUpCircle className="text-emerald-500" size={32} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pengeluaran</p>
            <p className="text-2xl font-bold text-rose-600 mt-2">Rp {totalExpense.toLocaleString('id-ID')}</p>
          </div>
          <ArrowDownCircle className="text-rose-500" size={32} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Input Transaksi */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Tambah Transaksi</h2>
          <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Keterangan</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Gaji, Jajan Bakso" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-slate-900" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Jumlah (Rp)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-slate-900" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Jenis</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-slate-900 bg-white">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white p-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 mt-2">
              <PlusCircle size={16} /> Simpan
            </button>
          </form>
        </section>

        {/* Riwayat Transaksi */}
        <section className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Riwayat Transaksi</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada transaksi tercatat.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-600 transition" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}