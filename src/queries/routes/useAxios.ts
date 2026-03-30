import axios, { type InternalAxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import { useSessionContext } from "../../contexts/SessionContext";

const axiosInstance = axios.create({ baseURL: "/api/" });

const addAuthHeader = (token: string) => (config: InternalAxiosRequestConfig) => {
  config.headers.Authorization = `Bearer ${token}`;

  return config;
};

export const useAxios = () => {
  const { token } = useSessionContext();
  const [authInterceptorId, setAuthInterceptorId] = useState<number | null>(null);

  useEffect(() => {
    if (axiosInstance && token) {
      const id = axiosInstance?.interceptors.request.use(addAuthHeader(token));
      setAuthInterceptorId(id);
    } else if (axiosInstance && authInterceptorId !== null) {
      axiosInstance?.interceptors.request.eject(authInterceptorId);
      setAuthInterceptorId(null);
    }
  }, [authInterceptorId, token]);

  return axiosInstance;
};
