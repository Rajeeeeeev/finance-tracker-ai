const BASE_URL = "http://127.0.0.1:8000/api";

export const apiClient = {

  async post(endpoint, data = {}) {

    const token = localStorage.getItem("access_token");

    const response = await fetch(`${BASE_URL}${endpoint}`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${token}`

      },

      body: JSON.stringify(data),

    });

    if (!response.ok) {

      throw new Error(`API failed: ${response.status}`);

    }

    return response.json();

  },

};