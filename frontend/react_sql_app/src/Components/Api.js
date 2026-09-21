const AUTH_URL = "https://localhost:5006/api/auth/";

//const AUTH_URL = "http://api.lottotry.com/api/auth/";

async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Access token expired
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("Session expired. Please login again.");
    }

    // Get a new access token
    const refreshResponse = await fetch(`${AUTH_URL}refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      // Refresh token is also invalid/expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      throw new Error("Session expired. Please login again.");
    }

    const tokens = await refreshResponse.json();

    // Save the new tokens
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    // Retry original request with new access token
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  return response;
}

const api = {
  async register(data) {
    return fetch(`${AUTH_URL}signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },

  async login(email, password) {
    return fetch(`${AUTH_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json());
  },

  async confirmEmail(token) {
    const encodedToken = encodeURIComponent(token);

    console.log("Confirm token:", encodedToken);

    return fetch(`${AUTH_URL}confirm?token=${encodedToken}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await fetch(`${AUTH_URL}refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      throw new Error("Refresh token expired or invalid.");
    }

    const data = await response.json();

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return data;
  },

  // Use this for protected API calls
  fetchWithAuth,
};

export default api;
