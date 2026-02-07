import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; 
// ✅ Import logo patroli
import logoImg from "../../assets/logo_patroli.png";

export default function SatpamNavbar() {
  const nav = useNavigate();
  
  // State untuk deteksi mobile agar ukuran elemen menyesuaikan otomatis
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State untuk Modal Logout Kustom
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    nav("/");
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.container}>
          {/* LOGO & JUDUL - Diperkecil untuk Mobile agar tidak meluber */}
          <div style={styles.brand} onClick={() => nav("/satpam")}>
            <div style={{...styles.logoWrapper, width: isMobile ? "80px" : "80px", height: isMobile ? "80px" : "80px"}}>
              <img src={logoImg} alt="Logo" style={styles.logoImg} />
            </div>
            <div style={styles.textWrapper}>
              <div style={{...styles.mainTitle, fontSize: isMobile ? "16px" : "22px"}}>Dashboard Satpam</div>
              <div style={{...styles.subTitle, fontSize: isMobile ? "10px" : "13px"}}>RS Islam Fatimah</div>
            </div>
          </div>

          {/* MENU KANAN - Menggunakan tombol yang lebih ramping di HP */}
          <div style={{...styles.menu, gap: isMobile ? "8px" : "12px"}}>
            <button onClick={() => nav("/scan")} style={{...styles.btnScan, padding: isMobile ? "8px 12px" : "10px 20px"}}>
              <span style={{ fontSize: isMobile ? '14px' : '18px' }}>📲</span> {!isMobile ? "Scan QR" : "Scan QR"}
            </button>

            <button onClick={() => setShowLogoutModal(true)} style={{...styles.btnLogout, padding: isMobile ? "8px 12px" : "10px 20px"}}>
              <span style={{ fontSize: isMobile ? '14px' : '18px' }}>⬅️</span> {!isMobile ? "Keluar" : "Keluar"}
            </button>
          </div>
        </div>
      </nav>

      {/* --- KUSTOM MODAL LOGOUT (SENADA DENGAN BRAND) --- */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>⚠️</div>
              <h3 style={styles.modalTitle}>Konfirmasi Keluar</h3>
            </div>
            <p style={styles.modalBody}>
              Apakah Anda yakin ingin keluar dari akun petugas keamanan?
            </p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowLogoutModal(false)} style={styles.btnCancel}>
                Batal
              </button>
              <button onClick={confirmLogout} style={styles.btnConfirm}>
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#ffffff",
    borderBottom: "4px solid #b08d00", // Aksen emas tetap dipertahankan
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  
  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", 
  },
  
  logoImg: { 
    width: "100%", 
    height: "100%", 
    objectFit: "contain"
  },
  
  textWrapper: { display: "flex", flexDirection: "column" },
  mainTitle: { fontWeight: "800", color: "#064e3b", lineHeight: "1.1" },
  subTitle: { color: "#6b7280", fontWeight: "600" },
  menu: { display: "flex" },

  btnScan: {
    backgroundColor: "#064e3b", 
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnLogout: {
    backgroundColor: "#fff",
    color: "#be123c",
    border: "1.5px solid #fee2e2",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  /* --- MODAL STYLES --- */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    maxWidth: "380px",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  modalIconBox: {
    width: "50px",
    height: "50px",
    backgroundColor: "#fef2f2",
    color: "#be123c",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    margin: "0 auto 15px auto",
  },
  modalTitle: { fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 },
  modalBody: { fontSize: "14px", color: "#64748b", lineHeight: "1.5", marginBottom: "25px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "center" },
  btnCancel: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#64748b",
    fontWeight: "700",
  },
  btnConfirm: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#064e3b",
    color: "#fff",
    fontWeight: "700",
  },
};