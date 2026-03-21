// Recurring Expense API Service
// Standalone implementation

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

export const recurringExpenseService = {
  async getAll() {
    return await makeRequest('/recurring-expenses/');
  },

  async getById(id) {
    return await makeRequest(`/recurring-expenses/${id}/`);
  },

  async create(data) {
    return await makeRequest('/recurring-expenses/', 'POST', data);
  },

  async update(id, data) {
    return await makeRequest(`/recurring-expenses/${id}/`, 'PUT', data);
  },

  async delete(id) {
    return await makeRequest(`/recurring-expenses/${id}/`, 'DELETE');
  }
};