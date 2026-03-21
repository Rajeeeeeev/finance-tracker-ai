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

export const billReminderService = {
  async getAll() {
    return await makeRequest('/bill-reminders/list/');
  },

  async create(data) {
    return await makeRequest('/bill-reminders/add/', 'POST', data);
  },

  async markAsPaid(id) {
    return await makeRequest(`/bill-reminders/mark-paid/${id}/`, 'POST', {});
  },

  async delete(id) {
    return await makeRequest(`/bill-reminders/delete/${id}/`, 'DELETE');
  }
};