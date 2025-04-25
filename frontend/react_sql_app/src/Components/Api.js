const api = {
  async register(data) {
    return fetch("https://localhost:5006/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  async login(username, password) {
    return fetch("https://localhost:5006/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
  },

  async confirmEmail(token) {
    return fetch(`https://localhost:5005/api/auth/confirm?token=${token}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};

export default api;
