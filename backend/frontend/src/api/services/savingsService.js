const baseURL = 'http://127.0.0.1:8000/api';

const makeRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${baseURL}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'API request failed');
  }
};

export const savingsService = {
  // Savings Goals
  async getGoals() {
    return await makeRequest('/savings/goals/');
  },

  async createGoal(data) {
    return await makeRequest('/savings/goals/create/', 'POST', data);
  },

  async updateGoal(id, data) {
    return await makeRequest(`/savings/goals/update/${id}/`, 'PUT', data);
  },

  async deleteGoal(id) {
    return await makeRequest(`/savings/goals/delete/${id}/`, 'DELETE');
  },

  // Savings Entries
  async getEntries() {
    return await makeRequest('/savings/entries/');
  },

  async createEntry(data) {
    try {
      // 1. Create the savings entry FIRST
      const savedEntry = await makeRequest('/savings/entries/create/', 'POST', data);

      // 2. Auto-sync to expenses with category='Savings'
      try {
        const expensePayload = {
          amount: data.amount,
          category: 'Savings',
          date: data.date,
          description: data.goal_name ? `Savings: ${data.goal_name}` : 'Savings Entry',
          payment_method: 'Bank Transfer' // Default method for savings
          // NOTE: Do NOT include 'user' - AddExpenseView auto-assigns from request.user.id
          // NOTE: Do NOT include 'source' if it has a default in the model
        };

        const expenseResponse = await makeRequest('/expenses/add/', 'POST', expensePayload);
        console.log('✅ Savings entry synced to expenses:', expenseResponse);
      } catch (expenseError) {
        console.warn('⚠️ Savings entry created but expense sync failed:', expenseError);
        // Don't throw - entry was created successfully, just log warning
        // User still sees the savings entry even if expense sync fails
      }

      return savedEntry;
    } catch (error) {
      throw error;
    }
  },

  async deleteEntry(id) {
    return await makeRequest(`/savings/entries/delete/${id}/`, 'DELETE');
  }
};