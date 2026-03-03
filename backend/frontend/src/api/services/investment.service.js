import apiClient from "../client";
import ENDPOINTS from "../endpoints";

// Investment types: EQUITY | COMMODITY | BOND | DEPOSIT | OTHER
const investmentService = {
  list() {
    return apiClient.get(ENDPOINTS.INVESTMENT_LIST);
  },

  add(payload) {
    // payload: { investment_type, name, symbol?, invested_amount, current_amount, notes? }
    return apiClient.post(ENDPOINTS.INVESTMENT_ADD, payload);
  },

  update(id, payload) {
    return apiClient.put(ENDPOINTS.INVESTMENT_UPDATE(id), payload);
  },

  delete(id) {
    return apiClient.delete(ENDPOINTS.INVESTMENT_DELETE(id));
  },

  summary() {
    return apiClient.get(ENDPOINTS.INVESTMENT_SUMMARY);
  },
};

export default investmentService;