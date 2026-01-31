import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get("/auth/me");
      const me = res.data?.user ?? res.data; // support {user:{...}} atau langsung {...}
      setUser(me || null);
      setLoading(false);
      return me || null;
    } catch (e) {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });

    const token = res.data?.token;
    if (!token) throw new Error("Token tidak ditemukan dari response /auth/login");

    localStorage.setItem("token", token);
    await fetchMe();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshMe: fetchMe,
      setUser, // optional kalau kamu butuh
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
