import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuthContext();

  // kalau user masih null tapi token ada, tunggu dulu (loading)
  const token = localStorage.getItem("token");
  if (!user && token) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // belum login
  if (!user) return <Navigate to="/login" replace />;

  // role tidak sesuai
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
