// ─── API CLIENT ──────────────────────────────────────────────────────────────
// Central axios-like fetch wrapper.
// - Automatically attaches Bearer token from localStorage
// - Handles 401 → clears token and redirects to login
// - Standardizes error shape across all services
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://127.0.0.1:8000/api";

function getToken() {
  return localStorage.getItem("access_token");
}

function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

async function request(method, endpoint, data = null) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Token expired or invalid — clear auth and redirect
  if (response.status === 401) {
    clearAuth();
    throw new Error("Session expired. Please log in again.");
  }

  const json = await response.json();

  if (!response.ok) {
    // Surface Django validation errors properly
    const message =
      typeof json === "object"
        ? Object.values(json).flat().join(" ")
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return json;
}

const apiClient = {
  get: (endpoint) => request("GET", endpoint),
  post: (endpoint, data) => request("POST", endpoint, data),
  put: (endpoint, data) => request("PUT", endpoint, data),
  delete: (endpoint) => request("DELETE", endpoint),
};

export default apiClient;