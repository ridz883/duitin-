
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

// Pelindung agar tidak pernah layar putih polos jika ada kendala cache
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Crash tertangkap:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center text-2xl font-bold mb-4">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pembaruan Sistem Berhasil</h2>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            Browser Anda perlu menyelaraskan cache data lama dengan fitur versi terbaru.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/30 transition active:scale-95"
          >
            Bersihkan Cache & Buka Aplikasi
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
            </Route>
          </Routes>
        </BrowserRouter>
      </DuitinProvider>
    </ErrorBoundary>
  );
}
