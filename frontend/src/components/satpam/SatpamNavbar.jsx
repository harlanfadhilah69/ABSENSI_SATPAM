import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; 
import { useAuthContext } from "../../context/AuthContext"; 
import logoImg from "../../assets/logo_patroli.png";
import { Menu, X, LogOut, ScanLine, UserCircle } from "lucide-react"; 

export default function SatpamNavbar() {
  const nav = useNavigate();
  const { user } = useAuthContext();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    nav("/");
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.container}>
          
          {/* LEFT: LOGO & BRAND */}
          <div style={styles.brand} onClick={() => nav("/satpam")}>
            <div style={{...styles.logoWrapper, width: isMobile ? "80px" : "80px", height: isMobile ? "80px" : "80px"}}>
              <img src={logoImg} alt="Logo" style={styles.logoImg} />
            </div>
            <div style={styles.textWrapper}>
              <div style={{...styles.mainTitle, fontSize: isMobile ? "14px" : "18px"}}>
                {isMobile ? "RSIFC PATROL" : "RS ISLAM FATIMAH CILACAP"}
              </div>
              {!isMobile && <div style={styles.subTitle}>Security Dashboard</div>}
            </div>
          </div>

          {/* RIGHT SECTION: PROFILE & ACTIONS */}
          <div style={styles.rightSection}>
            
            <div style={{...styles.profileWrapper, borderRight: isMobile ? "none" : "1.5px solid #f1f5f9"}}>
              <div style={styles.userInfo}>
                <div style={{...styles.userName, fontSize: isMobile ? "11px" : "14px"}}>
                  {isMobile ? user?.name?.split(' ')[0] : user?.name || "Petugas"}
                </div>
                <div style={styles.userRole}>SATPAM</div>
              </div>
              <UserCircle size={isMobile ? 28 : 32} color="#94a3b8" />
            </div>

            {!isMobile ? (
              // ✅ PERBAIKAN TAMPILAN DESKTOP: Ubah /scan menjadi /satpam/scan
              <div style={styles.menuDesktop}>
                <button onClick={() => nav("/satpam/scan")} style={styles.btnScan}>
                  <ScanLine size={16} /> Scan QR
                </button>
                <button onClick={() => setShowLogoutModal(true)} style={styles.btnLogout}>
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <button style={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          {/* DROPDOWN KHUSUS HP */}
          {isMobile && isMenuOpen && (
            <div style={styles.mobileDropdown}>
              {/* ✅ PERBAIKAN TAMPILAN MOBILE: Ubah /scan menjadi /satpam/scan */}
              <button onClick={() => { nav("/satpam/scan"); setIsMenuOpen(false); }} style={styles.dropdownItem}>
                <ScanLine size={18} /> Scan QR Jaga
              </button>
              <button onClick={() => { setShowLogoutModal(true); setIsMenuOpen(false); }} style={styles.dropdownItemDanger}>
                <LogOut size={18} /> Keluar Sistem
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIconBox}><LogOut size={24} /></div>
            <h3 style={styles.modalTitle}>Konfirmasi Keluar</h3>
            <p style={styles.modalBody}>Yakin ingin mengakhiri sesi patroli?</p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.btnCancel}>Batal</button>
              <button onClick={confirmLogout} style={styles.btnConfirm}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Styles tetap sama seperti kode Anda
const styles = {
  navbar: { backgroundColor: "#ffffff", borderBottom: "4px solid #b08d00", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 1000, width: "100%", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" },
  brand: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  logoWrapper: { display: "flex", justifyContent: "center", alignItems: "center" },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  textWrapper: { display: "flex", flexDirection: "column" },
  mainTitle: { fontWeight: "900", color: "#064e3b", lineHeight: "1.1" },
  subTitle: { color: "#94a3b8", fontWeight: "700", fontSize: "12px", textTransform: 'uppercase' },
  rightSection: { display: "flex", alignItems: "center", gap: "15px" },
  profileWrapper: { display: "flex", alignItems: "center", gap: "10px", paddingRight: "10px" },
  userInfo: { textAlign: "right" },
  userName: { fontWeight: "800", color: "#1e293b", lineHeight: "1.2" },
  userRole: { color: "#94a3b8", fontWeight: "700", fontSize: "9px" },
  menuDesktop: { display: "flex", gap: "10px", marginLeft: "10px" },
  btnScan: { backgroundColor: "#064e3b", color: "white", border: "none", borderRadius: "8px", padding: "8px 15px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnLogout: { backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #fee2e2", padding: "8px 15px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  menuToggle: { background: "none", border: "none", color: "#064e3b", cursor: "pointer", display: "flex" },
  mobileDropdown: { position: "absolute", top: "100%", right: "15px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9", width: "190px", marginTop: "10px", overflow: "hidden" },
  dropdownItem: { width: "100%", padding: "12px 15px", border: "none", background: "none", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" },
  dropdownItemDanger: { width: "100%", padding: "12px 15px", border: "none", background: "#fff1f2", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700", color: "#be123c", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "85%", maxWidth: "320px", padding: "25px", borderRadius: "20px", textAlign: "center" },
  modalIconBox: { width: "50px", height: "50px", backgroundColor: "#fff1f2", color: "#be123c", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px" },
  modalTitle: { fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 },
  modalBody: { fontSize: "14px", color: "#64748b", lineHeight: "1.5", margin: "10px 0 25px" },
  modalFooter: { display: "flex", gap: "10px" },
  btnCancel: { flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontWeight: "700" },
  btnConfirm: { flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#064e3b", color: "#fff", fontWeight: "700" },
};