import apiClient from "../client";
import ENDPOINTS from "../endpoints";

const authService = {
  async login(username, password) {
    const data = await apiClient.post(ENDPOINTS.LOGIN, { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  },

  async signup(username, email, password) {
    return apiClient.post(ENDPOINTS.SIGNUP, { username, email, password });
  },

  isLoggedIn() {
    return !!localStorage.getItem("access_token");
  },
};

export default authService;