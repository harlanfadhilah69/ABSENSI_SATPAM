import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  X 
} from "lucide-react"; // ✅ Icon modern
import logoImg from "../../assets/logo_patroli.png";

export default function Sidebar({ isOpen, setIsOpen }) {
  const nav = useNavigate();
  const location = useLocation();

  // ✅ Deteksi Role (Admin/Viewer)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role?.toLowerCase() === "admin";

  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      name: "Laporan Patroli", 
      path: "/admin/reports", 
      icon: <FileText size={20} /> 
    },
    { 
      name: "Kelola User", 
      path: "/admin/users", 
      icon: <Users size={20} /> 
    },
    // ✅ TOMBOL BARU: Kelola Pos Patroli
    { 
      name: "Kelola Pos", 
      path: "/admin/posts", 
      icon: <MapPin size={20} /> 
    },
    { 
      name: "Monitor Misi", 
      path: "/admin/monitor", 
      icon: <ShieldCheck size={20} /> 
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <>
      {/* OVERLAY UNTUK MOBILE */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={styles.overlay} 
        />
      )}

      <aside style={{ 
        ...styles.sidebar, 
        left: isOpen ? 0 : "-300px" 
      }}>
        {/* HEADER SIDEBAR */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <img src={logoImg} alt="Logo" style={styles.logo} />
            <div>
              <div style={styles.brandTitle}>RSIFC Admin</div>
              <div style={styles.brandSub}>Security System</div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={styles.btnClose}>
            <X size={24} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <div style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  nav(item.path);
                  setIsOpen(false);
                }}
                style={{
                  ...styles.menuItem,
                  backgroundColor: isActive ? "#f0fdf4" : "transparent",
                  color: isActive ? "#064e3b" : "#64748b",
                  borderRight: isActive ? "4px solid #b08d00" : "none",
                }}
              >
                <span style={{ color: isActive ? "#064e3b" : "#94a3b8" }}>
                  {item.icon}
                </span>
                <span style={{ fontWeight: isActive ? "800" : "600" }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* FOOTER / USER INFO */}
        <div style={styles.footer}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={styles.userName}>{user.name || "Administrator"}</div>
              <div style={styles.userRole}>{user.role?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.btnLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: "280px",
    backgroundColor: "#ffffff",
    boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
    zIndex: 2000,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1999,
  },
  header: {
    padding: "25px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
  },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { width: "40px", height: "40px", objectFit: "contain" },
  brandTitle: { fontWeight: "900", color: "#064e3b", fontSize: "16px" },
  brandSub: { fontSize: "10px", color: "#94a3b8", fontWeight: "700" },
  btnClose: { background: "none", border: "none", color: "#64748b", cursor: "pointer" },
  menuContainer: { padding: "20px 0", flex: 1 },
  menuItem: {
    width: "100%",
    padding: "15px 25px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fafafa",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#064e3b",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },
  userName: { 
    fontSize: "14px", 
    fontWeight: "800", 
    color: "#1e293b",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden" 
  },
  userRole: { fontSize: "10px", fontWeight: "700", color: "#94a3b8" },
  btnLogout: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#be123c",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },
};