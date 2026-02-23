import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
// ✅ Import SweetAlert2
import Swal from 'sweetalert2';

export default function PostForm() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [postName, setPostName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // ✅ AMBIL DATA ROLE USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isViewer = user.role === "viewer";

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

  async function fetchPostDetail() {
    try {
      const res = await api.get(`/admin/posts/${id}`);
      const responseData = res.data?.data || res.data;
      if (responseData) {
        setPostName(responseData.post_name || "");
        setLocationDesc(responseData.location_desc || "");
        setLat(responseData.lat || "");
        setLng(responseData.lng || "");
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: 'Data pos lama tidak ditemukan.',
        confirmButtonColor: '#be123c'
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewer) return; 
    
    setLoading(true);
    try {
      const payload = { 
        post_name: postName, 
        location_desc: locationDesc,
        lat: lat,
        lng: lng 
      };
      
      let res;
      if (isEdit) {
        res = await api.put(`/admin/posts/${id}`, payload);
      } else {
        res = await api.post("/admin/posts", payload);
      }

      // ✅ NOTIFIKASI BERHASIL (SWEETALERT2)
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Data Diperbarui!' : 'Pos Ditambahkan!',
        text: 'Data pos keamanan berhasil disimpan ke sistem.',
        confirmButtonColor: '#064e3b',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        nav("/admin/posts"); // ✅ Arahkan ke daftar pos
      });

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan data ke database.";
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: errorMsg,
        confirmButtonColor: '#be123c'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            Daftar Pos  ›  <span style={{ color: "#b08d00", fontWeight: "700" }}>{isEdit ? "Edit Pos" : "Tambah Pos"}</span>
            {isViewer && <span style={{ marginLeft: 10, color: "#be123c", fontWeight: "bold" }}>(MODE LIHAT SAJA)</span>}
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>
            {isEdit ? (isViewer ? "Detail Pos Keamanan" : "Edit Pos Keamanan") : "Tambah Pos Keamanan"}
          </h1>
        </div>

        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>NAMA POS</label>
              <input 
                type="text" 
                placeholder="Contoh: Pos Lobby Utama" 
                style={isViewer ? styles.inputDisabled : styles.input} 
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                required
                disabled={isViewer} 
              />
              {!isViewer && <small style={styles.helperText}>Identifikasi unik untuk setiap titik jaga.</small>}
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: 25, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>LATITUDE CHECKPOINT</label>
                <input 
                  type="text" 
                  placeholder="Contoh: -7.71234" 
                  style={isViewer ? styles.inputDisabled : styles.input} 
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  disabled={isViewer} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>LONGITUDE CHECKPOINT</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 109.12345" 
                  style={isViewer ? styles.inputDisabled : styles.input} 
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  disabled={isViewer} 
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>DESKRIPSI LOKASI</label>
              <textarea 
                placeholder="Contoh: Gedung A, Lantai 1 dekat pintu darurat" 
                style={isViewer ? styles.textareaDisabled : styles.textarea} 
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                required
                disabled={isViewer} 
              />
            </div>

            <div style={{ display: "flex", gap: 15, marginTop: 30, flexDirection: isMobile ? "column" : "row" }}>
              {!isViewer ? (
                <button type="submit" disabled={loading} style={styles.btnSave}>
                  {loading ? "⌛ Memproses..." : (isEdit ? "💾 Perbarui Data Pos" : "➕ Simpan Pos Baru")}
                </button>
              ) : (
                <div style={{ flex: 2, color: "#64748b", fontSize: "14px", fontStyle: "italic", alignSelf: "center" }}>
                  *Anda tidak memiliki izin untuk mengubah data ini.
                </div>
              )}
              
              <button type="button" onClick={() => nav("/admin/posts")} style={styles.btnCancel}>
                {isViewer ? "Kembali ke Daftar Pos" : "Batal"}
              </button>
            </div>
          </form>
        </div>

        <footer style={styles.footer}>
            🛡️ Sistem Keamanan RS Islam Fatimah
        </footer>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  inputGroup: { marginBottom: 25 },
  label: { display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: 10, letterSpacing: "0.5px" },
  input: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc" },
  inputDisabled: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", backgroundColor: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
  textarea: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", minHeight: "120px", fontFamily: "inherit", backgroundColor: "#f8fafc" },
  textareaDisabled: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", boxSizing: "border-box", minHeight: "120px", fontFamily: "inherit", backgroundColor: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
  helperText: { fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: 8, display: "block" },
  btnSave: { flex: 2, backgroundColor: "#064e3b", color: "#fff", padding: "16px", borderRadius: "12px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 12px rgba(6, 78, 59, 0.2)" },
  btnCancel: { flex: 1, backgroundColor: "#fff", color: "#64748b", padding: "16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  footer: { textAlign: "center", marginTop: 40, fontSize: "12px", color: "#cbd5e1", fontWeight: "600" },
};