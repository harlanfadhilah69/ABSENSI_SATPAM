import axios from "axios";

/**
 * ✅ LOGIKA DINAMIS
 * Otomatis mendeteksi apakah aplikasi dibuka via localhost atau IP (192.168.0.106).
 * Ini memastikan HP Satpam tetap bisa menghubungi Backend di laptop kamu.
 */
const dynamicBaseURL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : `http://${window.location.hostname}:3000`;

const api = axios.create({
  baseURL: dynamicBaseURL,
  withCredentials: true,
  // ✅ PENTING UNTUK QA: Batas waktu tunggu 10 detik.
  // Jika lebih dari 10 detik tidak ada respon dari server, Axios akan melempar error.
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ INTERSEPTOR REQUEST
// Menyisipkan token JWT secara otomatis ke setiap request API.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ INTERSEPTOR RESPONSE (PENGAMANAN EKSTRA)
// Menangani error secara global, misalnya jika token kadaluwarsa.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server tidak merespon (misal: Laptop mati atau WiFi putus)
    if (!error.response) {
      console.error("Network Error: Periksa koneksi WiFi atau Backend anda.");
    }
    
    // Jika token tidak valid atau kadaluwarsa (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;