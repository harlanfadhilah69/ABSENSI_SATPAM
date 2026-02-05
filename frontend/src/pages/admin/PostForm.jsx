import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function CreatePost() {
  const nav = useNavigate();

  const [postName, setPostName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!postName.trim()) {
      setMsg("Nama pos wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/posts", {
        post_name: postName,
        location_desc: locationDesc,
      });

      setMsg("✅ Pos berhasil dibuat");
      setTimeout(() => nav("/admin/dashboard"), 800);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Gagal membuat pos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
          <AdminNavbar />

      <div style={styles.container}>
        {/* --- TOP NAVIGATION AREA --- */}
        <div style={styles.topNav}>
          <div style={styles.breadcrumb}>
            Dashboard <span style={{ margin: "0 8px", color: "#cbd5e1" }}>›</span> 
            <span style={{ color: "#1e293b", fontWeight: "700" }}>Tambah Pos</span>
          </div>
          <button onClick={() => nav("/admin/dashboard")} style={styles.btnBack}>
            ← Kembali
          </button>
        </div>

        {/* --- PAGE TITLE --- */}
        <h1 style={styles.pageTitle}>Tambah Pos Keamanan</h1>

        {/* --- MAIN FORM CARD --- */}
        <div style={styles.card}>
          {msg && (
            <div style={{ 
              padding: "12px 20px", 
              marginBottom: 20, 
              borderRadius: 10, 
              backgroundColor: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
              color: msg.startsWith("✅") ? "#16a34a" : "#dc2626",
              fontSize: "14px",
              fontWeight: "600",
              border: `1px solid ${msg.startsWith("✅") ? "#bcf0da" : "#fecaca"}`
            }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* INPUT NAMA POS */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Pos</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📍</span>
                <input
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  placeholder="Contoh: Pos Lobby Utama"
                  style={styles.input}
                />
              </div>
              <small style={styles.helperText}>Identifikasi unik untuk setiap titik jaga.</small>
            </div>

            {/* INPUT DESKRIPSI LOKASI */}
            <div style={{ ...styles.inputGroup, marginTop: 25 }}>
              <label style={styles.label}>Deskripsi Lokasi</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>ℹ</span>
                <textarea
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder="Contoh: Gedung A, Lantai 1 dekat pintu darurat"
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button style={styles.btnSubmit} disabled={loading}>
              <span style={{ marginRight: 10 }}>💾</span>
              {loading ? "Menyimpan Data..." : "Simpan Data Pos Baru"}
            </button>
          </form>

          <div style={styles.formFooter}>
             🛡️ Sistem Keamanan RS Islam Fatimah
          </div>
        </div>
        
        {/* Floating Decoration Icon */}
        <div style={styles.floatingIcon}>+</div>
      </div>
    </div>
  );
}

// --- STYLES OBJECT ---
const styles = {
  page: { 
    backgroundColor: "#f8fafc", 
    minHeight: "100vh", 
    fontFamily: "'Inter', 'Segoe UI', sans-serif" 
  },
  container: { 
    maxWidth: "800px", 
    margin: "0 auto", 
    padding: "40px 20px",
    position: "relative"
  },
  topNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500"
  },
  btnBack: {
    padding: "8px 20px",
    backgroundColor: "#fff",
    color: "#b08d00",
    border: "1.5px solid #fde68a",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 40px 0"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "45px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
    border: "1px solid #f1f5f9",
    position: "relative",
    overflow: "hidden"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
    marginLeft: "4px"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    fontSize: "18px",
    color: "#94a3b8"
  },
  input: {
    width: "100%",
    padding: "16px 16px 16px 52px",
    borderRadius: "15px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    color: "#1e293b"
  },
  textarea: {
    width: "100%",
    padding: "16px 16px 16px 52px",
    borderRadius: "15px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    minHeight: "120px",
    fontFamily: "inherit",
    resize: "none",
    color: "#1e293b"
  },
  helperText: {
    fontSize: "11px",
    color: "#94a3b8",
    fontStyle: "italic",
    marginLeft: "4px"
  },
  btnSubmit: {
    marginTop: "40px",
    width: "100%",
    padding: "18px",
    backgroundColor: "#064e3b",
    color: "#fff",
    border: "none",
    borderRadius: "15px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(6, 78, 59, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  formFooter: {
    textAlign: "center",
    marginTop: "25px",
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: "600"
  },
  floatingIcon: {
    position: "absolute",
    bottom: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "60px",
    backgroundColor: "#f1f5f9",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    color: "#cbd5e1",
    border: "8px solid #f8fafc"
  }
};