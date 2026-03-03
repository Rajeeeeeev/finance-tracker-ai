import apiClient from "../client";
import ENDPOINTS from "../endpoints";

// Income types match backend IncomeType choices:
// SALARY | BUSINESS | INVESTMENT_RETURN | RENTAL | OTHER
const incomeService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`${ENDPOINTS.INCOME_LIST}${query ? "?" + query : ""}`);
  },

  add(payload) {
    // payload: { income_type, source_name, amount, date }
    return apiClient.post(ENDPOINTS.INCOME_ADD, payload);
  },

  update(id, payload) {
    return apiClient.put(ENDPOINTS.INCOME_UPDATE(id), payload);
  },

  delete(id) {
    return apiClient.delete(ENDPOINTS.INCOME_DELETE(id));
  },

  summary() {
    return apiClient.get(ENDPOINTS.INCOME_SUMMARY);
  },
};

export default incomeService;