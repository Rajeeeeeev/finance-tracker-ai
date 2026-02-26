import { apiClient } from "./apiClient";

export const dashboardService = {

  async getFinancialSummary(filters = {}) {

    return await apiClient.post(
      "/financial-summary/",
      filters
    );

  },

};