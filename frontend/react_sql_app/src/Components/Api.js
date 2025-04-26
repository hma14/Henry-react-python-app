const AUTH_URL = "https://localhost:5006/api/auth/";
const api = {
  async register(data) {
    return fetch(`${AUTH_URL}signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());
    //.catch((error) => console.error("Error:", error));
  },

  async login(username, password) {
    return fetch(`${AUTH_URL}login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
  },

  async confirmEmail(token) {
    return fetch(`${AUTH_URL}confirm?token=${token}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};

export default api;
