import apiClient from "../client";
import ENDPOINTS from "../endpoints";

const investmentService = {
  list() {
    return apiClient.get(ENDPOINTS.INVESTMENT_LIST);
  },

  add(payload) {
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

  getLogs(id) {
    return apiClient.get(ENDPOINTS.INVESTMENT_LOGS(id));
  },
};

export default investmentService;