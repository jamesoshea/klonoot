import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/",
  headers: { "Content-Type": "application/json" },
});

const addAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleError = (error: AxiosError) => {
  console.error(error.message);
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(addAuthHeader);
axiosInstance.interceptors.response.use((response) => response, handleError);

export default axiosInstance;
