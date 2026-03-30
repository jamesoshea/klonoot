import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({ baseURL: "/api/" });

const addAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleError = (error: AxiosError) => {
  alert(JSON.stringify(error.message));
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(addAuthHeader);
axiosInstance.interceptors.response.use((response) => response, handleError);

export default axiosInstance;
