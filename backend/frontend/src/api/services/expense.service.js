import apiClient from "../client";
import ENDPOINTS from "../endpoints";

// Categories: Food | Travel | Shopping | Bills | Entertainment |
//             Health | Education | Groceries | Rent | Utilities | Other
// Payment methods: Cash | UPI | Bank Transfer | Credit Card | Debit Card | Wallet
const expenseService = {
  list() {
    return apiClient.get(ENDPOINTS.EXPENSE_LIST);
  },

  add(payload) {
    // payload: { user, amount, category, payment_method, description, date }
    return apiClient.post(ENDPOINTS.EXPENSE_ADD, payload);
  },

  update(id, payload) {
    return apiClient.put(ENDPOINTS.EXPENSE_UPDATE(id), payload);
  },

  delete(id) {
    return apiClient.delete(ENDPOINTS.EXPENSE_DELETE(id));
  },
};

export default expenseService;