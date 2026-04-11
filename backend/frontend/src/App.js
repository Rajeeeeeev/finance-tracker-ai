import React, { useState } from "react";
import "./styles/globals.css"

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/Income";
import ExpensesPage from "./pages/Expenses";
import InvestmentsPage from "./pages/Investments";
import CreditCardsPage from "./pages/CreditCardsPage";
import BillRemindersPage from './pages/BillRemindersPage';
import RecurringExpensesPage from './pages/RecurringExpensesPage';
import SavingsPage from './pages/SavingsPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import AnalyticsPage from './pages/AnalyticsPage';

import authService from "./api/services/auth.service";

const getPath = () => window.location.pathname;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [, rerender] = useState(0);

  window.onpopstate = () => rerender((n) => n + 1);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const path = getPath();

  switch (path) {
    case "/income":             return <IncomePage />;
    case "/expenses":           return <ExpensesPage />;
    case "/investments":        return <InvestmentsPage />;
    case "/credit-cards":       return <CreditCardsPage />;
    case "/bill-reminders":     return <BillRemindersPage />;
    case "/recurring-expenses": return <RecurringExpensesPage />;
    case "/savings":            return <SavingsPage />;
    case "/liabilities":        return <LiabilitiesPage />;
    case "/analytics":          return <AnalyticsPage />;
    default:                    return <Dashboard />;
  }
}

export default App;