// src/api/axios.js
import axios from "axios";

const api = axios.create({
baseURL: "http://192.168.0.113:3000",
withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
