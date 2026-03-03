// ─── API ENDPOINTS ───────────────────────────────────────────────────────────
// Single source of truth for all backend URLs.
// Never hardcode endpoint strings in services or components.
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  // Auth
  LOGIN: "/token/",
  REFRESH: "/token/refresh/",
  SIGNUP: "/users/signup/",

  // Financial Summary
  FINANCIAL_SUMMARY: "/financial-summary/",

  // Income
  INCOME_ADD: "/income/add-income/",
  INCOME_LIST: "/income/income-list/",
  INCOME_SUMMARY: "/income/income-summary/",
  INCOME_UPDATE: (id) => `/income/update-income/${id}/`,
  INCOME_DELETE: (id) => `/income/delete-income/${id}/`,

  // Expenses
  EXPENSE_ADD: "/expenses/add/",
  EXPENSE_LIST: "/expenses/list/",
  EXPENSE_UPDATE: (id) => `/expenses/update/${id}/`,
  EXPENSE_DELETE: (id) => `/expenses/delete/${id}/`,

  // Investments
  INVESTMENT_ADD: "/investments/investments/add/",
  INVESTMENT_LIST: "/investments/investments/",
  INVESTMENT_SUMMARY: "/investments/investments/summary/",
  INVESTMENT_UPDATE: (id) => `/investments/investments/${id}/update/`,
  INVESTMENT_DELETE: (id) => `/investments/investments/${id}/delete/`,

  // Liabilities
  LIABILITY_CREATE: "/liabilities/create/",
  LIABILITY_LIST: "/liabilities/list/",
  LIABILITY_SUMMARY: "/liabilities/summary/",
  LIABILITY_PAY: (id) => `/liabilities/${id}/pay/`,

  // Savings
  SAVINGS_ADD: "/savings/entries/add/",
  SAVINGS_LIST: "/savings/entries/",

  // Bill Reminders
  BILLS_LIST: "/bill-reminders/",
  BILLS_ADD: "/bill-reminders/add/",
  BILLS_MARK_PAID: (id) => `/bill-reminders/${id}/mark-paid/`,

  // Recurring Expenses
  RECURRING_LIST: "/recurring-expenses/",
  RECURRING_ADD: "/recurring-expenses/add/",
};

export default ENDPOINTS;