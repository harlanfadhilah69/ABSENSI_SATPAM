import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/Register";

import Scan from "../pages/satpam/Scan";
import Patrol from "../pages/satpam/Patrol";
import SatpamHome from "../pages/satpam/Home"; 
import MissionDashboard from "../pages/satpam/MissionDashboard"; 

import Reports from "../pages/admin/Reports";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PostForm from "../pages/admin/PostForm";
import ManageUsers from "../pages/admin/ManageUsers";
import MonitorMisi from "../pages/admin/MonitorMisi";
import ManagePosts from "../pages/admin/ManagePosts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dasar & Auth */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ PERBAIKAN UTAMA: Tambahkan rute global /scan agar sinkron dengan QR Code */}
      <Route path="/scan" element={<Scan />} />

      {/* --- RUTE SATPAM --- */}
      <Route
        path="/satpam"
        element={<ProtectedRoute role="satpam"><SatpamHome /></ProtectedRoute>}
      />
      <Route
        path="/satpam/missions"
        element={<ProtectedRoute role="satpam"><MissionDashboard /></ProtectedRoute>}
      />
      <Route
        path="/satpam/scan"
        element={<ProtectedRoute role="satpam"><Scan /></ProtectedRoute>}
      />
      <Route
        path="/satpam/patrol"
        element={<ProtectedRoute role="satpam"><Patrol /></ProtectedRoute>}
      />

      {/* --- RUTE ADMIN & VIEWER --- */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role={["admin", "viewer"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role={["admin", "viewer"]}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/posts/new" element={<ProtectedRoute role={["admin", "viewer"]}><PostForm /></ProtectedRoute>} />
      <Route path="/admin/posts/:id/edit" element={<ProtectedRoute role={["admin", "viewer"]}><PostForm /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role={["admin", "viewer"]}><Reports /></ProtectedRoute>} />
      <Route path="/admin/monitor" element={<ProtectedRoute role={["admin", "viewer"]}><MonitorMisi /></ProtectedRoute>} />
      <Route path="/admin/posts" element={<ProtectedRoute allowedRoles={["admin", "viewer"]}> <ManagePosts /></ProtectedRoute>} />
      {/* 404 Handler */}
      <Route path="*" element={<div style={{ padding: 20 }}>404 - Halaman tidak ditemukan</div>} />
    </Routes>
  );
}