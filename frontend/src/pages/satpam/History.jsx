import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";

export default function History() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIKA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/") ? String(photoPath).slice(1) : String(photoPath);
    return `${baseApi}/${clean}`;
  };

  const formatWaktu = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).replace(/\./g, ':');
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get("/satpam/history");
        setRows(res.data?.data || []);
      } catch (e) {
        setMsg("Gagal memuat riwayat patroli");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // --- PERHITUNGAN DATA PER HALAMAN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={styles.page}>
      <SatpamNavbar />

      <div style={styles.container}>
        <div style={styles.tableCard}>
          <div style={styles.cardHeader}>
            <span style={{ marginRight: 10 }}>🕒</span> Histori Patroli Saya
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th align="left" style={styles.th}>WAKTU</th>
                  <th align="left" style={styles.th}>POS</th>
                  <th align="left" style={styles.th}>CATATAN</th>
                  <th align="left" style={styles.th}>LOKASI (GPS)</th>
                  <th align="center" style={styles.th}>FOTO</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center" style={styles.emptyTd}>
                      {loading ? "Memuat data..." : "Belum ada riwayat patroli."}
                    </td>
                  </tr>
                ) : (
                  currentRows.map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                      <td style={{ ...styles.td, fontWeight: "700", color: "#111827" }}>{r.post_name || r.post_id}</td>
                      <td style={{ ...styles.td, color: "#4b5563" }}>{r.note || "Aman"}</td>
                      <td style={styles.td}>
                        {r.lat && r.lng ? (
                          <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={styles.linkMaps}>
                            <span style={{ fontWeight: '800' }}>📍 Buka Peta</span>
                            <div style={styles.accuracyText}>Akurasi: ±{Math.round(r.accuracy || 0)}m</div>
                          </a>
                        ) : "-"}
                      </td>
                      <td align="center" style={styles.td}>
                        {r.photo_path ? (
                          <div style={styles.photoFrame}>
                            <img src={fotoUrl(r.photo_path)} alt="foto" style={styles.imgThumb} />
                          </div>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- BAGIAN PAGINATION (DIPASTIKAN MUNCUL) --- */}
          {rows.length > 0 && (
            <div style={styles.paginationArea}>
              <div style={styles.pageInfo}>
                Menampilkan <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, rows.length)}</b> dari <b>{rows.length}</b> histori
              </div>
              <div style={styles.pageButtons}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={styles.navBtn}
                >
                  ‹
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      ...styles.pageBtn,
                      backgroundColor: currentPage === i + 1 ? "#b08d00" : "transparent",
                      color: currentPage === i + 1 ? "#fff" : "#6b7280",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={styles.navBtn}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer style={styles.footer}>
        © 2026 <b>RS Islam Fatimah</b>. Sistem Manajemen Keamanan Digital.
      </footer>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f3f4f6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  tableCard: { 
    backgroundColor: "#fff", 
    borderRadius: "15px", 
    overflow: "hidden", 
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", 
    borderTop: "6px solid #b08d00" // Aksen Emas Tebal
  },
  cardHeader: { padding: "24px", fontSize: "18px", fontWeight: "800", color: "#1f2937", borderBottom: "1px solid #f3f4f6" },
  table: { borderCollapse: "collapse" },
  tableHeader: { background: "#f9fafb" },
  th: { padding: "15px 24px", fontSize: "11px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", borderBottom: "1px solid #f3f4f6" },
  td: { padding: "18px 24px", fontSize: "14px", borderBottom: "1px solid #f3f4f6" },
  emptyTd: { padding: "60px", color: "#9ca3af" },
  tr: { transition: "background 0.2s" },
  linkMaps: { color: "#b08d00", textDecoration: "none", fontSize: "12px" },
  accuracyText: { fontSize: "10px", color: "#9ca3af", marginTop: "4px" },
  photoFrame: { width: "48px", height: "48px", borderRadius: "12px", overflow: "hidden", border: "2px solid #f3f4f6", backgroundColor: "#f9fafb" },
  imgThumb: { width: "100%", height: "100%", objectFit: "cover" },
  
  // --- STYLE PAGINATION AREA ---
  paginationArea: { 
    padding: "20px 24px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    background: "#fff",
    borderTop: "1px solid #f3f4f6" // Memastikan batas antara tabel dan pagination jelas
  },
  pageInfo: { fontSize: "13px", color: "#94a3b8" },
  pageButtons: { display: "flex", gap: "6px", alignItems: "center" },
  pageBtn: { border: "none", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "800" },
  navBtn: { border: "none", background: "transparent", color: "#cbd5e1", fontSize: "22px", cursor: "pointer" },
  footer: { textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "11px" }
};