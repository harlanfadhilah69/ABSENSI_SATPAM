import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useState, useEffect } from "react"; 
import logoImg from "../../assets/logo_patroli.png"; 

export default function AdminNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation(); 

  const isViewer = user?.role?.toLowerCase().trim() === "viewer";

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* --- KIRI: LOGO --- */}
          <div style={styles.logoSection} onClick={() => navigate("/admin/dashboard")}>
            <div style={styles.logoWrapper}>
              <img src={logoImg} alt="Logo RS" style={styles.logoImage} />
            </div>
            {!isMobile && <span style={styles.brandName}>RS Islam Fatimah Cilacap</span>}
            {isMobile && <span style={styles.brandNameSmall}>RSIFC Admin</span>}
          </div>

          {/* --- TENGAH: MENU (DESKTOP ONLY) --- */}
          {!isMobile && (
            <div style={styles.menuLinks}>
              <Link to="/admin/dashboard" style={isActive("/admin/dashboard") ? styles.activeNavLink : styles.navLink}>
                Dashboard
              </Link>
              
              <Link to="/admin/monitor" style={isActive("/admin/monitor") ? styles.activeNavLink : styles.navLink}>
                Monitor Misi
              </Link>

              {/* ✅ TOMBOL DAFTAR POS (KELOLA POS) */}
              <Link to="/admin/posts" style={isActive("/admin/posts") ? styles.activeNavLink : styles.navLink}>
                Daftar Pos
              </Link>

              <Link to="/admin/reports" style={isActive("/admin/reports") ? styles.activeNavLink : styles.navLink}>
                Reports
              </Link>
              
              <Link to="/admin/users" style={isActive("/admin/users") ? styles.activeNavLink : styles.navLink}>
                Kelola User
              </Link>
            </div>
          )}

          {/* --- KANAN: USER & BURGER --- */}
          <div style={styles.rightSection}>
            {!isMobile && (
              <div style={styles.userInfo}>
                <div style={styles.userDetail}>
                  <span style={styles.userName}>{user?.name || "User"}</span>
                  <span style={{...styles.userRole, color: isViewer ? "#0369a1" : "#94a3b8"}}>
                    {isViewer ? "Viewer Mode" : "Super Admin"}
                  </span>
                </div>
                <div style={styles.adminIcon}>{isViewer ? "👓" : "👤"}</div>
              </div>
            )}

            {!isMobile && (
              <button onClick={() => setShowLogoutModal(true)} style={styles.logoutBtn}>
                Logout
              </button>
            )}

            {isMobile && (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={styles.burgerBtn}>
                {isMenuOpen ? "✕" : "☰"}
              </button>
            )}
          </div>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        {isMobile && isMenuOpen && (
          <div style={styles.mobileDropdown}>
            <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} style={isActive("/admin/dashboard") ? styles.mobileActiveLink : styles.mobileLink}>
              🏠 Dashboard
            </Link>

            <Link to="/admin/monitor" onClick={() => setIsMenuOpen(false)} style={isActive("/admin/monitor") ? styles.mobileActiveLink : styles.mobileLink}>
              🛡️ Monitor Misi
            </Link>

            {/* ✅ DAFTAR POS DI MOBILE */}
            <Link to="/admin/posts" onClick={() => setIsMenuOpen(false)} style={isActive("/admin/posts") ? styles.mobileActiveLink : styles.mobileLink}>
              🏢 Kelola Pos
            </Link>

            <Link to="/admin/reports" onClick={() => setIsMenuOpen(false)} style={isActive("/admin/reports") ? styles.mobileActiveLink : styles.mobileLink}>
              📄 Reports
            </Link>
            
            <Link to="/admin/users" onClick={() => setIsMenuOpen(false)} style={isActive("/admin/users") ? styles.mobileActiveLink : styles.mobileLink}>
              👥 Kelola User
            </Link>

            <div style={styles.mobileUserSection}>
               <div style={{fontSize: '14px', fontWeight: '700'}}>{user?.name}</div>
               <div style={{fontSize: '11px', color: isViewer ? '#0369a1' : '#94a3b8'}}>
                 {isViewer ? "Viewer Mode" : "Administrator System"}
               </div>
            </div>
            <button onClick={() => { setIsMenuOpen(false); setShowLogoutModal(true); }} style={styles.mobileLogoutBtn}>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* --- KUSTOM MODAL LOGOUT --- */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIconBox}>⚠️</div>
            <h3 style={styles.modalTitle}>Konfirmasi Keluar</h3>
            <p style={styles.modalBody}>Yakin ingin mengakhiri sesi manajemen <b>RS Islam Fatimah</b>?</p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.btnCancel}>Batal</button>
              <button onClick={confirmLogout} style={styles.btnConfirm}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  navbar: { backgroundColor: "#fff", boxShadow: "0 2px 15px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 1000, fontFamily: "'Inter', sans-serif" },
  navContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", height: "70px", maxWidth: "1200px", margin: "0 auto" },
  logoSection: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  logoWrapper: { width: "70px", height: "70px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  logoImage: { width: "100%", height: "100%", objectFit: "contain" },
  brandName: { fontSize: "18px", fontWeight: "800", color: "#064e3b" },
  brandNameSmall: { fontSize: "15px", fontWeight: "800", color: "#064e3b" },
  menuLinks: { display: "flex", gap: "25px", height: "70px", alignItems: "center" },
  navLink: { textDecoration: "none", color: "#64748b", fontSize: "14px", fontWeight: "600", transition: "0.2s" },
  activeNavLink: { textDecoration: "none", color: "#064e3b", fontSize: "14px", fontWeight: "700", borderBottom: "3px solid #b08d00", height: "100%", display: "flex", alignItems: "center" },
  rightSection: { display: "flex", alignItems: "center", gap: "15px" },
  userInfo: { display: "flex", alignItems: "center", gap: "10px", borderRight: "1px solid #f1f5f9", paddingRight: "15px" },
  userDetail: { display: "flex", flexDirection: "column", textAlign: "right" },
  userName: { fontSize: "13px", fontWeight: "700", color: "#1e293b" },
  userRole: { fontSize: "10px" },
  adminIcon: { fontSize: "20px" },
  logoutBtn: { padding: "8px 18px", backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #be123c", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  burgerBtn: { background: "none", border: "none", fontSize: "24px", color: "#064e3b", cursor: "pointer" },
  mobileDropdown: { position: "absolute", top: "70px", left: 0, width: "100%", backgroundColor: "#fff", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", padding: "15px 0", borderTop: "1px solid #f1f5f9" },
  mobileLink: { padding: "15px 25px", textDecoration: "none", color: "#1e293b", fontWeight: "600", fontSize: "14px" },
  mobileActiveLink: { padding: "15px 25px", textDecoration: "none", color: "#064e3b", fontWeight: "800", background: "#f0fdf4", borderLeft: "4px solid #b08d00" },
  mobileUserSection: { padding: "15px 25px", borderTop: "1px solid #f1f5f9", marginTop: "10px" },
  mobileLogoutBtn: { margin: "10px 25px", padding: "12px", backgroundColor: "#be123c", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "90%", maxWidth: "380px", padding: "30px", borderRadius: "20px", textAlign: "center" },
  modalIconBox: { width: "50px", height: "50px", backgroundColor: "#fef2f2", color: "#be123c", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px auto", fontSize: "20px" },
  modalTitle: { fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 },
  modalBody: { fontSize: "14px", color: "#64748b", margin: "15px 0 25px 0" },
  modalFooter: { display: "flex", gap: "10px" },
  btnCancel: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600" },
  btnConfirm: { flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#064e3b", color: "#fff", fontWeight: "600" }
};