import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuthContext();

  // Tunggu loading selesai agar data user tidak null saat dicek
  if (loading) return <div style={{ padding: 20 }}>Memvalidasi Akses...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    // 1. Ubah input role (string/array) menjadi array huruf kecil & tanpa spasi
    const allowedRoles = (Array.isArray(role) ? role : [role]).map(r => 
      r.toLowerCase().trim()
    );

    // 2. Ambil role user, bersihkan juga
    const userRole = user.role.toLowerCase().trim();

    // 3. Log untuk debugging di console
    console.log("DEBUG ROLE:", { 
      "Role di Database": userRole, 
      "Izin di AppRoutes": allowedRoles,
      "Hasil Cocok?": allowedRoles.includes(userRole)
    });

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}