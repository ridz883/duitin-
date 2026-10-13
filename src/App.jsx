import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DuitinProvider } from './context/DuitinContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import BudgetsGoals from './pages/BudgetsGoals';
import BillsDebts from './pages/BillsDebts';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl font-black mb-4">
            ↻
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Menyelaraskan Data Baru</h2>
          <p className="text-xs text-slate-500 max-w-xs mb-6">
            Klik tombol di bawah untuk menyegarkan penyimpanan browser dan membuka aplikasi.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="bg-[#0f766e] text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <DuitinProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="budgets-goals" element={<BudgetsGoals />} />
              <Route path="bills-debts" element={<BillsDebts />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="reports" element={<Reports />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DuitinProvider>
    </ErrorBoundary>
  );
}
