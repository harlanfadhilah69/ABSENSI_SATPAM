import { useNavigate } from "react-router-dom";

export default function SatpamNavbar() {
  const nav = useNavigate();

  // Fungsi Logout
  const handleLogout = () => {
    const yakin = window.confirm("Apakah Anda yakin ingin keluar?");
    if (yakin) {
      localStorage.clear();
      nav("/");
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* LOGO / JUDUL */}
        <div style={styles.brand} onClick={() => nav("/satpam/dashboard")}>
          👮 Dashboard Satpam
        </div>

        {/* MENU KANAN */}
        <div style={styles.menu}>
          {/* Tombol Scan QR */}
          <button onClick={() => nav("/scan")} style={styles.btnScan}>
            📷 Scan QR
          </button>

          {/* Tombol Logout */}
          <button onClick={handleLogout} style={styles.btnLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// --- STYLING CSS-IN-JS ---
const styles = {
  navbar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    position: "sticky", // Agar navbar nempel di atas saat discroll
    top: 0,
    zIndex: 50,
    width: "100%",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f2937",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  menu: {
    display: "flex",
    gap: "10px",
  },
  btnScan: {
    backgroundColor: "#2563eb", // Biru
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnLogout: {
    backgroundColor: "#dc2626", // Merah
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};