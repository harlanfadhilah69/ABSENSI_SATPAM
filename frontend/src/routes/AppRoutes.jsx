import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/Register";

import Scan from "../pages/satpam/Scan";
import Patrol from "../pages/satpam/Patrol";
import SatpamHome from "../pages/satpam/Home";

import Reports from "../pages/admin/Reports";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PostForm from "../pages/admin/PostForm";
// ✅ Import Halaman Kelola User Baru
import ManageUsers from "../pages/admin/ManageUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* satpam */}
      <Route
        path="/satpam"
        element={
          <ProtectedRoute role="satpam">
            <SatpamHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute role="satpam">
            <Scan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/satpam/patrol"
        element={
          <ProtectedRoute role="satpam">
            <Patrol />
          </ProtectedRoute>
        }
      />

      {/* admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ HALAMAN KELOLA USER */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/posts/new"
        element={
          <ProtectedRoute role="admin">
            <PostForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/posts/:id/edit"
        element={
          <ProtectedRoute role="admin">
            <PostForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* fallback 404 */}
      <Route
        path="*"
        element={<div style={{ padding: 20 }}>404 - Halaman tidak ditemukan</div>}
      />
    </Routes>
  );
}