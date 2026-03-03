import apiClient from "../client";
import ENDPOINTS from "../endpoints";

// payload examples:
//   {}                                        → current month (default)
//   { year: 2026, month: 2 }                 → specific month
//   { start_date: "2026-01-01", end_date: "2026-01-31" } → custom range
const financialSummaryService = {
  fetch(payload = {}) {
    return apiClient.post(ENDPOINTS.FINANCIAL_SUMMARY, payload);
  },
};

export default financialSummaryService;