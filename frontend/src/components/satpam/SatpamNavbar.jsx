import { useNavigate } from "react-router-dom";
import { useState } from "react"; // Tambahkan useState
// ✅ Import logo patroli
import logoImg from "../../assets/logo_patroli.png";

export default function SatpamNavbar() {
  const nav = useNavigate();
  
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
          {/* LOGO & JUDUL */}
          <div style={styles.brand} onClick={() => nav("/satpam")}>
            <div style={styles.logoWrapper}>
              <img src={logoImg} alt="Logo" style={styles.logoImg} />
            </div>
            <div style={styles.textWrapper}>
              <div style={styles.mainTitle}>Dashboard Satpam</div>
              <div style={styles.subTitle}>RS Islam Fatimah</div>
            </div>
          </div>

          {/* MENU KANAN */}
          <div style={styles.menu}>
            <button onClick={() => nav("/scan")} style={styles.btnScan}>
              <span style={{ fontSize: '18px' }}>📲</span> Scan QR
            </button>

            <button onClick={() => setShowLogoutModal(true)} style={styles.btnLogout}>
              <span style={{ fontSize: '18px' }}>⬅️</span> Keluar
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
              Apakah Anda yakin ingin keluar dari akun petugas keamanan <b>RS Islam Fatimah</b>?
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
    borderBottom: "4px solid #b08d00", // Aksen emas
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
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" },
  logoWrapper: {
    width: "45px",
    height: "45px",
    backgroundColor: "#064e3b", // Hijau Tua sesuai Brand
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logoImg: { width: "75%", height: "75%", objectFit: "contain" },
  textWrapper: { display: "flex", flexDirection: "column" },
  mainTitle: { fontSize: "16px", fontWeight: "800", color: "#064e3b", lineHeight: "1.2" },
  subTitle: { fontSize: "11px", color: "#6b7280", fontWeight: "600" },
  menu: { display: "flex", gap: "12px" },
  btnScan: {
    backgroundColor: "#064e3b", 
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  btnLogout: {
    backgroundColor: "#fff",
    color: "#be123c",
    border: "1.5px solid #fee2e2",
    padding: "8px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  /* --- MODAL STYLES --- */
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
    width: "90%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
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
  modalBody: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "30px" },
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
    backgroundColor: "#064e3b", // Hijau Tua senada Brand
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};