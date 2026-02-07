import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function PostForm() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [postName, setPostName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // --- STATE NOTIFIKASI KUSTOM ---
  const [notif, setNotif] = useState({ show: false, status: "", message: "" });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchPostDetail();
    }
  }, [id]);

  const showNotif = (status, msg) => {
    setNotif({ show: true, status, message: msg });
    // Jika sukses, beri waktu sedikit sebelum pindah halaman
    if (status === "success") {
      setTimeout(() => nav("/admin/dashboard"), 2000);
    } else {
      setTimeout(() => setNotif({ show: false, status: "", message: "" }), 3000);
    }
  };

  async function fetchPostDetail() {
    try {
      const res = await api.get(`/admin/posts/${id}`);
      const responseData = res.data?.data || res.data;
      if (responseData) {
        setPostName(responseData.post_name || "");
        setLocationDesc(responseData.location_desc || "");
      }
    } catch (e) {
      showNotif("error", "Gagal mengambil data pos lama");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { post_name: postName, location_desc: locationDesc };
      
      if (isEdit) {
        await api.put(`/admin/posts/${id}`, payload);
        showNotif("success", "Berhasil! Data pos telah diperbarui.");
      } else {
        await api.post("/admin/posts", payload);
        showNotif("success", "Berhasil! Pos baru telah ditambahkan.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan data";
      showNotif("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {/* BREADCRUMB & HEADER */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            Dashboard  ›  <span style={{ color: "#b08d00", fontWeight: "700" }}>{isEdit ? "Edit Pos" : "Tambah Pos"}</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>
            {isEdit ? "Edit Pos Keamanan" : "Tambah Pos Keamanan"}
          </h1>
        </div>

        {/* FORM CARD */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>NAMA POS</label>
              <input 
                type="text" 
                placeholder="Contoh: Pos Lobby Utama" 
                style={styles.input} 
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                required
              />
              <small style={styles.helperText}>Identifikasi unik untuk setiap titik jaga.</small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>DESKRIPSI LOKASI</label>
              <textarea 
                placeholder="Contoh: Gedung A, Lantai 1 dekat pintu darurat" 
                style={styles.textarea} 
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: 15, marginTop: 30, flexDirection: isMobile ? "column" : "row" }}>
              <button type="submit" disabled={loading} style={styles.btnSave}>
                {loading ? "⌛ Memproses..." : (isEdit ? "💾 Perbarui Data Pos" : "➕ Simpan Pos Baru")}
              </button>
              <button type="button" onClick={() => nav("/admin/dashboard")} style={styles.btnCancel}>
                Batal
              </button>
            </div>
          </form>
        </div>

        <footer style={styles.footer}>
            🛡️ Sistem Keamanan RS Islam Fatimah
        </footer>
      </div>

      {/* --- FLOATING NOTIFICATION (TOAST) --- */}
      {notif.show && (
        <div style={{
          ...styles.notifToast, 
          backgroundColor: notif.status === "success" ? "#064e3b" : "#be123c",
          transform: notif.show ? 'translateY(0)' : 'translateY(-20px)',
          opacity: notif.show ? 1 : 0
        }}>
          {notif.status === "success" ? "✅" : "❌"} {notif.message}
        </div>
      )}
    </div>
  );
}

// --- STYLES OBJECT ---
const styles = {
  card: { backgroundColor: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  inputGroup: { marginBottom: 25 },
  label: { display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: 10, letterSpacing: "0.5px" },
  input: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc" },
  textarea: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", minHeight: "120px", fontFamily: "inherit", backgroundColor: "#f8fafc" },
  helperText: { fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: 8, display: "block" },
  
  btnSave: { flex: 2, backgroundColor: "#064e3b", color: "#fff", padding: "16px", borderRadius: "12px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 12px rgba(6, 78, 59, 0.2)" },
  btnCancel: { flex: 1, backgroundColor: "#fff", color: "#64748b", padding: "16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  
  footer: { textAlign: "center", marginTop: 40, fontSize: "12px", color: "#cbd5e1", fontWeight: "600" },

  // STYLE NOTIFIKASI MELAYANG
  notifToast: { 
    position: "fixed", 
    top: "30px", 
    right: "30px", 
    color: "#fff", 
    padding: "15px 25px", 
    borderRadius: "15px", 
    fontWeight: "700", 
    fontSize: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)", 
    zIndex: 3000, 
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }
};