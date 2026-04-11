const API_BASE = 'http://localhost:8000/api';

async function makeRequest(url) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const analyticsService = {
  getMonthlyTrend: () =>
    makeRequest(`${API_BASE}/analytics/monthly-trend/`),

  getCategoryBreakdown: (year, month) =>
    makeRequest(`${API_BASE}/analytics/category-breakdown/?year=${year}&month=${month}`),

  getYearOverYear: () =>
    makeRequest(`${API_BASE}/analytics/year-over-year/`),
};  