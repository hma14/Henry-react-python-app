import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5001",
  //baseURL: "http://ep.lottotry.com:5001",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  console.log("REQUEST INTERCEPTOR:", config.url, token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          "http://api.lottotry.com/api/auth/refresh",
          {
            refreshToken: refreshToken,
          },
          /* "https://localhost:5006/api/auth/refresh",
          {
            refreshToken: refreshToken,
          },*/
        );

        const newAccessToken = response.data.accessToken;

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // IMPORTANT:
        // Explicitly replace Authorization on the original request
        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log("RETRY AUTH:", originalRequest.headers.Authorization);

        // Try original request again
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log(
          "Refresh token expired or invalid:",
          refreshError.response?.data,
        );

        // Refresh failed → user must login again
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
