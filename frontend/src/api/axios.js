import axios from "axios";

// Deteksi otomatis: jika buka di localhost pakai port 3000, 
// jika buka pakai IP, arahkan ke port 3000 di IP tersebut.
const dynamicBaseURL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : `http://${window.location.hostname}:3000`;

const api = axios.create({
  baseURL: dynamicBaseURL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;