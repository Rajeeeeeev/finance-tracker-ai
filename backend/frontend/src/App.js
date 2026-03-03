import React, { useState } from "react";
import "./styles/globals.css"

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/Income";
import ExpensesPage from "./pages/Expenses";
import InvestmentsPage from "./pages/Investments";

import authService from "./api/services/auth.service";

// ─── SIMPLE CLIENT-SIDE ROUTER ────────────────────────────────────────────────
// Install react-router-dom when you're ready to upgrade:
//   npm install react-router-dom
// Then replace this with <BrowserRouter> + <Route> components.
// For now this covers all Phase 1 pages without extra dependencies.

const getPath = () => window.location.pathname;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [, rerender] = useState(0);

  // Listen for back/forward navigation
  window.onpopstate = () => rerender((n) => n + 1);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const path = getPath();

  switch (path) {
    case "/income":      return <IncomePage />;
    case "/expenses":    return <ExpensesPage />;
    case "/investments": return <InvestmentsPage />;
    default:             return <Dashboard />;
  }
}

export default App;