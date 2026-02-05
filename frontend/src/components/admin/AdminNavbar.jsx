import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useState } from "react"; // Tambahkan useState
// ✅ Import logo untuk bagian kiri navbar
import logoImg from "../../assets/logo_patroli.png"; 

export default function AdminNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation(); 

  // State untuk Modal Logout Kustom
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.navbar}>
        {/* --- KIRI: LOGO & MENU --- */}
        <div style={styles.leftSection}>
          <div style={styles.logoContainer} onClick={() => navigate("/admin/dashboard")}>
            <div style={styles.logoCircle}>
              <img src={logoImg} alt="Logo RS" style={styles.logoImage} />
            </div>
            <span style={styles.brandName}>RS Islam Fatimah Cilacap</span>
          </div>

          <div style={styles.menuLinks}>
            <Link to="/admin/dashboard" style={isActive("/admin/dashboard") ? styles.activeNavLink : styles.navLink}>
              Dashboard
            </Link>
            <Link to="/admin/reports" style={isActive("/admin/reports") ? styles.activeNavLink : styles.navLink}>
              Reports
            </Link>
            <Link to="/admin/users" style={isActive("/admin/users") ? styles.activeNavLink : styles.navLink}>
              Kelola User
            </Link>
          </div>
        </div>

        {/* --- KANAN: USER PROFILE & LOGOUT --- */}
        <div style={styles.rightSection}>
          <div style={styles.userInfo}>
            <div style={styles.adminIcon}>👤</div>
            <div style={styles.userDetail}>
              <span style={styles.userName}>{user?.name || "Administrator"}</span>
              <span style={styles.userRole}>Super Admin</span>
            </div>
          </div>

          {/* Trigger Modal Kustom */}
          <button onClick={() => setShowLogoutModal(true)} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* --- KUSTOM MODAL LOGOUT (SENADA DENGAN UI LAIN) --- */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>⚠️</div>
              <h3 style={styles.modalTitle}>Konfirmasi Keluar</h3>
            </div>
            <p style={styles.modalBody}>
              Apakah Anda yakin ingin mengakhiri sesi dan keluar dari sistem <b>RS Islam Fatimah</b>?
            </p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.btnCancel}>
                Batal
              </button>
              <button onClick={confirmLogout} style={styles.btnConfirm}>
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- STYLES OBJECT ---
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    height: "75px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "'Inter', sans-serif",
  },
  leftSection: { display: "flex", alignItems: "center", gap: "50px" },
  logoContainer: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" },
  logoCircle: {
    width: "40px",
    height: "40px",
    backgroundColor: "#064e3b", 
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 8px rgba(6, 78, 59, 0.2)",
  },
  logoImage: { width: "70%", height: "70%", objectFit: "contain" },
  brandName: { fontSize: "18px", fontWeight: "800", color: "#064e3b", letterSpacing: "-0.5px" },
  menuLinks: { display: "flex", gap: "30px", height: "75px", alignItems: "center" },
  navLink: { textDecoration: "none", color: "#64748b", fontSize: "15px", fontWeight: "600", transition: "color 0.2s" },
  activeNavLink: {
    textDecoration: "none",
    color: "#064e3b",
    fontSize: "15px",
    fontWeight: "700",
    borderBottom: "3px solid #b08d00",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  rightSection: { display: "flex", alignItems: "center", gap: "25px" },
  userInfo: { display: "flex", alignItems: "center", gap: "12px", paddingRight: "20px", borderRight: "1px solid #e2e8f0" },
  adminIcon: { fontSize: "18px", color: "#64748b" },
  userDetail: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "14px", fontWeight: "700", color: "#1e293b", lineHeight: "1.2" },
  userRole: { fontSize: "11px", color: "#94a3b8", fontWeight: "500" },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#fff",
    color: "#be123c",
    border: "1.5px solid #be123c",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  /* --- MODAL STYLES (SENADA DENGAN UI DASHBOARD) --- */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.6)", // Overlay gelap elegan
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "400px",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
    textAlign: "center",
  },
  modalHeader: { marginBottom: "20px" },
  modalIconBox: {
    width: "60px",
    height: "60px",
    backgroundColor: "#fef2f2",
    color: "#be123c",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    margin: "0 auto 15px auto",
    border: "1px solid #fee2e2",
  },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 },
  modalBody: { fontSize: "15px", color: "#64748b", lineHeight: "1.6", marginBottom: "30px" },
  modalFooter: { display: "flex", gap: "12px", justifyContent: "center" },
  btnCancel: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#64748b",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnConfirm: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#064e3b", // Hijau Tua senada RS
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(6, 78, 59, 0.2)",
  },
};