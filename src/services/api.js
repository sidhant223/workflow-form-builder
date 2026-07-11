// src/services/api.js
// Shared Axios instance for every service module: base URL, default headers,
// a request timeout, a mock bearer-token header (see src/store/authStore.js),
// and a response interceptor that normalizes every failure into
// { message, status } so callers never have to branch on axios's error shape.

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // 30s: tolerates the hosted API's cold start (free-tier hosts spin down
  // when idle and take ~30-60s to wake). Locally the API responds instantly.
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject({ message, status: error.response?.status ?? null });
  }
);

export default api;
