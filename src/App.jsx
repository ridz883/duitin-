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

export default function App() {
  return (
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
  );
}
