const baseURL = 'http://127.0.0.1:8000/api';

const makeRequest = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(`${baseURL}${endpoint}`, options);

  if (response.status === 204) return null;

  const json = await response.json();

  if (!response.ok) {
    const message = json?.error || json?.message ||
      (typeof json === 'object' ? Object.values(json).flat().join(' ') : `Request failed: ${response.status}`);
    throw new Error(message);
  }

  return json;
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

  async payEMI(liabilityId) {
    return await makeRequest(`/liabilities/${liabilityId}/pay/`, 'POST');
  },

  async close(liabilityId) {
    return await makeRequest(`/liabilities/${liabilityId}/close/`, 'POST');
  },

  async getPaymentHistory(liabilityId) {
    return await makeRequest(`/liabilities/${liabilityId}/payments/`);
  },
};