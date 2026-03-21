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

export const liabilityService = {
  async getAll() {
    return await makeRequest('/liabilities/list/');
  },

  async create(data) {
    return await makeRequest('/liabilities/create/', 'POST', data);
  },

  async delete(id) {
    return await makeRequest(`/liabilities/${id}/delete/`, 'DELETE');
  },

  async getPayments() {
    // You may need to adjust this based on your actual endpoint
    return await makeRequest('/liabilities/list/'); // or create a dedicated endpoint
  },

  async createPayment(data) {
    return await makeRequest(`/liabilities/${data.liability}/pay/`, 'POST', data);
  },

  async deletePayment(id) {
    // You may need to add this endpoint to your backend
    return await makeRequest(`/liabilities/payments/${id}/delete/`, 'DELETE');
  }
};