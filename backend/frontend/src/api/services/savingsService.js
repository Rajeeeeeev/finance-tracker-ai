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
    return await makeRequest('/savings/entries/create/', 'POST', data);
  },

  async deleteEntry(id) {
    return await makeRequest(`/savings/entries/delete/${id}/`, 'DELETE');
  }
};