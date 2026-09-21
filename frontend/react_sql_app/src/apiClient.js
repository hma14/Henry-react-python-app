import axios from "axios";

const apiClient = axios.create({
  //baseURL: "http://localhost:5001",
  baseURL: "http://ep.lottotry.com:5001",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
